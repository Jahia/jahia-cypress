/**
 * Checks that a Jahia holds every module a provisioning manifest installs, in the state the manifest
 * asks for. env.readiness.sh runs it once env.provision.sh ran, because the provisioning API answers
 * 200 whatever happened to each operation: a module the Maven repository could not serve is only an
 * ERROR line in the log of Jahia, and the suite would otherwise run on a platform that misses it.
 *
 *   node dist/cli/provisioningCheck.js --manifest <file> --url <jahia> --password <password>
 *                                      [--assets <dir>] [--user root] [--ignore id,id] [--timeout <seconds>]
 *
 * --assets names the folder whose files env.provision.sh submits with the manifest, where an include
 * finds the manifest it names. It defaults to assets.
 *
 * Exits 0 when every module is there, 1 when one is missing or not started, and 2 when the check
 * itself could not run.
 */
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import {parse} from 'yaml';

/**
 * The operation keys that install a module, with the rule Jahia applies to start it (InstallModule in
 * jahia-private): installAndStart* always starts, installOrUpgrade* starts unless the entry says
 * `autoStart: false`, and installBundle/installModule start only when the entry says `autoStart: true`.
 */
const INSTALL_KEYS: Record<string, 'always' | 'unlessRefused' | 'onlyAsked'> = {
    installBundle: 'onlyAsked',
    installModule: 'onlyAsked',
    installAndStartBundle: 'always',
    installAndStartModule: 'always',
    installOrUpgradeBundle: 'unlessRefused',
    installOrUpgradeModule: 'unlessRefused'
};

/** The module states of Jahia that end in STARTED on their own, so the check reads them again. */
const TRANSIENT_STATES = ['STARTING', 'WAITING_TO_BE_IMPORTED', 'SPRING_STARTING'];

/** `mvn:group/artifact[/version[/type]]`, with the `js:` prefix of a JavaScript module. */
const MVN_URL = /^(?:js:)?mvn:([^/]+)\/([^/]+)(?:\/([^/]*))?(?:\/.*)?$/;

/** The Maven versions that name no version of their own, so any installed version matches them. */
const ANY_VERSION = ['', 'LATEST', 'RELEASE'];

/**
 * A resource key Jahia fetches as a URL (PATTERN of ProvisioningScriptUtil in jahia-private). Any
 * other key names a file submitted with the manifest.
 */
const URL_KEY = /^[a-z][a-z0-9+.-]+:.*/;

export type ExpectedState = 'STARTED' | 'INSTALLED';

export type ExpectedModule = {
    /** The module id, which is the artifactId of the URL, or the URL itself when the check cannot read it */
    id: string;
    /** The URL as the manifest wrote it */
    url: string;
    /** STARTED when the operation starts the module, INSTALLED when it only installs it */
    expected: ExpectedState;
    /** True for a mvn: URL whose module id the check cannot read, which fails the check */
    unreadable?: boolean;
    /** True for an included manifest no submitted file holds, which fails the check */
    missingInclude?: boolean;
    /** The included manifest that names the module, absent for the manifest the check was given */
    from?: string;
};

/**
 * Reads an included manifest by the name its `include:` gives, the way Jahia finds it among the files
 * submitted with the manifest.
 * @returns {string | undefined} The YAML text, or undefined when no submitted file has that name
 */
export type IncludeReader = (name: string) => string | undefined;

export type ManifestModules = {
    /** The modules of the manifest and of the manifests it includes, in the order Jahia installs them */
    modules: ExpectedModule[];
    /** The includes that name a URL, which the check does not fetch */
    remoteIncludes: string[];
};

/** One entry of the `_localInfo` answer of the module manager API */
export type BundleInfo = {
    /** The OSGi version, such as 8.11.0.SNAPSHOT */
    version: string;
    type: string;
    osgiState: string;
    moduleState: string | null;
};

/** The installed versions of each module, by module id */
export type InstalledModules = Record<string, BundleInfo[]>;

export type ModuleReport = ExpectedModule & {
    /** The state of each installed version, empty when the module is absent */
    found: string[];
    /** The installed versions the URL does not ask for, with their state */
    otherVersions: string[];
    status: 'ok' | 'pending' | 'failed';
};

/**
 * Extracts the module id of a `mvn:` or `js:mvn:` URL.
 * @param {string} url - The URL of a provisioning entry
 * @returns {string | undefined} The artifactId, or undefined for a URL of another kind, such as a file name
 */
export const moduleIdOfUrl = (url: string): string | undefined => {
    const match = MVN_URL.exec(url.trim());
    return match ? match[2] : undefined;
};

