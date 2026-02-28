import {faker} from '@faker-js/faker';

/**
 * Options for generating test data
 */
export interface GenerateOptions {
  /** Type of injection data (xss, sql, bash, etc.) - leave undefined to use faker */
  type?: string;
  /** Faker method in dot-notation (e.g., "person.firstName", "internet.email") */
  entity?: string;
  /** Length of the resulted string to generate (0 = all items, undefined = random 3-6 items joined into a string) */
  length?: number;
  /** Optional parameters to pass to the faker method */
  fakerOptions?: Record<string, unknown> | Array<unknown> | string | number | boolean;
}

// To be used to store injection data in module memory (persists across tests in same spec)
let injectionData: Record<string, string[]> = {};

// Environment variable key for storing injection data in Cypress env (to be shared across specs)
const ENV_INJECTIONS_DATA = '__JAHIA_CYPRESS_INJECTION_DATA__';

// Environment variable key for storing injection type in Cypress env
// Can be set either using corresponding FakeData method or as an env var from CI/CD pipeline
const ENV_INJECTIONS_TYPE = 'JAHIA_CYPRESS_INJECTION_TYPE';

// Known injection types and corresponding fixture files (have to match files in fixtures/injections/)
const injectionTypes = ['xss', 'sql', 'bash', 'chars', 'htmlentities', 'numbers'];

// Default range for random length of injection payloads; used when length is undefined
// Random items within the range will be picked and joined into a single string
const injectionsDefaultLength = {min: 3, max: 6};

/**
 * Store injection data in Cypress env for persistence across specs
 * @param {Record<string, string[]>} data Injection data mapped by type
 * @returns void
 */
function setInjectionsData(data: Record<string, string[]>): void {
    Cypress.env(ENV_INJECTIONS_DATA, data);
}

/**
 * Retrieve injection data from Cypress env
 * @returns {Record<string, string[]>} Injection data mapped by type
 */
function getInjectionsData(): Record<string, string[]> {
    return Cypress.env(ENV_INJECTIONS_DATA) || {};
}

/**
 * Store FakeData type in Cypress env for persistence across specs
 * @param {string} type FakeData type: 'faker' | 'xss' | 'sql' | 'bash' | 'chars' | 'htmlentities' | 'numbers'
 * @returns void
 */
function setFakeDataType(type: string): void {
    Cypress.env(ENV_INJECTIONS_TYPE, type);
}

/**
 * Retrieve FakeData type from Cypress env (defaults to 'faker' if not set)
 * @returns {string} Type of FakeData to use
 */
function getFakeDataType(): string | undefined {
    return Cypress.env(ENV_INJECTIONS_TYPE) || 'faker';
}

/**
 * Load injection data from fixture files
 * Must be called in e2e.js to ensure data is loaded
 * @returns void
 * @example
 * ```typescript
 * FakeData.enable();
 * ```
 */
function enable(): void {
    before(() => {
        // Load injection data from files into module memory
        cy.wrap(injectionTypes).each((type: string) => {
            cy.readFile(`./node_modules/@jahia/cypress/fixtures/injections/${type}-data.txt`, 'utf8').then((content: string) => {
                injectionData[type] = content.split('\n').filter((line: string) => line.trim().length > 0);
            });
        });

        cy.then(() => {
            // Save to env var after all files are loaded
            // This allows sharing data across different spec files
            setInjectionsData(injectionData);
        });
    });
}

/**
 * Generate test data based on type and entity parameters
 * @param {GenerateOptions | string} options Generation options or entity string
 * @returns {string} Generated test data
 *
 * @example
 * ```typescript
 * // In your test file e2e.js, load injection data first:
 * FakeData.enable();
 *
 * // Generate faker data with entity (shorthand)
 * const name = FakeData.get('person.firstName');
 *
 * // Generate faker data with entity (object notation).
 * // Entity will always be generated using faker, since explicitly passed type overrides global settings.
 * const name = FakeData.get({entity: 'person.firstName', type: 'faker'});
 *
 * // Generate faker data with options.
 * const email = FakeData.get({entity: 'internet.email', fakerOptions: {provider: 'example.com'}});
 *
 * // Generate injection payloads (random between min and max items joined into a single string).
 * // Entity will always be generated using 'xss', since explicitly passed type overrides global settings.
 * const xssName = FakeData.get({entity: 'person.firstName', type: 'xss'});
 *
 * // Generate injection payloads with specific items count.
 * // Entity will always be generated using 'xss', since explicitly passed type overrides global settings.
 * const xssName = FakeData.get({entity: 'person.firstName', type: 'xss', length: 100});
 *
 * // Generate all SQL injections
 * // Entity will always be generated using 'sql', since explicitly passed type overrides global settings.
 * const allSql = FakeData.get({type: 'sql', length: -1 });
 * ```
 */
