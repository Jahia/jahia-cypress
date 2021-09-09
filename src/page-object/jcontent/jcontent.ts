import {Accordion, SecondaryNav, Table} from "../moonstone";
import {BasePage} from "../basePage";

export class JContent extends BasePage {
    secondaryNav: SecondaryNav
    accordion: Accordion
    table: Table

    static visit(site: string, language:string, path:string): JContent {
        cy.visit(`/jahia/jcontent/${site}/${language}/${path}`)
        return new JContent()
    }

    constructor() {
        super()
        this.secondaryNav = new SecondaryNav()
        this.accordion = new Accordion(this.secondaryNav.getSelector())
    }

    getTable(): Table {
        if (!this.table) {
            this.table = new Table()
        }
        return this.table
    }

    select(accordion:string): void {
        this.accordion.click(accordion)
    }

}
