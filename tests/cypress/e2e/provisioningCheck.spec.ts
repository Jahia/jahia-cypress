import {
    compareModules,
    expectedModules,
    IncludeLookup,
    IncludeReader,
    installedModulesOf,
    moduleIdOfUrl,
    readManifest,
    versionOfUrl
} from '../../../src/cli/provisioningCheck';

const manifest = `
- include: 'provisioning.yml'

- installBundle:
    - 'mvn:org.jahia.modules.qa/qa-osgiConfigDefaults'
    - 'js:mvn:org.jahia.qa/qa-js-module/LATEST/tgz'
    - url: 'mvn:org.jahia.modules/sitemap/5.3.0'
      if: 'jahia.version >= "8.2.3.0"'
  autoStart: true
  uninstallPreviousVersion: true

- installOrUpgradeBundle: 'mvn:org.jahia.modules/forms'

- installModule:
    - 'mvn:org.jahia.modules/channels'

- installAndStartBundle: 'mvn:org.jahia.modules/jexperience/3.9.0'

- installBundle: 'mvn:org.jahia.modules/channels'
  autoStart: true

- uninstallBundle: 'mvn:org.jahia.modules/remotepublish'

- installBundle: 'my-module-1.0.0-SNAPSHOT.jar'
  autoStart: true
`;

const localInfo = {
    'org.apache.felix.framework/6.0.5': {type: 'BUNDLE', osgiState: 'ACTIVE', moduleState: null},
    'org.jahia.modules.qa/qa-osgiConfigDefaults/1.0.0.SNAPSHOT': {type: 'MODULE', osgiState: 'ACTIVE', moduleState: 'STARTED'},
    'org.jahia.modules.javascript/qa-js-module/1.2.0': {type: 'MODULE', osgiState: 'RESOLVED', moduleState: 'RESOLVED'},
    'org.jahia.modules/forms/4.1.0': {type: 'MODULE', osgiState: 'RESOLVED', moduleState: 'RESOLVED'},
    'org.jahia.modules/forms/4.2.0': {type: 'MODULE', osgiState: 'ACTIVE', moduleState: 'STARTING'},
    'org.jahia.modules/channels/3.0.0': {type: 'MODULE', osgiState: 'ACTIVE', moduleState: 'STARTED'}
};

