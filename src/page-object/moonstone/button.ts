import {BaseComponent} from "../baseComponent"


export class Button extends BaseComponent {
    static defaultSelector = '.moonstone-button'

    click(): Button {
        this.get().click()
        return this
    }

}

