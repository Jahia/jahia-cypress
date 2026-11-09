import {BaseComponent} from '../baseComponent';
import Chainable = Cypress.Chainable;

// The header of an item is a `header` up to Moonstone 2.21 and a `button` in an `h3` from 2.22:
// both carry `aria-controls` and `aria-expanded`. The content of an open item is a `role="region"`.
const HEADER = '[aria-controls][aria-expanded]';
const CONTENT = '[role="region"]';

export class Accordion extends BaseComponent {
    static defaultSelector = '.moonstone-accordion';

    click(itemName: string): Accordion {
        this.get().find(`[aria-controls="${itemName}"][aria-expanded]`).click();
        return this;
    }

    listItems(): Chainable<string[]> {
        return this.findOutsideContent(HEADER).then(items => {
            return Array.prototype.slice.call(items, 0).map(i => i.getAttribute('aria-controls'));
        });
    }

    getContent(): Chainable<JQuery> {
        return this.findOutsideContent(CONTENT);
    }

    // Skips what the content of an open item renders, such as the toggle of a tree
    private findOutsideContent(selector: string): Chainable<JQuery> {
        return this.get().find(selector).filter((_, element) => Cypress.$(element).parentsUntil(Accordion.defaultSelector, CONTENT).length === 0);
    }
}
