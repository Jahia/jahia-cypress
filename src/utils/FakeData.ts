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

// Import injection data from corresponding files in injections-ts directory
import {xssData} from '../injections/xss-data';
import {sqlData} from '../injections/sql-data';
import {bashData} from '../injections/bash-data';
import {charsData} from '../injections/chars-data';
import {htmlentitiesData} from '../injections/htmlentities-data';
import {numbersData} from '../injections/numbers-data';

const injectionData: Record<string, string[]> = {
    xss: xssData,
    sql: sqlData,
    bash: bashData,
    chars: charsData,
    htmlentities: htmlentitiesData,
    numbers: numbersData
};

// Environment variable key for storing injection type in Cypress env
// Can be set either using corresponding FakeData method or as an env var from CI/CD pipeline
const ENV_INJECTIONS_TYPE = 'JAHIA_CYPRESS_INJECTION_TYPE';

// Default range for random length of injection payloads; used when length is undefined
// Random items within the range will be picked and joined into a single string
const injectionsDefaultLength = {min: 3, max: 6};

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
 * Generate test data based on type and entity parameters
 * @param {GenerateOptions | string} options Generation options or entity string
 * @returns {string} Generated test data
 *
 * @example
 * ```typescript
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
 * // Generate injection payloads with specific length.
 * // Entity will always be generated using 'xss', since explicitly passed type overrides global settings.
 * const xssName = FakeData.get({entity: 'person.firstName', type: 'xss', length: 100});
 *
 * // Use all SQL injections
 * // Entity will always be generated using 'sql', since explicitly passed type overrides global settings.
 * const allSql = FakeData.get({type: 'sql', length: -1 });
 * ```
 */
function get(options: GenerateOptions | string): string {
    // Normalize input - if string is passed, treat it as entity
    const normalizedOptions: GenerateOptions = typeof options === 'string' ? {entity: options} : options;

    // Destructure options with defaults
    const {type = getFakeDataType(), entity = 'lorem.sentence', length, fakerOptions} = normalizedOptions;

    let result: string[] = [];

    // If type is specified and exists in injectionData, use it to generate data
    // Otherwise, use faker to generate data based on the provided entity
    if (type !== undefined && Object.prototype.hasOwnProperty.call(injectionData, type)) {
        // Type is specified and exists in injectionData, use it to generate data
        const data = injectionData[type];
        if (!data || data.length === 0) {
            throw new Error(`[FakeData EXCEPTION] No injection data found for type: ${type}.`);
        }

        if (length === -1) {
            // If length is -1, use all available items from the data array
            result = data;
        } else if (length && length > 0) {
            // If length is specified and greater than 0, pick random items until the combined length meets the requirement
            while (result.join('').length < length) {
                const randomIndex = Math.floor(Math.random() * data.length);
                result.push(data[randomIndex]);
            }

            if (result.join('').length > length) {
                const combined = result.join('');
                result = [combined.substring(0, length)];
            }
        } else {
            // If length is not specified, pick a random number of items within the default range
            const itemsCount = Math.floor(Math.random() * injectionsDefaultLength.max) + injectionsDefaultLength.min;
            for (let i = 0; i < itemsCount; i++) {
                const randomIndex = Math.floor(Math.random() * data.length);
                result.push(data[randomIndex]);
            }
        }
    } else {
        // No valid type provided, use Faker.js for data generation
        // Double-check on entity presence before proceeding with faker generation, as it's required for faker method resolution
        // and throw an error if it's missing or empty to avoid silent failures and provide clear feedback to the user
        if (entity === undefined || entity.trim() === '') {
            throw new Error('[FakeData EXCEPTION] No entity provided for faker data generation');
        }

        let generator: () => string;
        const parts = entity.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fakerMethod: any = faker;
        for (const part of parts) {
            if (fakerMethod && typeof fakerMethod[part] !== 'undefined') {
                fakerMethod = fakerMethod[part];
            } else {
                throw new Error(`[FakeData EXCEPTION] Invalid faker method: ${entity}`);
            }
        }

        if (typeof fakerMethod === 'function') {
            generator = fakerOptions ? () => fakerMethod(fakerOptions) : fakerMethod as () => string;
        } else {
            throw new Error(`[FakeData EXCEPTION] ${entity} is not a function`);
        }

        result.push(generator());
    }

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
 * FakeData module - provides methods for generating test data (async get)
 */
const FakeData = {
    get,
    getFakeDataType,
    setFakeDataType,
    escape
};

// Export faker instance as well for direct usage if needed
export {faker, FakeData};
