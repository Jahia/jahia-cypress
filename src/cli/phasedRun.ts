#!/usr/bin/env node
/**
 * Runs the Cypress specs of a project in ordered phases against one Jahia: a serial phase is one
 * `cypress run`, a parallel phase splits its specs over several `cypress run` processes started side
 * by side. The phases come from execution-phases.yml, see docs/phased-run.md.
 *
 *   jahia-cypress-run [any `cypress run` option but --spec]
 *
 * CYPRESS_WORKERS sets the width of a parallel phase that names none (default 1, every phase serial),
 * CYPRESS_PHASES_FILE the phases file (default execution-phases.yml), and CYPRESS_REPORTER_CONFIG the
 * reporter configuration copied per run (default reporter-config.json).
 *
 * Exits 0 when every run passed, 1 when one failed, and 2 when the runner could not start.
 */
import {spawn} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import {parse} from 'yaml';

export type Mode = 'serial' | 'parallel';

export type Phase = {
    name: string;
    mode: Mode;
    /** The globs of the specs of the phase; the one phase without any takes every spec no other phase matched */
    specs?: string[];
    /** The width of a parallel phase, which overrides CYPRESS_WORKERS */
    workers?: number;
};

export type PhasesFile = {
    /** The globs of every spec of the run */
    specs: string[];
    /** The globs of the files that are never run */
    exclude: string[];
    phases: Phase[];
};

export type AssignedPhase = Phase & {files: string[]};

type RunResult = {phase: string; worker: number; specs: number; code: number; seconds: number};

const DEFAULT_SPECS = ['cypress/e2e/**/*.ts'];
const DEFAULT_EXCLUDE = ['cypress/e2e/**/*.ignore.ts'];

/** The phases of a project without a phases file */
export const DEFAULT_PHASES: Phase[] = [
    {name: 'begin', mode: 'serial', specs: ['cypress/e2e/**/*.spec.begin.ts']},
    {name: 'serial', mode: 'serial', specs: ['cypress/e2e/**/*.serial.cy.ts']},
    {name: 'parallel', mode: 'parallel'},
    {name: 'end', mode: 'serial', specs: ['cypress/e2e/**/*.spec.end.ts']}
];

/** Delay between the starts of two workers, as several Cypress processes starting their Xvfb at once can collide */
const WORKER_STAGGER_MS = 2000;

const log = (message: string): void => {
    console.log(`[jahia-cypress-run] ${message}`);
};

const stringList = (value: unknown, where: string): string[] => {
    const list = typeof value === 'string' ? [value] : value;
    if (!Array.isArray(list) || list.some(item => typeof item !== 'string' || item === '')) {
        throw new Error(`${where} must be a glob or a list of globs`);
    }

    return list as string[];
};

/**
 * Reads and checks a phases file.
 * @param {string} content - The YAML of the file
 * @returns {PhasesFile} The phases, with the defaults of the omitted keys
 */
export const parsePhases = (content: string): PhasesFile => {
    const raw = parse(content) as Record<string, unknown>;
    if (!raw || !Array.isArray(raw.phases) || raw.phases.length === 0) {
        throw new Error('the phases file must hold a non-empty `phases` list');
    }

    const names = new Set<string>();
    const phases = raw.phases.map((entry: Record<string, unknown>, index: number): Phase => {
        const where = `phase ${index + 1}`;
        if (typeof entry?.name !== 'string' || entry.name === '' || !/^[\w.-]+$/.test(entry.name)) {
            throw new Error(`${where} needs a name made of letters, digits, '.', '_' or '-'`);
        }

        if (names.has(entry.name)) {
            throw new Error(`two phases are named ${entry.name}`);
        }

        names.add(entry.name);
        if (entry.mode !== 'serial' && entry.mode !== 'parallel') {
            throw new Error(`phase ${entry.name}: mode must be serial or parallel`);
        }

        const phase: Phase = {name: entry.name, mode: entry.mode};
        if (entry.specs !== undefined) {
            phase.specs = stringList(entry.specs, `phase ${entry.name}: specs`);
        }

        if (entry.workers !== undefined) {
            if (entry.mode !== 'parallel' || !Number.isInteger(entry.workers) || (entry.workers as number) < 1) {
                throw new Error(`phase ${entry.name}: workers must be a positive integer, on a parallel phase only`);
            }

            phase.workers = entry.workers as number;
        }

        return phase;
    });

    const catchers = phases.filter(phase => phase.specs === undefined);
    if (catchers.length !== 1) {
        throw new Error(`exactly one phase must have no specs, to take every spec no other phase matches; found ${catchers.length}`);
    }

    return {
        specs: raw.specs === undefined ? DEFAULT_SPECS : stringList(raw.specs, 'specs'),
        exclude: raw.exclude === undefined ? DEFAULT_EXCLUDE : stringList(raw.exclude, 'exclude'),
        phases
    };
};

