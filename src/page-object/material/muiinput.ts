import {BaseComponent} from '../baseComponent';
import TypeOptions = Cypress.TypeOptions;

export class MUIInput extends BaseComponent {
    static defaultSelector = 'div'

    clear(): MUIInput {
        this.get().clear();
        return this;
    }

    type(text: string, options?: Partial<TypeOptions>): MUIInput {
        this.get().type(text, options);
        return this;
    }
}

