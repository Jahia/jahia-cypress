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

// ENV variable to store the logging verbosity level
const envVarLoggingVerbosity = '__LOG_VERBOSITY__';

/**
 * Logging levels enumerator.
 */
enum LEVEL { DEBUG, INFO }

/**
 * Return the current logging verbosity level.
 * @returns {LEVEL} - current logging level set in Cypress environment variable `__LOG_VERBOSITY__`
 * @note be careful with Cypress.env(envVarLoggingVerbosity), since it might return `0` for `DEBUG` level,
 *       which is falsy in JavaScript, so we need to check if the variable is undefined.
 */
function getVerbosity(): LEVEL {
    return typeof Cypress.env(envVarLoggingVerbosity) === 'undefined' ? LEVEL.INFO : Cypress.env(envVarLoggingVerbosity);
}

/**
 * Sets the logging verbosity level for the logger. Messages with a level lower than the set level will not be logged.
 * @param {LEVEL} level - log level to be set (e.g. 'DEBUG', 'INFO')
 * @return {void}
 */
function setVerbosity(level: LEVEL): void {
    Cypress.env(envVarLoggingVerbosity, level);
}

/**
 * Logs INFO message
 * @param {string} message - log message
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
function info(message: string): Cypress.Chainable {
    return _send_(Log.LEVEL.INFO, message);
}

/**
 * Logs DEBUG message
 * @param {string} message - log message
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
function debug(message: string): Cypress.Chainable {
    return _send_(Log.LEVEL.DEBUG, message);
}

/**
 * Logs JSON object with logging level given
 * @param {LEVEL} level - log level (e.g. 'INFO', 'DEBUG')
 * @param {string} text - json object to be logged
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
function json(level: LEVEL, text: string): Cypress.Chainable {
    return _send_(level, JSON.stringify(text, null, 2));
}

/**
 * Private method to send the log message to Cypress log
 * @param {LEVEL} level - log level (e.g. 'INFO', 'DEBUG')
 * @param {string} message - log message
 * @note The method checks if the log level is enabled before sending the message to Cypress log
 *       and uses the Cypress.log method to display the message in the Cypress log
 * @note The method is private and should not be called directly
 *       Use the public methods (info, debug, error, warning) to send log messages
 * @returns {Cypress.Chainable} - Cypress chainable object
 * @private
 */
function _send_(level: LEVEL, message: string): Cypress.Chainable {
    // Check if the log level is valid
    if (!Object.values(Log.LEVEL).includes(level)) {
        throw new Error(`Log level "${level}" is not supported. Supported levels are: ${Log.LEVEL}`);
    }

    // Check if the log level is enabled,
    // take into account the log level set in Cypress.env('LOG_LEVEL') and the log level set in the Log.LEVEL variable.
    // If the log level is enabled, send the message to Cypress log.
    if (level >= getVerbosity()) {
        // Send the message to Cypress log
        // use cy.then() to ensure that the log message is sent in the correct order
        // and use cy.wrap() to return the Cypress chainable object
        return cy.then(() => {
            Cypress.log({displayName: `[ ${Log.LEVEL[level].toUpperCase()} ]`, message: `${message}`});
        }).then(() => cy.wrap(null, {log: false}));
    }
}

// Export the Log module with methods to log messages and set the logging level
export const Log = {
    info,
    debug,
    json,
    setVerbosity,
    LEVEL
};
