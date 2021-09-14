import {BaseComponent, getByContent, getByRole} from "../baseComponent"


export class Button extends BaseComponent {
    static defaultSelector = '.moonstone-button'

    static getByContent(content: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Button {
        return getByContent(Button, content, parent, assertion)
    }

    static getByRole(role: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Button {
        return getByRole(Button, role, parent, assertion)
    }

    click(): Button {
        this.get().click()
        return this
    }

}

