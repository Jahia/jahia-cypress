import {BaseComponent} from '../baseComponent';
import Chainable = Cypress.Chainable;

export class Accordion extends BaseComponent {
    static defaultSelector = '.moonstone-accordion';

    click(itemName: string): Accordion {
        this.get().find(`[aria-controls="${itemName}"][aria-expanded]`).click();
        return this;
    }

    listItems(): Chainable<string[]> {
        // The header of an item is `section > header` up to Moonstone 2.21 and `section > h3 > button` from 2.22
        return this.get().find('section > [aria-controls][aria-expanded], section > h3 > [aria-controls][aria-expanded]').then(items => {
            return Array.prototype.slice.call(items, 0).map(i => i.getAttribute('aria-controls'));
        });
    }

    getContent(): Chainable<JQuery> {
        return this.get().find('section > [role="region"]');
    }
}