/**
 * Extracts the version of a `mvn:` or `js:mvn:` URL, in the form OSGi gives it: Maven writes
 * 8.11.0-SNAPSHOT where the bundle reports 8.11.0.SNAPSHOT.
 * @param {string} url - The URL of a provisioning entry
 * @returns {string | undefined} The version, or undefined when the URL names none, names LATEST or
 * RELEASE, or names a range
 */
export const versionOfUrl = (url: string): string | undefined => {
    const match = MVN_URL.exec(url.trim());
    const version = match && match[3] !== undefined ? match[3] : '';
    if (ANY_VERSION.indexOf(version) >= 0 || /[[\](),]/.test(version)) {
        return undefined;
    }

    return version.replace('-', '.');
};

const startsModule = (key: string, autoStart: unknown): boolean => {
    switch (INSTALL_KEYS[key]) {
        case 'always':
            return true;
        case 'unlessRefused':
            return autoStart !== false;
        default:
            return autoStart === true;
    }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * The items of an operation that takes one value or a list, as convertToList of ProvisioningScriptUtil
 * in jahia-private builds them: a list item is the value, or a map with the value under `url` and
 * options of its own, and each item inherits the options of the entry.
 * @param {Record<string, unknown>} entry - The entry of the manifest
 * @param {string} key - The operation key, such as installBundle or include
 * @returns {Record<string, unknown>[]} The options of each item, with its value under `url`
 */
const itemsOf = (entry: Record<string, unknown>, key: string): Record<string, unknown>[] => {
    const value = entry[key];
    const items: unknown[] = Array.isArray(value) ? value : [value];
    return items.map(item => (typeof item === 'string' ?
        {...entry, url: item} :
        {...entry, ...(isRecord(item) ? item : {})}));
};

/**
 * Lists the modules a manifest installs, with the state each operation leaves them in, and follows its
 * includes the way Jahia runs them: in place, and by the name of a submitted file. An entry under an
 * `if` condition is left out, since Jahia decides it, and so is a local file, whose name does not give
 * the module id. A module two entries name is listed once, STARTED when either entry starts it.
 * @param {string} manifestText - The YAML text of the manifest
 * @param {IncludeReader} [readInclude] - Reads an included manifest; without it, includes are not followed
 * @returns {ManifestModules} The modules, and the includes the check cannot follow
 */
export const readManifest = (manifestText: string, readInclude?: IncludeReader): ManifestModules => {
    const byId: Record<string, ExpectedModule> = {};
    const result: ManifestModules = {modules: [], remoteIncludes: []};

    const addModule = (key: string, options: Record<string, unknown>, from: string | undefined): void => {
        if (typeof options.url !== 'string' || options.if !== undefined) {
            return;
        }

        const origin = from === undefined ? {} : {from};
        const id = moduleIdOfUrl(options.url);
        if (!id) {
            if (/^(?:js:)?mvn:/.test(options.url.trim())) {
                result.modules.push({id: options.url, url: options.url, expected: 'STARTED', unreadable: true, ...origin});
            }

            return;
        }

        const expected: ExpectedState = startsModule(key, options.autoStart) ? 'STARTED' : 'INSTALLED';
        if (byId[id]) {
            if (expected === 'STARTED') {
                byId[id].expected = expected;
            }
        } else {
            byId[id] = {id, url: options.url, expected, ...origin};
            result.modules.push(byId[id]);
        }
    };

    // `including` is the chain of includes that led here, so a manifest that includes itself stops
    const walk = (text: string, from: string | undefined, including: string[]): void => {
        const manifest: unknown = parse(text);
        if (!Array.isArray(manifest)) {
            return;
        }

        manifest.forEach((entry: unknown) => {
            if (!isRecord(entry)) {
                return;
            }

            if ('include' in entry) {
                if (readInclude) {
                    itemsOf(entry, 'include').forEach(options => {
                        const name = options.url;
                        if (typeof name !== 'string' || options.if !== undefined || including.indexOf(name) >= 0) {
                            return;
                        }

                        if (URL_KEY.test(name)) {
                            result.remoteIncludes.push(name);
                            return;
                        }

                        const included = readInclude(name);
                        if (included === undefined) {
                            result.modules.push({id: name, url: name, expected: 'STARTED', missingInclude: true, ...(from === undefined ? {} : {from})});
                            return;
                        }

                        walk(included, name, [...including, name]);
                    });
                }

                return;
            }

            const key = Object.keys(INSTALL_KEYS).find(installKey => installKey in entry);
            if (key) {
                itemsOf(entry, key).forEach(options => addModule(key, options, from));
            }
        });
    };

    walk(manifestText, undefined, []);
    return result;
};

/**
 * Lists the modules a manifest installs, as readManifest does.
 * @param {string} manifestText - The YAML text of the manifest
 * @param {IncludeReader} [readInclude] - Reads an included manifest; without it, includes are not followed
 * @returns {ExpectedModule[]} The modules, in the order Jahia installs them
 */
export const expectedModules = (manifestText: string, readInclude?: IncludeReader): ExpectedModule[] =>
    readManifest(manifestText, readInclude).modules;

/**
 * Indexes the files env.provision.sh submits with the manifest by the name Jahia keys them with, which
 * is the file name without its directory, so an include finds them as Jahia does.
 * @param {string} dir - The assets folder, every file of which env.provision.sh submits
 * @returns {IncludeReader} A reader of the files of the folder
 */
export const assetsReader = (dir: string): IncludeReader => {
    const files: Record<string, string> = {};
    const index = (folder: string): void => {
        fs.readdirSync(folder, {withFileTypes: true}).forEach(file => {
            const filePath = path.join(folder, file.name);
            if (file.isDirectory()) {
                index(filePath);
            } else {
                files[file.name] = filePath;
            }
        });
    };

    if (fs.existsSync(dir)) {
        index(dir);
    }

    return name => (files[name] === undefined ? undefined : fs.readFileSync(files[name], 'utf8'));
};

/**
 * Groups the `_localInfo` answer of the module manager API by module id. The API keys each bundle as
 * `groupId/symbolicName/version`, and a Jahia module uses its symbolicName as its id.
 * @param {unknown} localInfo - The parsed answer of GET /modules/api/bundles/* /_localInfo
 * @returns {InstalledModules} The versions of each module
 */
export const installedModulesOf = (localInfo: unknown): InstalledModules => {
    const installed: InstalledModules = {};
    if (!isRecord(localInfo)) {
        return installed;
    }

    Object.keys(localInfo).forEach(bundleKey => {
        const info = localInfo[bundleKey];
        const [, id, version] = bundleKey.split('/');
        if (!id || !isRecord(info) || info.type !== 'MODULE') {
            return;
        }

        const bundleInfo: BundleInfo = {
            version: version || '',
            type: String(info.type),
            osgiState: String(info.osgiState),
            moduleState: typeof info.moduleState === 'string' ? info.moduleState : null
        };
        installed[id] = [...(installed[id] || []), bundleInfo];
    });
    return installed;
};

/**
 * Compares the modules a manifest expects with the modules a Jahia holds. When the URL names a
 * version, only that version counts, so a failed upgrade does not pass on the version it left.
 * @param {ExpectedModule[]} expected - The modules of the manifest
 * @param {InstalledModules} installed - The modules of the platform
 * @returns {ModuleReport[]} One report per expected module
 */
export const compareModules = (expected: ExpectedModule[], installed: InstalledModules): ModuleReport[] =>
    expected.map(expectedModule => {
        if (expectedModule.unreadable || expectedModule.missingInclude) {
            return {...expectedModule, found: [], otherVersions: [], status: 'failed'};
        }

        const wanted = versionOfUrl(expectedModule.url);
        const all = installed[expectedModule.id] || [];
        const versions = all.filter(version => wanted === undefined || version.version === wanted);
        const otherVersions = all.filter(version => versions.indexOf(version) < 0)
            .map(version => `${version.version} ${version.moduleState || version.osgiState}`);
        const found = versions.map(version => version.moduleState || version.osgiState);
        let status: ModuleReport['status'] = 'failed';
        if (expectedModule.expected === 'INSTALLED' ? versions.length > 0 : found.indexOf('STARTED') >= 0) {
            status = 'ok';
        } else if (found.some(state => TRANSIENT_STATES.indexOf(state) >= 0)) {
            status = 'pending';
        }

        return {...expectedModule, found, otherVersions, status};
    });

const getJson = (url: string, user: string, password: string): Promise<unknown> =>
    new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        const request = client.get(url, {auth: `${user}:${password}`}, response => {
            let body = '';
            response.setEncoding('utf8');
            response.on('data', chunk => {
                body += chunk;
            });
            response.on('end', () => {
                if (response.statusCode !== 200) {
                    reject(new Error(`GET ${url} answered HTTP ${response.statusCode}: ${body.slice(0, 200)}`));
                    return;
                }

                try {
                    resolve(JSON.parse(body));
                } catch {
                    reject(new Error(`GET ${url} answered no JSON: ${body.slice(0, 200)}`));
                }
            });
        });
        request.on('error', reject);
    });