describe('provisioning readiness check', () => {
    it('reads the module id of a mvn: and a js:mvn: URL, and nothing from a file name', () => {
        expect(moduleIdOfUrl('mvn:org.jahia.modules/sitemap')).to.equal('sitemap');
        expect(moduleIdOfUrl('mvn:org.jahia.modules/sitemap/5.3.0')).to.equal('sitemap');
        expect(moduleIdOfUrl('js:mvn:org.jahia.qa/qa-js-module/LATEST/tgz')).to.equal('qa-js-module');
        expect(moduleIdOfUrl('my-module-1.0.0-SNAPSHOT.jar')).to.equal(undefined);
    });

    it('fails a mvn: URL whose module id it cannot read, such as one that names its repository', () => {
        const url = 'mvn:https://nexus.example.com/repository/public!org.jahia.modules/app-shell/3.4.0';
        expect(moduleIdOfUrl(url)).to.be.undefined;
        const expected = expectedModules(`- installOrUpgradeBundle: '${url}'`);
        expect(expected).to.deep.equal([{id: url, url, expected: 'STARTED', unreadable: true}]);
        expect(compareModules(expected, {})[0].status).to.equal('failed');
    });

    it('lists the modules of each install operation with the state the operation leaves them in', () => {
        expect(expectedModules(manifest)).to.deep.equal([
            {id: 'qa-osgiConfigDefaults', url: 'mvn:org.jahia.modules.qa/qa-osgiConfigDefaults', expected: 'STARTED'},
            {id: 'qa-js-module', url: 'js:mvn:org.jahia.qa/qa-js-module/LATEST/tgz', expected: 'STARTED'},
            {id: 'forms', url: 'mvn:org.jahia.modules/forms', expected: 'STARTED'},
            {id: 'channels', url: 'mvn:org.jahia.modules/channels', expected: 'STARTED'},
            {id: 'jexperience', url: 'mvn:org.jahia.modules/jexperience/3.9.0', expected: 'STARTED'}
        ]);
    });

    it('expects a module only installed when the operation does not start it', () => {
        expect(expectedModules('- installBundle: mvn:org.jahia.modules/channels')).to.deep.equal([
            {id: 'channels', url: 'mvn:org.jahia.modules/channels', expected: 'INSTALLED'}
        ]);
        expect(expectedModules('- installOrUpgradeModule: mvn:org.jahia.modules/channels\n  autoStart: false')).to.deep.equal([
            {id: 'channels', url: 'mvn:org.jahia.modules/channels', expected: 'INSTALLED'}
        ]);
    });

    it('lists nothing for a manifest that installs no module', () => {
        expect(expectedModules('- executeScript: setup.groovy')).to.deep.equal([]);
        expect(expectedModules('')).to.deep.equal([]);
    });

    it('groups the bundles of the platform by module id and leaves the plain bundles out', () => {
        const installed = installedModulesOf(localInfo);
        expect(Object.keys(installed)).to.deep.equal(['qa-osgiConfigDefaults', 'qa-js-module', 'forms', 'channels']);
        expect(installed.forms.map(version => version.moduleState)).to.deep.equal(['RESOLVED', 'STARTING']);
    });

    it('reports a missing module, a stopped one, one still starting and the ones that are fine', () => {
        const reports = compareModules(expectedModules(manifest), installedModulesOf(localInfo));
        expect(reports.map(report => `${report.id}:${report.status}:${report.found.join('+')}`)).to.deep.equal([
            'qa-osgiConfigDefaults:ok:STARTED',
            'qa-js-module:failed:RESOLVED',
            'forms:pending:RESOLVED+STARTING',
            'channels:ok:STARTED',
            'jexperience:failed:'
        ]);
    });

    it('accepts an installed module whatever its state when the operation does not start it', () => {
        const expected = expectedModules('- installBundle: js:mvn:org.jahia.qa/qa-js-module/LATEST/tgz');
        expect(compareModules(expected, installedModulesOf(localInfo))[0].status).to.equal('ok');
    });

});

// Written as _localInfo answers on Jahia 8.2.3, which keys a module group/symbolicName/osgiVersion
const versionedLocalInfo = {
    'org.jahia.modules/app-shell/3.3.0': {type: 'MODULE', osgiState: 'ACTIVE', moduleState: 'STARTED'},
    'org.jahia.modules/forms/4.1.0': {type: 'MODULE', osgiState: 'RESOLVED', moduleState: 'RESOLVED'},
    'org.jahia.modules/forms/4.2.0': {type: 'MODULE', osgiState: 'ACTIVE', moduleState: 'STARTED'},
    'org.jahia.modules/default/8.11.0.SNAPSHOT': {type: 'MODULE', osgiState: 'ACTIVE', moduleState: 'STARTED'}
};

