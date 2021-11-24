/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

type RepeatUntilOptions = {
    attempts: number,
    callback: () => void,
    delay: number,
}

const defaultOptions: RepeatUntilOptions = {
    attempts: 10,
    callback: () => cy.reload({log:false}),
    delay: 1000
}

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            repeatUntil(selector: string, options?: Partial<RepeatUntilOptions>): Chainable<JQuery>
        }
    }
}

export const repeatUntil = (selector: string, options: Partial<RepeatUntilOptions> = {}): void => {
    options = { ...defaultOptions, ...options }

    const log = Cypress.log({
        name: 'repeatUntil',
        message: `Reload until ${selector}, remaining attempts : ${options.attempts}`,
        consoleProps: () => {
            return {
                attempts: options.attempts,
            }
        },
    })

    const items = Cypress.$(selector)
    if (items.length) {
        log.set({ $el: items })
        cy.wrap(items, {log: false})
        return
    }

    if (options.attempts > 1) {
        log.end()
        options.callback()

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(options.delay)
        cy.repeatUntil(selector, {...options, attempts: options.attempts - 1})
    } else {
        const err = Error('Items not found.')
        log.error(err)
        throw err
    }
}
