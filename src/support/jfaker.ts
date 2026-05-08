/* eslint-disable no-else-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * jfaker - A flexible data generator for Cypress tests, supporting both faker.js generated data and custom injection payloads.
 *
 * This module provides a unified interface to generate either faker data or custom injection payloads based on the method called and global settings.
 * It uses a dynamic Proxy to handle method calls and determine whether to generate faker data or injection data.
 *
 * IMPORTANT:
 * When using the generated strings from jfaker in Cypress commands like `.type()`, make sure to:
 * use `parseSpecialCharSequences: false`, e.g.: `<input>.type(text, {parseSpecialCharSequences: false})`
 * to prevent Cypress from interpreting special characters in the generated strings (e.g., {, }, [, ], etc.) as commands,
 * which is especially important for injection payloads that may contain such characters.
 */

import {faker} from '@faker-js/faker';

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
const injectionsDefaultLength = {min: 2, max: 5};

/**
 * Store FakeData type in Cypress env for persistence across specs
 * @param {string} type FakeData type: 'faker' | 'xss' | 'sql' | 'bash' | 'chars' | 'htmlentities' | 'numbers'
 * @returns void
 */
function setDataType(type: string): void {
    Cypress.env(ENV_INJECTIONS_TYPE, type);
}

/**
 * Retrieve FakeData type from Cypress env (defaults to 'faker' if not set)
 * @returns {string} Type of FakeData to use
 */
function getDataType(): string | undefined {
    return Cypress.env(ENV_INJECTIONS_TYPE) || 'faker';
}

/**
 * Generate injection data based on the specified type and length
 * @param {string} type Injection type to generate (xss, sql, bash, chars, htmlentities, numbers)
 * @param {number} length Length of the generated injection (optional)
 * @returns {string} Generated injection string
 */
function generateInjection(type: string, length?: number): string {
    let result: string[] = [];

    // Type is specified and exists in injectionData, use it to generate data
    const data = injectionData[type];
    if (!data || data.length === 0) {
        throw new Error(`[jFaker EXCEPTION] No injection data found for type: ${type}.`);
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

        // Trim the combined string to the specified length
        const combined = result.join('');
        result = [combined.substring(0, length)];
    } else {
        // If length is not specified, pick a random number of items within the default range
        const itemsCount = Math.floor(Math.random() * injectionsDefaultLength.max) + injectionsDefaultLength.min;
        for (let i = 0; i < itemsCount; i++) {
            const randomIndex = Math.floor(Math.random() * data.length);
            result.push(data[randomIndex]);
        }
    }

    return result.join('');
}

/**
 * Generate faker data based on the specified entity and options
 * @param {string} entity Faker entity to generate (e.g., "person.firstName")
 * @param {Record<string, unknown> | string | number | boolean | undefined} options Options to pass to the faker method (optional)
 * @returns {string} Generated faker string
 */
function generateFake(entity: string, options?: Record<string, unknown> | string | number | boolean | undefined): string {
    let generator: () => string;
    const result: string[] = [];
    const parts: string[] = entity.split('.');
    let fakerMethod: any = faker;

    for (const part of parts) {
        if (fakerMethod && typeof fakerMethod[part] !== 'undefined') {
            fakerMethod = fakerMethod[part];
        } else {
            throw new Error(`[jFaker EXCEPTION] Invalid faker method: ${entity}`);
        }
    }

    if (typeof fakerMethod === 'function') {
        generator = (options && Object.keys(options).length > 0) ? () => fakerMethod(options) : () => fakerMethod();
    } else {
        throw new Error(`[jFaker EXCEPTION] ${entity} is not a function`);
    }

    result.push(generator());

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
 * Simple DeepApi class to create a dynamic nested Proxy for generating fake data using faker or injection data based on method calls
 */
class DeepApi {
    constructor(private handler: (path: string, args: any[]) => any) {
        return this.createProxy([]);
    }

    private createProxy(path: string[]): any {
        return new Proxy(
            // The target is a function, so the proxy itself is callable
            function () {},
            {
                // Handle property access - go deeper
                get: (target, prop) => {
                    return this.createProxy([...path, String(prop)]);
                },

                // Handle function call - execute handler
                apply: (target, thisArg, args) => {
                    return this.handler(path.join('.'), args);
                }
            }
        );
    }
}

/**
 * Interface to Fake Data generator (using DeepApi proxy to handle dynamic method calls)
 * @param {Record<string, unknown>} options Options for data generation (length for injections, faker options, safe flag), \
 *                                          e.g.: `{length: 100}` for injections to specify desired length of the generated string, \
 *                                          or `{provider: 'example.com'}` for faker to pass options to the faker method. \
 *                                          For faker data generation, an additional option `safe` can be set to `true` \
 *                                          to force faker generation regardless of global type settings \
 *                                          (useful for specific cases where faker data is needed even when global type is set to injection).
 * @remarks
 * Available injection methods:
 * - `.xss()` - Generate XSS injection payloads
 * - `.sql()` - Generate SQL injection payloads
 * - `.bash()` - Generate Bash injection payloads
 * - `.chars()` - Generate random special characters
 * - `.htmlentities()` - Generate HTML entities
 * - `.numbers()` - Generate random numbers entities and edge cases
 * - or any faker.js method can also be called (e.g., `person.firstName()`, `internet.email()`)
 *
 * @returns {string} Generated data string based on the method called and options provided
 *
 * @see https://fakerjs.dev/api/ for available faker methods and options
 * @example
 * ```typescript
 *
 * // Generate faker data with entity.
 * const name = jfaker.person.firstName();
 *
 * // Entity will always be generated using faker (safe: true)
 * const name = jfaker.person.firstName({safe: true});
 *
 * // Generate faker data with options.
 * const email = jfaker.internet.email({provider: 'example.com'});
 *
 * // Generate injection payloads (random between min and max items joined into a single string)..
 * // Entity will always be generated using 'xss'.
 * const xssName = jfaker.xss();
 *
 * // Generate injection payloads with specific length.
 * // Entity will always be generated using 'xss'.
 * const xssName = jfaker.xss({length: 100});
 *
 * // Use all SQL injections.
 * // Entity will always be generated using 'sql'.
 * const allSql = jfaker.sql({length: -1});
 * ```
 */
const jfaker = new DeepApi((path, args) => {
    // Handle non-faker methods first (escape, setFakeDataType, getFakeDataType)
    switch (path) {
        case 'escape':
            return escape(args[0]);
        case 'setDataType':
            return setDataType(args[0]);
        case 'getDataType':
            return getDataType();
        case Object.prototype.hasOwnProperty.call(injectionData, path) ? path : 'default':
            // If the path corresponds to a valid injection type, generate data using that type,
            // or fallback to default case which treats the path as a faker entity.
            // Keep (safe === true) logic in "default" case for a readability.
            return generateInjection(path, args[0]?.length);
        default: {
            // For faker data generation, check if the generation should be persistent based on global settings and options passed.
            const safe = args[0]?.safe === true;
            // Delete the 'safe' property from options to avoid passing it to faker methods
            delete args[0]?.safe;

            // Here path represents a faker entity.
            // Check desired data type and 'safe' option to determine whether to generate faker data or injection data.
            // If global type is set to injection (to override faker data) but safe is explicitly set to true in options -
            // generate faker data for this specific call regardless of global settings.
            if (getDataType() === 'faker' || safe) {
                return generateFake(path, args[0]);
            } else {
                return generateInjection(getDataType(), args[0]?.length);
            }
        }
    }
}) as any;

export {jfaker};
