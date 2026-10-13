import {satisfies} from 'compare-versions';

/**
 * How waitForModuleState() polls a module.
 * activeExpected: true to wait for ACTIVE, false to wait for stopped.
 * label: used only in the timeout error message.
 * timeout: how long to poll before failing, in ms.
 * interval: time between two polls, in ms.
 * attempts: polls left.
 */
type ModuleStatePoll = {
    activeExpected: boolean;
    label: string;
    timeout: number;
    interval: number;
    attempts: number;
};

/**
 * The provisioning script keys for a module's lifecycle changed name in Jahia 8.2.3.0:
 * startModule/stopModule replaced startBundle/stopBundle. A later release still accepts the old
 * keys as deprecated aliases, but an earlier release has no operation for the new keys at all, and
 * sending one to it is a silent no-op, not an error.
 * @returns {{start: string; stop: string}} The keys the running Jahia release understands
 * @throws {Error} When no Jahia release is cached
 */
const moduleLifecycleKeys = (): { start: string; stop: string } => {
    const release = resolveJahiaRelease();
    if (!release) {
        throw new Error(`${JAHIA_VERSION_ENV_VAR} is not set: call modSince.enable() (registerSupport() does) or cacheJahiaRelease() before starting or stopping a module`);
    }

    return satisfies(release, '<8.2.3') ?
        {start: 'startBundle', stop: 'stopBundle'} :
        {start: 'startModule', stop: 'stopModule'};
};

/**
 * Polls the started modules until a module reaches the expected state, rather than trusting the
 * provisioning call: that call can return before the module finishes its transition. A module counts
 * as ACTIVE while the dashboard lists it with a version, and as stopped otherwise.
 * @param {string} moduleName - The module id to poll (e.g. 'request-safety-patch')
 * @param {ModuleStatePoll} poll - The expected state, the timeout, the interval and the polls left
 */
const waitForModuleState = (moduleName: string, poll: ModuleStatePoll): void => {
    getStartedModuleVersion(moduleName).then(version => {
        if ((typeof version === 'string') === poll.activeExpected) {
            return;
        }

        if (poll.attempts <= 1) {
            throw new Error(`${moduleName} never reported ${poll.label} within ${poll.timeout} ms`);
        }

        cy.wait(poll.interval, {log: false});
        waitForModuleState(moduleName, {...poll, attempts: poll.attempts - 1});
    });
};

/**
 * Builds the poll of a module state: every 500 ms, as many times as the timeout allows.
 * @param {boolean} activeExpected - True to wait for ACTIVE, false to wait for stopped
 * @param {number} timeout - How long to poll before failing, in ms
 * @returns {ModuleStatePoll} The poll
 */
const moduleStatePoll = (activeExpected: boolean, timeout: number): ModuleStatePoll => {
    const interval = 500;
    return {
        activeExpected,
        label: activeExpected ? 'ACTIVE' : 'STOPPED',
        timeout,
        interval,
        attempts: Math.max(1, Math.ceil(timeout / interval))
    };
};

/**
 * Extracts the module id from a module qualifier.
 * @param {string} moduleQualifier - '<id>/<version>', e.g. 'request-safety-patch/1.16.0'
 * @returns {string} The id: everything before the first slash
 */
const moduleIdOf = (moduleQualifier: string): string => moduleQualifier.split('/')[0];

/** Cypress environment variable key used to store the current Jahia version. */
export const JAHIA_VERSION_ENV_VAR = 'CYPRESS_JAHIA_VERSION';

/**
 * Fetches the Jahia version using a GraphQL query.
 * @returns Cypress.Chainable that resolves to the Jahia version record (e.g., release: "8.0.0", ...).
 * @note In rare cases tests might override baseUrl (e.g. when Jahia is configured with custom context path,
 *       but spec want to use just a host, without the context path), e.g.:
 *       it('Crawl pages', {baseUrl: serverURL.origin}, () => { ... })
 *       In such case(s) this call will fail because the GraphQL endpoint will not be found at the root of the host.
 *       To prevent such failure, we ensure GraphQL client uses full Jahia url as configured in env variable.
 */
