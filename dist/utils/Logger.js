"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
/**
 * ENV variable to store the logging verbosity level
 */
var envVarLoggingVerbosity = '__LOG_VERBOSITY__';
/**
 * Logging levels enumerator
 */
var LEVEL;
(function (LEVEL) {
    LEVEL[LEVEL["DEBUG"] = 0] = "DEBUG";
    LEVEL[LEVEL["INFO"] = 1] = "INFO";
    LEVEL[LEVEL["WARNING"] = 2] = "WARNING";
})(LEVEL || (LEVEL = {}));
/**
 * Base colors for each log level
 */
var LOGGER_COLORS = [
    { name: 'DEBUG', color: '#686868' },
    { name: 'INFO', color: '#10b981' },
    { name: 'WARNING', color: '#fbbf24' }
];
/**
 * Unique style ID to identify the logger styles in the document head
 */
var LOGGER_STYLE_ID = 'jahia-cypress-ptf-logger-styles';
/**
 * Helper function to convert hex colors to rgb
 * @param {string} hex - hex color
 * @returns {string} - rgb color in format "r g b"
 * @example hex2rgb("#ffffff") => "255 255 255"
 */
function hex2rgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return "".concat(r, " ").concat(g, " ").concat(b);
}
/**
 * Creates a custom logger styles and attaches them to the document head.
 * Basically - attaches CSS styles to Cypress browser window to style the log messages.
 */
function attachLoggerStyles() {
    // Check if style tag with the corresponding attribute exists in the document head to avoid duplicating styles
    if (Cypress.$(window.top.document.head).find("style[data-id=\"".concat(LOGGER_STYLE_ID, "\"]")).length > 0) {
        return;
    }
    // Create style element
    var styleSheet = document.createElement('style');
    // Add marker attribute to identify the style tag
    styleSheet.setAttribute('data-id', LOGGER_STYLE_ID);
    // Build styles for each log level
    LOGGER_COLORS.forEach(function (logger) {
        var name = logger.name.toLowerCase();
        var color = hex2rgb(logger.color);
        styleSheet.textContent += "\n        .command.command-name-ptf-".concat(name, " span.command-method {\n            margin-right: 0.5rem;\n            border-radius: 0.125rem;\n            border-width: 1px;\n            padding: 0.125rem 0.375rem;\n            text-transform: uppercase;\n\n            border-color: rgb(").concat(color, " / 1);\n            background-color: rgb(").concat(color, " / 0.2);\n            color: rgb(").concat(color, " / 1) !important;\n        }\n\n        .command.command-name-ptf-").concat(name, " span.command-message {\n            color: rgb(").concat(color, " / 1);\n            font-weight: normal;\n        }\n\n        .command.command-name-ptf-").concat(name, " span.command-message strong,\n        .command.command-name-ptf-").concat(name, " span.command-message em { \n            color: rgb(").concat(color, " / 1);\n        }\n    ");
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
function getVerbosity() {
    return typeof Cypress.env(envVarLoggingVerbosity) === 'undefined' ? LEVEL.INFO : Cypress.env(envVarLoggingVerbosity);
}
/**
 * Sets the logging verbosity level for the logger. Messages with a level lower than the set level will not be logged.
 * @param {LEVEL} level - log level to be set (e.g. 'DEBUG', 'INFO')
 * @return {void}
 */
function setVerbosity(level) {
    Cypress.env(envVarLoggingVerbosity, level);
}
/**
 * Logs INFO message
 * @param {string} message - log message
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
function info(message) {
    return _send_(exports.Log.LEVEL.INFO, message);
}
/**
 * Logs DEBUG message
 * @param {string} message - log message
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
function debug(message) {
    return _send_(exports.Log.LEVEL.DEBUG, message);
}
/**
 * Logs WARNING message
 * @param {string} message - log message
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
function warning(message) {
    return _send_(exports.Log.LEVEL.WARNING, message);
}
/**
 * Logs JSON object with logging level given
 * @param {LEVEL} level - log level (e.g. 'INFO', 'DEBUG')
 * @param {string} text - json object to be logged
 * @returns {Cypress.Chainable} - Cypress chainable object
 */
function json(level, text) {
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
function _send_(level, message) {
    // Check if the log level is valid
    if (!Object.values(exports.Log.LEVEL).includes(level)) {
        throw new Error("Log level \"".concat(level, "\" is not supported. Supported levels are: ").concat(exports.Log.LEVEL));
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
        return cy.then(function () {
            Cypress.log({ name: "ptf-".concat(exports.Log.LEVEL[level].toLowerCase()), displayName: "".concat(exports.Log.LEVEL[level].toUpperCase()), message: "".concat(message) });
        }).then(function () { return cy.wrap(null, { log: false }); });
    }
}
// Export the Log module with methods to log messages and set the logging level
exports.Log = {
    info: info,
    debug: debug,
    warning: warning,
    json: json,
    setVerbosity: setVerbosity,
    LEVEL: LEVEL
};
