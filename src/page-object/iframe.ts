import {BaseComponent} from "./baseComponent"
import Chainable = Cypress.Chainable;

export class IFrame extends BaseComponent {
    private body: JQuery<HTMLElement>

    constructor(selector = 'iframe') {
        super(selector)
        this.get()
            .should(f => {
                const fr: HTMLFrameElement = f[0] as HTMLFrameElement
                expect(fr.contentWindow.location.href).not.equals('about:blank')
                expect(fr.contentWindow.document.readyState).equals('complete')
                expect(fr.contentDocument.body).not.be.empty
            })
            .its('0.contentDocument.body').as('framebody' + this.id)
    }

    getBody(): Chainable<JQuery> {
        return cy.get('@framebody' + this.id)
    }

    enter(): void {
        this.get().then(f => {
            const fr: HTMLFrameElement = f[0] as HTMLFrameElement
            cy.visit(fr.contentWindow.location.href)
        })
    }

}