/// <reference types="cypress" />
export declare type RepeatUntilOptions = {
    attempts: number;
    callback: () => void;
    delay: number;
};
declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            repeatUntil(selector: string, options?: Partial<RepeatUntilOptions>): Chainable<JQuery>;
        }
    }
}
export declare const repeatUntil: (selector: string, options?: Partial<RepeatUntilOptions>) => void;
