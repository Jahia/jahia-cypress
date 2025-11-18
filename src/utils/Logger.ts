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
 * ENV variable to store the logging verbosity level
 */
const envVarLoggingVerbosity = '__LOG_VERBOSITY__';

/**
 * Logging levels enumerator
 */
enum LEVEL { DEBUG, INFO, WARNING }

/**
 * Base colors for each log level
 */
const LOGGER_COLORS = [
    {name: 'DEBUG', color: '#686868'},
    {name: 'INFO', color: '#10b981'},
    {name: 'WARNING', color: '#fbbf24'}
];

/**
 * Unique style ID to identify the logger styles in the document head
 */
const LOGGER_STYLE_ID = 'jahia-cypress-ptf-logger-styles';

/**
 * Helper function to convert hex colors to rgb
 * @param {string} hex - hex color
 * @returns {string} - rgb color in format "r g b"
 * @example hex2rgb("#ffffff") => "255 255 255"
 */
function hex2rgb(hex: string):string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `${r} ${g} ${b}`;
}

/**
 * Creates a custom logger styles and attaches them to the document head.
 * Basically - attaches CSS styles to Cypress browser window to style the log messages.
 */
function attachLoggerStyles() {
    // Check if style tag with the corresponding attribute exists in the document head to avoid duplicating styles
    if (Cypress.$(window.top.document.head).find(`style[data-id="${LOGGER_STYLE_ID}"]`).length > 0) {
        return;
    }

    // Create style element
    const styleSheet = document.createElement('style');
    // Add marker attribute to identify the style tag
    styleSheet.setAttribute('data-id', LOGGER_STYLE_ID);

    // Build styles for each log level
    LOGGER_COLORS.forEach(logger => {
        const name = logger.name.toLowerCase();
        const color = hex2rgb(logger.color);
        styleSheet.textContent += `
        .command.command-name-ptf-${name} span.command-method {
            margin-right: 0.5rem;
            border-radius: 0.125rem;
            border-width: 1px;
            padding: 0.125rem 0.375rem;
            text-transform: uppercase;

            border-color: rgb(${color} / 1);
            background-color: rgb(${color} / 0.2);
            color: rgb(${color} / 1) !important;
        }

        .command.command-name-ptf-${name} span.command-message {
            color: rgb(${color} / 1);
            font-weight: normal;
        }

        .command.command-name-ptf-${name} span.command-message strong,
        .command.command-name-ptf-${name} span.command-message em { 
            color: rgb(${color} / 1);
        }
    `;
    });

    // Attach styles to the document head
    Cypress.$(window.top.document.head).append(styleSheet);
}

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
 * Logs WARNING message
 * @param {string} message - log message
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
function warning(message: string): Cypress.Chainable {
    return _send_(Log.LEVEL.WARNING, message);
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

    // Attach logger styles to the document head (done only once)
    attachLoggerStyles();

    // Check if the log level is enabled,
    // take into account the log level set in Cypress.env('LOG_LEVEL') and the log level set in the Log.LEVEL variable.
    // If the log level is enabled, send the message to Cypress log.
    if (level >= getVerbosity()) {
        // Send the message to Cypress log
        // use cy.then() to ensure that the log message is sent in the correct order
        // and use cy.wrap() to return the Cypress chainable object
        return cy.then(() => {
            Cypress.log({name: `ptf-${Log.LEVEL[level].toLowerCase()}`, displayName: `${Log.LEVEL[level].toUpperCase()}`, message: `${message}`});
        }).then(() => cy.wrap(null, {log: false}));
    }
}

// Export the Log module with methods to log messages and set the logging level
export const Log = {
    info,
    debug,
    warning,
    json,
    setVerbosity,
    LEVEL
};
