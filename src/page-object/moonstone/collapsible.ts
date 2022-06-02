import {BaseComponent} from "../baseComponent"


export class Collapsible extends BaseComponent {
    static defaultSelector = '.moonstone-collapsible'

    collapse(): Collapsible {
        this.get().find('.moonstone-collapsible_button').click()
        return this
    }

    expand(): Collapsible {
        this.get().find('.moonstone-collapsible_button').click()
        this.get().scrollIntoView()
        return this
    }
}
