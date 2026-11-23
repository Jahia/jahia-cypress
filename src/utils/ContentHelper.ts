import {ApolloOptions} from '../support';
import {addNode} from './JCRHelper';

export type AddPageOptions = {
    /** Path or identifier of the node the page is added under. */
    parentPathOrId: string;
    /** JCR name of the page node — the last segment of its path. */
    name: string;
    /** Value of `j:templateName`. Required: `jnt:page` declares it mandatory. */
    template: string;
    /** Value of `jcr:title`. Set without `language`, it is stored unlocalized and read back in every language. */
    title?: string;
    /** Language of `title`. */
    language?: string;
    /** Extra properties, set alongside the ones this helper derives. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties?: any [];
    /** Nodes added under the page, in `addNode`'s `InputJCRNode` shape. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children?: any [];
    /** Mixins applied to the page node. */
    mixins?: string [];
};

/**
 * Add a `jnt:page`, deriving `j:templateName` from `template` and `jcr:title` from
 * `title`/`language`. Everything else — `properties`, `children`, `mixins` — reaches `addNode`
 * untouched: the helper imposes no page structure, so a caller that needs an area, a text node
 * or a second title language passes it in.
 *
 * @param options the page to add
 * @param apolloOptions options forwarded to `cy.apollo`
 * @returns the `addNode` mutation result
 */
export const addPage = (options: AddPageOptions, apolloOptions: ApolloOptions = {}): Cypress.Chainable => {
    const {parentPathOrId, name, template, title, language, properties = [], children = [], mixins = []} = options;

    const pageProperties = [...properties, {name: 'j:templateName', type: 'STRING', value: template}];
    if (title !== undefined) {
        const titleProperty: Record<string, string> = {name: 'jcr:title', type: 'STRING', value: title};
        if (language !== undefined) {
            titleProperty.language = language;
        }

        pageProperties.push(titleProperty);
    }

    return addNode({
        parentPathOrId: parentPathOrId,
        name: name,
        primaryNodeType: 'jnt:page',
        properties: pageProperties,
        children: children,
        mixins: mixins
    }, apolloOptions);
};

export type AddPageWithAreaOptions = AddPageOptions & {
    /** JCR name of the area list added under the page. Defaults to `area-main`. */
    area?: string;
    /**
     * Nodes added in the area, in `addNode`'s `InputJCRNode` shape. Defaults to one `jnt:text` named
     * `text`, whose text is the page name in `language`, or unlocalized when `language` is not set.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    areaContent?: any [];
};

/**
 * Add a `jnt:page` with an area under it, the structure a test needs to render a page with some content.
 * The area is a `jnt:contentList` that the `area` option names; it holds `areaContent`, or one `jnt:text`
 * when no content is given. `children`, if any, are added under the page after the area. Everything else is `addPage`.
 *
 * @param options the page to add, its area and the area content
 * @param apolloOptions options forwarded to `cy.apollo`
 * @returns the `addNode` mutation result
 */
export const addPageWithArea = (options: AddPageWithAreaOptions, apolloOptions: ApolloOptions = {}): Cypress.Chainable => {
    const {area = 'area-main', areaContent, children = [], ...pageOptions} = options;

    const textProperty: Record<string, string> = {name: 'text', type: 'STRING', value: options.name};
    if (options.language !== undefined) {
        textProperty.language = options.language;
    }

    const content = areaContent ?? [{name: 'text', primaryNodeType: 'jnt:text', properties: [textProperty]}];

    return addPage({
        ...pageOptions,
        children: [{name: area, primaryNodeType: 'jnt:contentList', children: content}, ...children]
    }, apolloOptions);
};
