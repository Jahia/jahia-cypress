import {BaseComponent, getByRole} from "../baseComponent"


export class MUIRadio extends BaseComponent {
    static defaultSelector = 'label'

    static getByRole(role: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): MUIRadio {
        return getByRole(MUIRadio, role, parent, assertion)
    }

    click(): MUIRadio {
        this.get().click()
        return this
    }

}

