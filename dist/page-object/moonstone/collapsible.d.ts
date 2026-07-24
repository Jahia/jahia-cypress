import { BaseComponent } from '../baseComponent';
export declare class Collapsible extends BaseComponent {
    static defaultSelector: string;
    collapse(): Collapsible;
    expand(): Collapsible;
    shouldBeCollapsed(): void;
    shouldBeExpanded(): void;
}