const sleep = (ms: number): Promise<void> => new Promise(resolve => {
    setTimeout(resolve, ms);
});

const log = (message: string): void => console.log(`[READINESS] ${message}`);

/**
 * Names an error, down to the errors an AggregateError holds, which is what a connection refused on
 * every address of a host raises with an empty message.
 * @param {unknown} error - What the check caught
 * @returns {string} The message, or the code or the name of an error with no message
 */
const describeError = (error: unknown): string => {
    if (!(error instanceof Error)) {
        return String(error);
    }

    const {errors, code} = error as Error & {errors?: unknown[]; code?: string};
    if (Array.isArray(errors) && errors.length > 0) {
        return errors.map(describeError).join('; ');
    }

    return error.message || code || error.name;
};

const describe = (report: ModuleReport): string => {
    const origin = report.from === undefined ? '' : `, in ${report.from}`;
    if (report.missingInclude) {
        return `no submitted file is named ${report.url}, which the manifest includes${origin}`;
    }

    if (report.unreadable) {
        return `cannot read the module id of ${report.url}${origin}`;
    }

    const found = report.found.length > 0 ? report.found.join(', ') : 'nothing';
    const others = report.otherVersions.length > 0 ? `, installed: ${report.otherVersions.join(', ')}` : '';
    return `${report.id}: expected ${report.expected}, found ${found}${others} (${report.url}${origin})`;
};

