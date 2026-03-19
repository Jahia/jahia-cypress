import {BaseComponent} from '../baseComponent';

export class Collapsible extends BaseComponent {
    static defaultSelector = '.moonstone-collapsible';

    collapse(): Collapsible {
        this.get().children('div').then($child => {
            if ($child.hasClass('moonstone-collapsible_content_expanded')) {
                this.get().find('.moonstone-collapsible_button').click();
            }
        });
        return this;
    }

    expand(): Collapsible {
        this.get().children('div').then($child => {
            if ($child.hasClass('moonstone-collapsible_content_collapsed')) {
                this.get().find('.moonstone-collapsible_button').click().scrollIntoView();
            }
        });
        return this;
    }

    shouldBeCollapsed(): void {
        this.get().find('.moonstone-collapsible_content_collapsed').should('exist');
    }

    shouldBeExpanded(): void {
        this.get().find('.moonstone-collapsible_content_expanded').should('exist');
    }
}
