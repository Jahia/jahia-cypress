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
declare const jfaker: any;
export { jfaker };