/**
 * Lists the files that match globs, relative to a directory, with '/' separators.
 * fs.globSync exists from Node 22, and the @types/node of the build may predate it.
 * @param {string[]} globs - The globs
 * @param {string} cwd - The directory the globs are relative to
 * @returns {string[]} The files, sorted
 */
const globFiles = (globs: string[], cwd: string): string[] => {
    const globSync = (fs as unknown as {globSync?: (patterns: string[], options: {cwd: string}) => string[]}).globSync;
    if (!globSync) {
        throw new Error(`the runner needs Node 22 or later, this is ${process.version}`);
    }

    return Array.from(new Set(globSync(globs, {cwd}).map(file => file.split(path.sep).join('/')))).sort();
};

/**
 * Gives each spec to the first phase whose globs match it, and the rest to the catcher phase.
 * @param {PhasesFile} phasesFile - The phases
 * @param {string} cwd - The directory the globs are relative to
 * @returns {AssignedPhase[]} The phases in order, each with its files
 */
export const assignSpecs = (phasesFile: PhasesFile, cwd: string): AssignedPhase[] => {
    const excluded = new Set(globFiles(phasesFile.exclude, cwd));
    const remaining = new Set(globFiles(phasesFile.specs, cwd).filter(file => !excluded.has(file)));
    const assigned = phasesFile.phases.map(phase => ({...phase, files: [] as string[]}));
    assigned.filter(phase => phase.specs).forEach(phase => {
        phase.files = globFiles(phase.specs, cwd).filter(file => remaining.has(file));
        phase.files.forEach(file => remaining.delete(file));
    });
    assigned.find(phase => !phase.specs).files = Array.from(remaining).sort();
    return assigned;
};

/**
 * Deals the specs round-robin into n lists.
 * @param {string[]} files - The specs, sorted
 * @param {number} n - The number of lists
 * @returns {string[][]} n lists, none empty when there are at least n specs
 */
export const split = (files: string[], n: number): string[][] => {
    const lists: string[][] = Array.from({length: n}, () => []);
    files.forEach((file, index) => lists[index % n].push(file));
    return lists.filter(list => list.length > 0);
};

/**
 * Copies the reporter configuration with a mochawesome file name of its own, so that two runs side by
 * side do not write the same report.
 * @param {string} label - The phase and worker, such as parallel-w2
 * @param {string} cwd - The project directory
 * @returns {string | undefined} The path of the copy, or undefined when the project has no such file
 */
const workerReporterConfig = (label: string, cwd: string): string | undefined => {
    const source = path.resolve(cwd, process.env.CYPRESS_REPORTER_CONFIG || 'reporter-config.json');
    if (!fs.existsSync(source)) {
        return undefined;
    }

    const config = JSON.parse(fs.readFileSync(source, 'utf8'));
    if (config.mochawesomeReporterOptions) {
        const base = config.mochawesomeReporterOptions.reportFilename || 'mochawesome';
        config.mochawesomeReporterOptions.reportFilename = `${base}-${label}`;
    }

    const dir = path.resolve(cwd, 'results/.runner');
    fs.mkdirSync(dir, {recursive: true});
    const copy = path.join(dir, `reporter-config-${label}.json`);
    fs.writeFileSync(copy, JSON.stringify(config, null, 2));
    return copy;
};

/**
 * Removes a --config option from the arguments and returns its value, so the runner can add its own keys to it.
 * @param {string[]} args - The arguments for `cypress run`, changed in place
 * @returns {string} The value, or '' when there was none
 */
const takeConfig = (args: string[]): string => {
    const index = args.findIndex(arg => arg === '--config' || arg.startsWith('--config='));
    if (index < 0) {
        return '';
    }

    const [arg] = args.splice(index, 1);
    return arg.includes('=') ? arg.slice(arg.indexOf('=') + 1) : args.splice(index, 1)[0] || '';
};

const prefixLines = (stream: NodeJS.ReadableStream, prefix: string, out: NodeJS.WritableStream): void => {
    readline.createInterface({input: stream}).on('line', line => out.write(`${prefix} ${line}\n`));
};

type Run = {
    /** The phase name */
    phase: string;
    /** The worker number, from 1 */
    worker: number;
    /** True when other runs go side by side, which gives this one folders of its own */
    isolated: boolean;
    /** The specs */
    files: string[];
    /** The arguments given to the runner */
    passthrough: string[];
    /** The project directory */
    cwd: string;
};

/**
 * Runs one `cypress run` on a list of specs.
 * @param {Run} run - What to run, and where
 * @returns {Promise<RunResult>} The exit code and duration of the run
 */
