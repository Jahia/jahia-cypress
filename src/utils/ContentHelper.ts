import {ApolloOptions} from '../support';
import {addNode} from './JCRHelper';

/** What a `children` function of `addPage` receives: the name and language of the page. */
export type PageContext = {name: string; language?: string};

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
    /**
     * Nodes added under the page, in `addNode`'s `InputJCRNode` shape, or a function of the page
     * name and language that returns them, such as `pageContent()`.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children?: any [] | ((page: PageContext) => any []);
    /** Mixins applied to the page node. */
    mixins?: string [];
};

/**
 * Add a `jnt:page`, deriving `j:templateName` from `template` and `jcr:title` from
 * `title`/`language`. Everything else — `properties`, `children`, `mixins` — reaches `addNode`
 * untouched: the helper imposes no page structure, so a caller that needs an area, a text node
 * or a second title language passes it in. A `children` function is called with the page name
 * and language first, so `children: pageContent()` adds the common structure in the page language.
 *
 * @param options the page to add
 * @param apolloOptions options forwarded to `cy.apollo`
 * @returns the `addNode` mutation result
 */
export const addPage = (options: AddPageOptions, apolloOptions: ApolloOptions = {}): Cypress.Chainable => {
    const {parentPathOrId, name, template, title, language, properties = [], children = [], mixins = []} = options;
    const pageChildren = typeof children === 'function' ? children({name, language}) : children;

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
        children: pageChildren,
        mixins: mixins
    }, apolloOptions);
};

/**
 * Children for `addPage`: an `area-main` list holding one node named `text`, whose `text`
 * property is in the page language, or unlocalized when the page has no language.
 *
 * @param value the text; defaults to the page name
 * @param primaryNodeType the type of the node; defaults to `jnt:text`
 * @returns a `children` function for `addPage`
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pageContent = (value?: string, primaryNodeType = 'jnt:text') => ({name, language}: PageContext): any [] => {
    const textProperty: Record<string, string> = {name: 'text', type: 'STRING', value: value ?? name};
    if (language !== undefined) {
        textProperty.language = language;
    }

    return [{
        name: 'area-main',
        primaryNodeType: 'jnt:contentList',
        children: [{name: 'text', primaryNodeType: primaryNodeType, properties: [textProperty]}]
    }];
};