describe('provisioning readiness check, version of the module', () => {
    const statusOf = (manifestLine: string) =>
        compareModules(expectedModules(manifestLine), installedModulesOf(versionedLocalInfo))[0].status;

    it('reads the version of a URL in its OSGi form, and none for LATEST, RELEASE or a range', () => {
        expect(versionOfUrl('mvn:org.jahia.modules/forms/4.2.0')).to.equal('4.2.0');
        expect(versionOfUrl('mvn:org.jahia.modules/default/8.11.0-SNAPSHOT')).to.equal('8.11.0.SNAPSHOT');
        expect(versionOfUrl('js:mvn:org.jahia.qa/qa-js-module/1.2.0/tgz')).to.equal('1.2.0');
        expect(versionOfUrl('mvn:org.jahia.modules/forms')).to.equal(undefined);
        expect(versionOfUrl('js:mvn:org.jahia.qa/qa-js-module/LATEST/tgz')).to.equal(undefined);
        expect(versionOfUrl('mvn:org.jahia.modules/forms/RELEASE')).to.equal(undefined);
        expect(versionOfUrl('mvn:org.jahia.modules/forms/[4.0,5.0)')).to.equal(undefined);
    });

    it('fails a module whose only installed version is not the one the manifest asks for', () => {
        expect(statusOf('- installOrUpgradeBundle: mvn:org.jahia.modules/app-shell/3.4.0')).to.equal('failed');
    });

    it('names the installed version a failed upgrade left', () => {
        const expected = expectedModules('- installOrUpgradeBundle: mvn:org.jahia.modules/app-shell/3.4.0');
        const [report] = compareModules(expected, installedModulesOf(versionedLocalInfo));
        expect(report.found).to.deep.equal([]);
        expect(report.otherVersions).to.deep.equal(['3.3.0 STARTED']);
    });

    it('accepts the asked version when an older one is installed beside it', () => {
        expect(statusOf('- installOrUpgradeBundle: mvn:org.jahia.modules/forms/4.2.0')).to.equal('ok');
    });

    it('fails when the asked version is installed but only the other one is started', () => {
        expect(statusOf('- installAndStartBundle: mvn:org.jahia.modules/forms/4.1.0')).to.equal('failed');
    });

    it('matches a Maven SNAPSHOT version to its OSGi form', () => {
        expect(statusOf('- installOrUpgradeBundle: mvn:org.jahia.modules/default/8.11.0-SNAPSHOT')).to.equal('ok');
    });

    it('accepts any version when the URL names none, or names LATEST or RELEASE', () => {
        expect(statusOf('- installOrUpgradeBundle: mvn:org.jahia.modules/app-shell')).to.equal('ok');
        expect(statusOf('- installOrUpgradeBundle: mvn:org.jahia.modules/app-shell/LATEST')).to.equal('ok');
        expect(statusOf('- installOrUpgradeBundle: mvn:org.jahia.modules/app-shell/RELEASE')).to.equal('ok');
    });
});


// The files of assets/, by the name Jahia keys a submitted file with
const assets: Record<string, string> = {
    'provisioning.yml': `
- installBundle:
    - 'mvn:org.jahia.modules/channels'
    - 'mvn:org.jahia.modules/qa-module'
  autoStart: true
- include: 'demo.yml'
`,
    'demo.yml': "- installAndStartBundle: 'mvn:org.jahia.modules/digitall/3.0.0'",
    'loop-a.yml': '- installOrUpgradeBundle: mvn:org.jahia.modules/forms\n- include: loop-b.yml',
    'loop-b.yml': '- installOrUpgradeBundle: mvn:org.jahia.modules/sitemap\n- include: loop-a.yml',
    'forms.yml': '- installOrUpgradeBundle: mvn:org.jahia.modules/forms',
    'sitemap.yml': '- installOrUpgradeBundle: mvn:org.jahia.modules/sitemap',
    'broken.yml': '- installBundle: [unclosed',
    'first.yml': '- include: provisionning.yml',
    'second.yml': '- include: provisionning.yml'
};
const readAsset: IncludeReader = name => (assets[name] === undefined ? {missing: true} : {text: assets[name]});

