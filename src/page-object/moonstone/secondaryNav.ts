import {BaseComponent, get} from "../baseComponent"

export class SecondaryNav extends BaseComponent{
    static defaultSelector = '.moonstone-secondaryNav_wrapper'

    static get(parent?: BaseComponent, assertion?: (s: JQuery) => void): SecondaryNav {
        return get(SecondaryNav, parent, assertion)
    }
}