export const getJahiaVersion = (): Cypress.Chainable => {
    return cy.apolloClient({url: Cypress.env('JAHIA_URL') || Cypress.config().baseUrl}).then(() => {
        return cy.apollo({
            fetchPolicy: 'no-cache',
            queryFile: 'graphql/jcr/query/getJahiaVersion.graphql'
        }).then(result => {
            return result?.data?.admin.jahia.version;
        });
    });
};

/**
 * Stores a Jahia release, without the `-SNAPSHOT` suffix, in `Cypress.env(JAHIA_VERSION_ENV_VAR)`.
 * @param {string} release - The Jahia release, e.g. '8.2.3.0' or '8.2.4.0-SNAPSHOT'
 */
export const cacheJahiaRelease = (release: string): void => {
    Cypress.env(JAHIA_VERSION_ENV_VAR, release.replace('-SNAPSHOT', ''));
};

/**
 * Returns the cached Jahia release. Synchronous: it reads what cacheJahiaRelease() stored, so it is
 * valid in a test or a hook, not while the spec file loads. modSince.enable() caches it in a root before().
 * @returns {string | undefined} The Jahia release, e.g. '8.2.3.0', or undefined when none is cached
 */
export const resolveJahiaRelease = (): string | undefined => {
    const release = Cypress.env(JAHIA_VERSION_ENV_VAR);
    return typeof release === 'string' && release.trim() !== '' ? release : undefined;
};

/**
 * Lists the started modules with their version, using the GraphQL dashboard API.
 * @returns {Cypress.Chainable} Resolves to the list of modules, each with its `id` and `version`
 */
export const getStartedModulesVersion = (): Cypress.Chainable => {
    return cy.apollo({
        fetchPolicy: 'no-cache',
        queryFile: 'graphql/jcr/query/getStartedModulesVersion.graphql'
    }).then(result => {
        return result?.data?.dashboard.modules;
    });
};

/**
 * Gets the version of a started module.
 * @param {string} moduleId - The module id, e.g. 'request-safety-patch'
 * @returns {Cypress.Chainable} Resolves to the `version` of the first module with that id, or undefined when none is listed
 */
export const getStartedModuleVersion = (moduleId: string): Cypress.Chainable => {
    return getStartedModulesVersion().then(modules => {
        return modules.find(module => module.id === moduleId)?.version;
    });
};

/**
 * Waits until a module is no longer ACTIVE, polling every 500 ms.
 * @param {string} moduleName - The module id, e.g. 'request-safety-patch'
 * @param {number} timeout - How long to wait before failing, in ms; 20 seconds by default
 */
export const waitForModuleStopped = (moduleName: string, timeout = 20000): void =>
    waitForModuleState(moduleName, moduleStatePoll(false, timeout));

/**
 * Waits until a module is ACTIVE, polling every 500 ms.
 * @param {string} moduleName - The module id, e.g. 'request-safety-patch'
 * @param {number} timeout - How long to wait before failing, in ms; 20 seconds by default
 */
export const waitForModuleActive = (moduleName: string, timeout = 20000): void =>
    waitForModuleState(moduleName, moduleStatePoll(true, timeout));

/**
 * Starts a module through the provisioning API — using whichever key the running Jahia release
 * understands — and does not return until the bundle is observably ACTIVE.
 * @param {string} moduleQualifier - '<symbolic-name>/<version>', e.g. 'request-safety-patch/1.16.0'
 */
export const startModule = (moduleQualifier: string): void => {
    const {start} = moduleLifecycleKeys();
    cy.runProvisioningScript({script: [{[start]: moduleQualifier}]});
    waitForModuleActive(moduleIdOf(moduleQualifier));
};

/**
 * Stops a module through the provisioning API — using whichever key the running Jahia release
 * understands — and does not return until the bundle is observably STOPPED.
 * @param {string} moduleQualifier - '<symbolic-name>/<version>', e.g. 'request-safety-patch/1.16.0'
 */
export const stopModule = (moduleQualifier: string): void => {
    const {stop} = moduleLifecycleKeys();
    cy.runProvisioningScript({script: [{[stop]: moduleQualifier}]});
    waitForModuleStopped(moduleIdOf(moduleQualifier));
};
