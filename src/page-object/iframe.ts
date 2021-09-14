import {BaseComponent, get} from "./baseComponent"
import Chainable = Cypress.Chainable;

export class IFrame extends BaseComponent {
    static defaultSelector = 'iframe'

    static get(parent?: BaseComponent): IFrame {
        return get(IFrame, parent)
    }

    private body: JQuery<HTMLElement>

    constructor(element: Chainable<JQuery>, assertion?: (s: JQuery) => void) {
        super(element, assertion)
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