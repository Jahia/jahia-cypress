import {compareModules, expectedModules, installedModulesOf, moduleIdOfUrl, versionOfUrl} from '../../../src/cli/provisioningCheck';

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
