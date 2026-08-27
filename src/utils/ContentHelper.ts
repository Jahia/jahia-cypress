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