type Args = {
    manifest: string;
    assets: string;
    url: string;
    user: string;
    password: string;
    ignore: string[];
    timeout: number;
};

const parseArgs = (argv: string[]): Args => {
    const values: Record<string, string> = {};
    for (let i = 0; i < argv.length; i += 2) {
        values[argv[i].replace(/^--/, '')] = argv[i + 1] || '';
    }

    if (!values.manifest || !values.url) {
        throw new Error('usage: provisioningCheck --manifest <file> --url <jahia> --password <password> [--assets <dir>] [--user root] [--ignore id,id] [--timeout <seconds>]');
    }

    return {
        manifest: values.manifest,
        assets: values.assets || 'assets',
        url: values.url.replace(/\/$/, ''),
        user: values.user || 'root',
        password: values.password || '',
        ignore: (values.ignore || '').split(',').map(id => id.trim()).filter(id => id !== ''),
        timeout: Number(values.timeout) > 0 ? Number(values.timeout) : 60
    };
};

/**
 * Reads the modules of the platform and compares them with the manifest, again every 5 seconds while
 * a module is in a transient state and the deadline is not reached.
 * @param {Args} args - The connection to the platform
 * @param {ExpectedModule[]} checked - The modules of the manifest
 * @param {number} deadline - The time, in ms since the epoch, after which a transient state is a failure
 * @returns {Promise<ModuleReport[]>} One report per module
 */
const readReports = async (args: Args, checked: ExpectedModule[], deadline: number): Promise<ModuleReport[]> => {
    const localInfo = await getJson(`${args.url}/modules/api/bundles/*/_localInfo`, args.user, args.password);
    const reports = compareModules(checked, installedModulesOf(localInfo));
    const pending = reports.filter(report => report.status === 'pending');
    if (pending.length === 0 || Date.now() >= deadline) {
        return reports;
    }

    log(`waiting for ${pending.map(report => `${report.id} (${report.found.join(', ')})`).join(', ')}`);
    await sleep(5000);
    return readReports(args, checked, deadline);
};

/**
 * Runs the check from the command line and returns its exit code.
 * @param {string[]} argv - The arguments after the script name
 * @returns {Promise<number>} 0 when every module is there, 1 when one is not, 2 when the check could not run
 */
export const main = async (argv: string[]): Promise<number> => {
    const args = parseArgs(argv);
    const {modules: expected, remoteIncludes} = readManifest(fs.readFileSync(args.manifest, 'utf8'), assetsReader(args.assets));
    remoteIncludes.forEach(include => log(`not checked: the modules of ${include}, an include the check does not fetch`));
    const ignored = expected.filter(expectedModule => args.ignore.indexOf(expectedModule.id) >= 0);
    ignored.forEach(expectedModule => log(`ignored ${expectedModule.id} (${expectedModule.url})`));
    const checked = expected.filter(expectedModule => args.ignore.indexOf(expectedModule.id) < 0);
    if (checked.length === 0) {
        log(`${args.manifest} installs no module to check`);
        return 0;
    }

    log(`checking the ${checked.length} module(s) of ${args.manifest} on ${args.url}`);
    const reports = await readReports(args, checked, Date.now() + (args.timeout * 1000));
    reports.filter(report => report.status === 'ok').forEach(report => log(`ok ${describe(report)}`));
    const failed = reports.filter(report => report.status !== 'ok');
    failed.forEach(report => log(`MISSING ${describe(report)}`));
    if (failed.length > 0) {
        log(`${failed.length} of ${checked.length} module(s) of the manifest are missing or not started, see the ERROR lines of jahia.log`);
        return 1;
    }

    log('every module of the manifest is there');
    return 0;
};

if (require.main === module) {
    main(process.argv.slice(2)).then(code => {
        process.exitCode = code;
    }, error => {
        log(`the check could not run: ${describeError(error)}`);
        process.exitCode = 2;
    });
}