describe('provisioning readiness check, included manifests', () => {
    it('lists the modules of an include in place, with the manifest that names them', () => {
        const manifest = `
- installOrUpgradeBundle: mvn:org.jahia.modules/app-shell
- include: 'provisioning.yml'
- installOrUpgradeBundle: mvn:org.jahia.modules/jexperience
`;
        expect(expectedModules(manifest, readAsset)).to.deep.equal([
            {id: 'app-shell', url: 'mvn:org.jahia.modules/app-shell', expected: 'STARTED'},
            {id: 'channels', url: 'mvn:org.jahia.modules/channels', expected: 'STARTED', from: 'provisioning.yml'},
            {id: 'qa-module', url: 'mvn:org.jahia.modules/qa-module', expected: 'STARTED', from: 'provisioning.yml'},
            {id: 'digitall', url: 'mvn:org.jahia.modules/digitall/3.0.0', expected: 'STARTED', from: 'demo.yml'},
            {id: 'jexperience', url: 'mvn:org.jahia.modules/jexperience', expected: 'STARTED'}
        ]);
    });

    it('stops an include that leads back to a manifest it came from', () => {
        expect(expectedModules('- include: loop-a.yml', readAsset).map(module => module.id))
            .to.deep.equal(['forms', 'sitemap']);
    });

    it('reads an include written as a list of names or of url: entries', () => {
        const manifest = `
- include:
    - 'forms.yml'
    - url: 'sitemap.yml'
`;
        expect(expectedModules(manifest, readAsset).map(module => module.id)).to.deep.equal(['forms', 'sitemap']);
    });

    it('lists a module named in the manifest and in an include once, STARTED when either starts it', () => {
        const manifest = `
- installBundle: mvn:org.jahia.modules/channels
- include: provisioning.yml
`;
        const channels = expectedModules(manifest, readAsset).filter(module => module.id === 'channels');
        expect(channels).to.deep.equal([{id: 'channels', url: 'mvn:org.jahia.modules/channels', expected: 'STARTED'}]);
    });

    it('fails an include that no submitted file holds, once however many manifests include it', () => {
        const expected = expectedModules('- include: [first.yml, second.yml]', readAsset);
        expect(expected).to.deep.equal([
            {id: 'provisionning.yml', url: 'provisionning.yml', expected: 'STARTED', missingInclude: true, from: 'first.yml'}
        ]);
        expect(compareModules(expected, {})[0].status).to.equal('failed');
    });

    it('leaves out, without reading it, an include of a URL and an include under an if', () => {
        const read: string[] = [];
        const result = readManifest(`
- include: 'https://example.com/manifest.yml'
- include: 'mvn:org.jahia.test/manifests/1.0.0/yml'
- include: 'forms.yml'
  if: 'jahia.version >= "8.2.3.0"'
`, name => {
            read.push(name);
            return {missing: true};
        });
        expect(result.modules).to.deep.equal([]);
        expect(result.uncheckedIncludes).to.deep.equal([
            {name: 'https://example.com/manifest.yml', reason: 'an include the check does not fetch'},
            {name: 'mvn:org.jahia.test/manifests/1.0.0/yml', reason: 'an include the check does not fetch'},
            {name: 'forms.yml', reason: 'an include under an if'}
        ]);
        expect(read).to.deep.equal([]);
    });

    it('leaves out an include the reader cannot tell, and one the check cannot parse', () => {
        const result = readManifest('- include: [shared.yml, broken.yml]', name =>
            (name === 'shared.yml' ? {unchecked: 'a name 2 files share'} : readAsset(name)));
        expect(result.modules).to.deep.equal([]);
        expect(result.uncheckedIncludes.map(include => include.name)).to.deep.equal(['shared.yml', 'broken.yml']);
        expect(result.uncheckedIncludes[1].reason).to.match(/^a manifest the check cannot parse/);
    });

    it('reports a module of an include that the Maven repository could not serve', () => {
        const platform = installedModulesOf({
            'org.jahia.modules/channels/8.1.0.SNAPSHOT': {type: 'MODULE', osgiState: 'ACTIVE', moduleState: 'STARTED'},
            'org.jahia.modules/digitall/3.0.0': {type: 'MODULE', osgiState: 'ACTIVE', moduleState: 'STARTED'}
        });
        const reports = compareModules(expectedModules('- include: provisioning.yml', readAsset), platform);
        expect(reports.map(report => `${report.id}:${report.status}`)).to.deep.equal([
            'channels:ok',
            'qa-module:failed',
            'digitall:ok'
        ]);
    });

    it('leaves the includes alone without a reader', () => {
        expect(expectedModules('- include: provisioning.yml')).to.deep.equal([]);
    });

    it('reads the files of the assets folder by their name, and leaves out a symbolic link', () => {
        cy.task('readAssets', {
            files: {'provisioning.yml': 'top', 'nested/demo.yml': 'nested', 'a/shared.yml': 'a', 'b/shared.yml': 'b'},
            links: {'linked.yml': 'provisioning.yml'},
            names: ['provisioning.yml', 'demo.yml', 'linked.yml', 'absent.yml', 'shared.yml']
        }).then(lookups => {
            const [top, nested, linked, absent, shared] = lookups as IncludeLookup[];
            expect(top).to.deep.equal({text: 'top'});
            expect(nested).to.deep.equal({text: 'nested'});
            expect(linked).to.deep.equal({missing: true});
            expect(absent).to.deep.equal({missing: true});
            expect(shared).to.have.property('unchecked').that.match(/^a name 2 files of .* share/);
        });
    });
});