function get(options: GenerateOptions | string): string {
    // Normalize input - if string is passed, treat it as entity
    const normalizedOptions: GenerateOptions = typeof options === 'string' ? {entity: options} : options;

    // Destructure options with defaults
    const {type = getFakeDataType(), entity = 'lorem.sentence', length, fakerOptions} = normalizedOptions;

    // Result array to hold generated data
    let result: string[] = [];

    // Check if type is provided and matches known injection types
    if (type !== undefined && injectionTypes.includes(type)) {
        // Load from env var into module's one if injectionData is empty,
        // e.g. if FakeData.enable() was called globally, outside of spec, and module's var is not available.
        // Kinda caching, to speed up operations and avoid reading from disk repeatedly.
        if (Object.keys(injectionData).length === 0) {
            injectionData = getInjectionsData();
        }

        // Validate injection type
        if (!injectionData[type] || injectionData[type].length === 0) {
            throw new Error(`[FakeData EXCEPTION] No injection data found for type: ${type}. Available types: ${Object.keys(injectionData).join(', ')}`);
        }

        if (length === -1) {
            /**
             * Return all items for length = -1
             */
            result = injectionData[type];
        } else if (length && length > 0) {
            /**
             * Fetch random items up to specified length
             */
            while (result.join('').length < length) {
                const randomIndex = Math.floor(Math.random() * injectionData[type].length);
                result.push(injectionData[type][randomIndex]);
            }

            // Trim to exact length if exceeded
            if (result.join('').length > length) {
                const combined = result.join('');
                result = [combined.substring(0, length)];
            }
        } else {
            /**
             * Generate random min...max items if length is undefined
             */
            const itemsCount = Math.floor(Math.random() * injectionsDefaultLength.max) + injectionsDefaultLength.min;

            for (let i = 0; i < itemsCount; i++) {
                const randomIndex = Math.floor(Math.random() * injectionData[type].length);
                result.push(injectionData[type][randomIndex]);
            }
        }
    } else {
        // No valid type provided, use Faker.js for data generation
        // In case entity is not provided or empty, throw an error
        if (entity === undefined || entity.trim() === '') {
            throw new Error('[FakeData EXCEPTION] No entity provided for faker data generation');
        }

        // Use Faker.js for generating fake data
        let generator: () => string;

        // Parse entity path and dynamically call faker method e.g., "person.firstName" -> faker.person.firstName()
        const parts = entity.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fakerMethod: any = faker;

        // Navigate through the faker object
        for (const part of parts) {
            if (fakerMethod && typeof fakerMethod[part] !== 'undefined') {
                fakerMethod = fakerMethod[part];
            } else {
                throw new Error(`[FakeData EXCEPTION] Invalid faker method: ${entity}`);
            }
        }

        // Check if the final result is a function; also take into account optional fakerOptions
        if (typeof fakerMethod === 'function') {
            generator = fakerOptions ? () => fakerMethod(fakerOptions) : fakerMethod as () => string;
        } else {
            throw new Error(`[FakeData EXCEPTION] ${entity} is not a function`);
        }

        result.push(generator());
    }

    // Return concatenated result as a single string
    return result.join('');
}

/**
 * Escape string to prevent issues when used in contexts like HTML or JavaScript
 * @param str
 */
function escape(str: string): string {
    return JSON.stringify(str).slice(1, -1);
}

/**
 * FakeData module - provides methods for generating test data
 */
const FakeData = {
    enable,
    get,
    getFakeDataType,
    setFakeDataType,
    escape
};

// Export faker instance as well for direct usage if needed
export {faker, FakeData};
