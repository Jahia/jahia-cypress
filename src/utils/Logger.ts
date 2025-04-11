/**
 * Helper class to log messages to Cypress log with different log levels (INFO, DEBUG, WARNING, ERROR).
 * Class contains only static methods and should not be instantiated.
 * @example
 *      Log.info('This is an info message');
 *      Log.debug('This is a debug message');
 *      Log.error('This is an error message');
 *      Log.warning('This is a warning message');
 *      Log.json('DEBUG', myJSON);
 *      Log.info('My info message').then(() => { ... });
 * @note The log level can be set by changing the `Log.LEVEL` variable in the code (default is `INFO`).
 *       Error and Warning messages don't affect test execution or final result
 *       and serve only for visibility purpose at the moment.
 */
export class Log {
    // The default log level is set to 'INFO' and can be changed by setting the Log.LEVEL variable in the code
    static LEVEL = 'INFO';
    // The log levels are defined in the levels array and are ordered from the lowest to the highest priority
    private static levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR'];

    /**
     * Logs INFO message
     * @param {string} message - log message
     * @returns {Cypress.Chainable} - Cypress chainable object
     */
    static info(message: string): Cypress.Chainable {
        return Log._send_('INFO', message);
    }

    /**
     * Logs DEBUG message
     * @param {string} message - log message
     * @returns {Cypress.Chainable} - Cypress chainable object
     */
    static debug(message: string): Cypress.Chainable {
        return Log._send_('DEBUG', message);
    }

    /**
     * Logs ERROR message
     * @param {string} message - log message
     * @returns {Cypress.Chainable} - Cypress chainable object
     */
    static error(message: string): Cypress.Chainable {
        return Log._send_('ERROR', message);
    }

    /**
     * Logs WARNING message
     * @param {string} message - log message
     * @returns {Cypress.Chainable} - Cypress chainable object
     */
    static warning(message: string): Cypress.Chainable {
        return Log._send_('WARNING', message);
    }

    /**
     * Logs JSON object with logging level given
     * @param {string} level - log level (e.g. 'INFO', 'DEBUG', 'WARNING', 'ERROR')
     * @param {string} json - json object to be logged
     * @returns {Cypress.Chainable} - Cypress chainable object
     */
    static json(level: string, json: string): Cypress.Chainable {
        return Log._send_(level, JSON.stringify(json, null, 2));
    }

    /**
     * Private method to send the log message to Cypress log
     * @param {string} level - log level (e.g. 'INFO', 'DEBUG', 'WARNING', 'ERROR')
     * @param {string} message - log message
     * @note The method checks if the log level is enabled before sending the message to Cypress log
     *       and uses the Cypress.log method to display the message in the Cypress log
     * @note The method is private and should not be called directly
     *       Use the public methods (info, debug, error, warning) to send log messages
     * @returns {Cypress.Chainable} - Cypress chainable object
     * @private
     */
    private static _send_(level: string, message: string): Cypress.Chainable {
        // Check if the log level is valid
        if (!Log.levels.includes(level.toUpperCase())) {
            throw new Error(`Log level "${level}" is not supported. Supported levels are: ${Log.levels.join(', ')}`);
        }

        // Check if the log level is enabled,
        // take into account the log level set in Cypress.env('LOG_LEVEL') and the log level set in the Log.LEVEL variable.
        // If the log level is enabled, send the message to Cypress log.
        if (
            (Log.levels.includes(Cypress.env('LOG_LEVEL')?.toUpperCase()) && Log.levels.indexOf(level.toUpperCase()) >= Log.levels.indexOf(Cypress.env('LOG_LEVEL')?.toUpperCase())) ||
            Log.levels.indexOf(level.toUpperCase()) >= Log.levels.indexOf(Log.LEVEL)
        ) {
            // Send the message to Cypress log
            // use cy.then() to ensure that the log message is sent in the correct order
            // and use cy.wrap() to return the Cypress chainable object
            return cy.then(() => {
                Cypress.log({displayName: `[ ${level.toUpperCase()} ]`, message: `${message}`});
            }).then(cy.wrap);
        }
    }
}
