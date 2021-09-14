import {BaseComponent, getByRole} from "../baseComponent"
import TypeOptions = Cypress.TypeOptions;

export class MUIInput extends BaseComponent {
    static defaultSelector = 'input'

    static getByRole(role: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): MUIInput {
        return getByRole(MUIInput, role, parent, assertion)
    }

    clear(): MUIInput {
        this.get().clear()
        return this
    }

    type(text: string, options?: Partial<TypeOptions>): MUIInput {
        this.get().type(text, options)
        return this
    }

}


