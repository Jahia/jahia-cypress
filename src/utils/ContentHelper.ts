import {ApolloOptions} from '../support';
import {addNode} from './JCRHelper';

/** What a node builder receives: the name and language of the page it is added under. */
export type PageContext = {name: string; language?: string};

/** A function of the page that returns a node in `addNode`'s `InputJCRNode` shape, such as `areaNode()` or `textNode()`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeBuilder = (page: PageContext) => any;

export type AddPageOptions = {
    /** Path or identifier of the node the page is added under. */
    parentPathOrId: string;
    /** JCR name of the page node — the last segment of its path. */
    name: string;
    /** Value of `j:templateName`. Required: `jnt:page` declares it mandatory. */
    template: string;
    /** Value of `jcr:title`. Set without `language`, it is stored unlocalized and read back in every language. */
    title?: string;
    /** Language of `title`, and the default language of the node builders in `children`. */
    language?: string;
    /** Extra properties, set alongside the ones this helper derives. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties?: any [];
    /** Nodes added under the page: node builders, such as `areaNode()`, or nodes in `addNode`'s `InputJCRNode` shape. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children?: any [];
    /** Mixins applied to the page node. */
    mixins?: string [];
};

export type TextNodeOptions = {
    /** Node name, kept as given; without it, `text` or `bigText`, suffixed past the siblings. */
    name?: string;
    /** Language of the `text` property; defaults to the page language, and to unlocalized without one. */
    language?: string;
};

type NodeSpec = {
    name?: string;
    properties?: Record<string, string>;
    /** Set on every property of the node when given; left out otherwise. */
    language?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children?: any [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolve = (child: any, page: PageContext) => (typeof child === 'function' ? child(page) : child);

/*
 * Names the siblings. A given name is kept as is, and two siblings given one name throw. A node
 * without a name takes the local name of its type, suffixed past every name already taken:
 * `text`, `text-1`, `text-2`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nameChildren = (nodes: any []): any [] => {
    const taken = new Set<string>();
    nodes.filter(node => node.name !== undefined).forEach(node => {
        if (taken.has(node.name)) {
            throw new Error(`Two sibling nodes are named '${node.name}'`);
        }

        taken.add(node.name);
    });

    return nodes.map(node => {
        if (node.name !== undefined) {
            return node;
        }

        const base = node.primaryNodeType.split(':')[1];
        let name = base;
        for (let i = 1; taken.has(name); i++) {
            name = `${base}-${i}`;
        }

        taken.add(name);
        return {name, ...node};
    });
};

// A node builder of any type. Each public builder passes `language` only for a type whose
// properties are internationalized.
const node = (primaryNodeType: string, spec: NodeSpec = {}): NodeBuilder => page => {
    // Without a name, nameChildren() derives one from the type once it knows the sibling names.
    const built: Record<string, unknown> = spec.name === undefined ? {primaryNodeType} : {name: spec.name, primaryNodeType};
    const properties = Object.entries(spec.properties ?? {}).map(([name, value]) => (
        spec.language === undefined ? {name, type: 'STRING', value} : {name, type: 'STRING', value, language: spec.language}
    ));
    if (properties.length > 0) {
        built.properties = properties;
    }

    if (spec.children !== undefined) {
        built.children = nameChildren(spec.children.map(child => resolve(child, page)));
    }

    return built;
};

/**
 * Auxiliary wrapper-builder for simple and rich text nodes
 * @param primaryNodeType
 */
const textNodeBuilder = (primaryNodeType: string) => (value?: string, options: TextNodeOptions = {}): NodeBuilder => page => node(primaryNodeType, {
    name: options.name,
    properties: {text: value ?? page.name},
    language: options.language ?? page.language
})(page);

/**
 * Add a `jnt:page`, deriving `j:templateName` from `template` and `jcr:title` from
 * `title`/`language`. `properties` and `mixins` reach `addNode` untouched, and so does a node in
 * `children`: the helper imposes no page structure. A node builder in `children` is called with
 * the page name and language, so `children: [areaNode('area-main', textNode())]` adds a text in
 * the page language.
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
        children: nameChildren(children.map(child => resolve(child, {name, language}))),
        mixins: mixins
    }, apolloOptions);
};

/**
 * A `jnt:contentList` area. A child without a name is named after its type and suffixed past its
 * siblings, `text` then `text-1`; a given name is kept, and two children given one name throw.
 *
 * @param name the area name, which the template declares, such as `area-main`
 * @param children node builders, such as `textNode()`, or nodes in `addNode`'s `InputJCRNode` shape
 * @returns a node builder for `addPage`'s `children`
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const areaNode = (name: string, ...children: any []): NodeBuilder => node('jnt:contentList', {name, children});

/**
 * A `jnt:text` node.
 *
 * @param value the text; defaults to the page name
 * @param options the node name and the language of the text
 * @returns a node builder for `areaNode()`
 */
export const textNode = textNodeBuilder('jnt:text');

/**
 * A `jnt:bigText` node, whose text is HTML.
 *
 * @param value the HTML; defaults to the page name
 * @param options the node name and the language of the text
 * @returns a node builder for `areaNode()`
 */
export const bigTextNode = textNodeBuilder('jnt:bigText');
