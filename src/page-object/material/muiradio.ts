import {BaseComponent} from '../baseComponent';

export class MUIRadio extends BaseComponent {
    static defaultSelector = 'label'

    click(): MUIRadio {
        this.get().click();
        return this;
    }
}