const runCypress = ({phase, worker, isolated, files, passthrough, cwd}: Run): Promise<RunResult> => {
    const label = `${phase}-w${worker}`;
    const args = [...passthrough];
    const config = [takeConfig(args)].filter(value => value !== '');
    if (isolated) {
        config.push(`downloadsFolder=cypress/downloads-w${worker}`, `screenshotsFolder=results/screenshots/w${worker}`, `videosFolder=results/videos/w${worker}`);
    }

    const reporterConfig = args.some(arg => arg.startsWith('--reporter-options')) ? undefined : workerReporterConfig(label, cwd);
    // The "exports" map of cypress hides bin/cypress, so resolve the package entry and take its bin
    const cypressBin = path.join(path.dirname(require.resolve('cypress', {paths: [cwd]})), 'bin', 'cypress');
    const command = [
        cypressBin,
        'run',
        '--spec',
        files.join(','),
        ...(config.length > 0 ? ['--config', config.join(',')] : []),
        ...(reporterConfig ? ['--reporter-options', `configFile=${reporterConfig}`] : []),
        ...args
    ];
    const prefix = `[${label}]`;
    const started = Date.now();
    log(`${label}: ${files.length} spec(s)`);
    return new Promise(resolve => {
        const child = spawn(process.execPath, command, {cwd, env: {...process.env, CYPRESS_THREAD: String(worker)}});
        prefixLines(child.stdout, prefix, process.stdout);
        prefixLines(child.stderr, prefix, process.stderr);
        const done = (code: number) => resolve({phase, worker, specs: files.length, code, seconds: Math.round((Date.now() - started) / 1000)});
        child.on('error', error => {
            log(`${label} could not start: ${error.message}`);
            done(1);
        });
        child.on('close', code => done(code === null ? 1 : code));
    });
};

const sleep = (ms: number): Promise<void> => new Promise(resolve => {
    setTimeout(resolve, ms);
});

/**
 * Runs the phases in order and returns the exit code. Every phase runs, even after a failure, as one
 * `cypress run` of the whole suite would.
 * @param {string[]} argv - The arguments after the script name, given to every `cypress run`
 * @returns {Promise<number>} 0 when every run passed, 1 when one failed
 */
export const main = async (argv: string[]): Promise<number> => {
    if (argv.some(arg => arg === '--spec' || arg.startsWith('--spec=') || arg === '-s')) {
        throw new Error('--spec is not allowed, the phases choose the specs');
    }

    const cwd = process.cwd();
    const phasesPath = path.resolve(cwd, process.env.CYPRESS_PHASES_FILE || 'execution-phases.yml');
    const phasesFile = fs.existsSync(phasesPath) ?
        parsePhases(fs.readFileSync(phasesPath, 'utf8')) :
        {specs: DEFAULT_SPECS, exclude: DEFAULT_EXCLUDE, phases: DEFAULT_PHASES};
    log(fs.existsSync(phasesPath) ? `phases from ${phasesPath}` : `no ${phasesPath}, built-in phases`);
    const defaultWorkers = Number(process.env.CYPRESS_WORKERS) >= 1 ? Math.floor(Number(process.env.CYPRESS_WORKERS)) : 1;
    const phases = assignSpecs(phasesFile, cwd);
    phases.forEach(phase => {
        const width = phase.mode === 'parallel' ? Math.min(phase.workers || defaultWorkers, Math.max(phase.files.length, 1)) : 1;
        log(`phase ${phase.name} (${phase.mode}${phase.mode === 'parallel' ? `, ${width} worker(s)` : ''}): ${phase.files.length} spec(s)`);
        phase.files.forEach(file => log(`  ${file}`));
    });

    const results: RunResult[] = [];
    for (const phase of phases) {
        if (phase.files.length === 0) {
            continue;
        }

        const width = phase.mode === 'parallel' ? phase.workers || defaultWorkers : 1;
        const lists = split(phase.files, width);
        // The runs of a phase start WORKER_STAGGER_MS apart, and the next phase waits for all of them
        // eslint-disable-next-line no-await-in-loop
        const phaseResults = await Promise.all(lists.map(async (files, index) => {
            await sleep(index * WORKER_STAGGER_MS);
            return runCypress({phase: phase.name, worker: index + 1, isolated: lists.length > 1, files, passthrough: argv, cwd});
        }));
        results.push(...phaseResults);
    }

    log('summary');
    results.forEach(result => log(`  ${`${result.phase}-w${result.worker}`.padEnd(24)} ${String(result.specs).padStart(4)} spec(s) ${String(result.seconds).padStart(6)} s  exit ${result.code}`));
    const failed = results.filter(result => result.code !== 0);
    log(failed.length === 0 ? 'every run passed' : `${failed.length} of ${results.length} run(s) failed`);
    return failed.length === 0 ? 0 : 1;
};

if (require.main === module) {
    main(process.argv.slice(2)).then(code => {
        process.exitCode = code;
    }, error => {
        log(`the runner could not start: ${error instanceof Error ? error.message : String(error)}`);
        process.exitCode = 2;
    });
}
