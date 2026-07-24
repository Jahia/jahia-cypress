/**
 * Helper module to decorate Cypress log messages with different log levels (INFO and DEBUG at the moment).
 * @example
 *      // Switch default logging verbosity to DEBUG
 *      Log.setVerbosity(Log.LEVELS.DEBUG);
 *
 *      Log.info('This is an info message');
 *      Log.debug('This is a debug message');
 *      Log.json(Log.LEVELS.DEBUG, myJSON);
 *      Log.info('My info message').then(() => { ... });
 *
 * @note The log verbosity can be set by calling `Log.setVerbosity(Log.LEVELS.DEBUG)` in the code (default is `INFO`).
 *       It tells the logger to log only messages with the given level and above.
 */
/**
 * Logging levels enumerator
 */
declare enum LEVEL {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2
}
/**
 * Sets the logging verbosity level for the logger. Messages with a level lower than the set level will not be logged.
 * @param {LEVEL} level - log level to be set (e.g. 'DEBUG', 'INFO')
 * @return {void}
 */
declare function setVerbosity(level: LEVEL): void;
/**
 * Logs INFO message
 * @param {string} message - log message
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
declare function info(message: string): Cypress.Chainable;
/**
 * Logs DEBUG message
 * @param {string} message - log message
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
declare function debug(message: string): Cypress.Chainable;
/**
 * Logs WARNING message
 * @param {string} message - log message
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
declare function warning(message: string): Cypress.Chainable;
/**
 * Logs JSON object with logging level given
 * @param {LEVEL} level - log level (e.g. 'INFO', 'DEBUG')
 * @param {string} text - json object to be logged
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
declare function json(level: LEVEL, text: string): Cypress.Chainable;
export declare const Log: {
    info: typeof info;
    debug: typeof debug;
    warning: typeof warning;
    json: typeof json;
    setVerbosity: typeof setVerbosity;
    LEVEL: typeof LEVEL;
};
export {};
