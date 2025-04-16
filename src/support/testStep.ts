/* eslint-disable @typescript-eslint/ban-ts-comment*/
/**
 *  Extends global Cypress Chainable interface with custom commands from 'commands.js' to avoid TypeScript errors when using them.
 */
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable<Subject> {
            /**
             * Creates a foldable test-case step with corresponding message in Cypress log
             * @param {string} message - folder's message
             * @param {() => void} func - function to be executed and wrapped into the folder
             * @returns void
             * @example
             *         cy.step('Navigate to the destination point', () => {
             *              cy.get('selector').click();
             *              ...
             *         });
             *
             *        cy.step('Do something', () => {
             *              cy.get('element').click();
             *              ...
             *         });
             */
            step (message: string, func: () => void): void;
        }
    }
}

export const step = (message: string, func: () => void): void => {
    cy.then(() => {
        // @ts-ignore
        Cypress.log({groupStart: true, displayName: '[ STEP ]', message: `${message}`});
    }).then(() => {
        func();
    }).then(() => {
        // @ts-ignore
        Cypress.log({groupEnd: true, emitOnly: true});
    });
};
