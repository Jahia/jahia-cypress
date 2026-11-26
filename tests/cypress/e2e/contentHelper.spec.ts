import '../../../src/support/apollo/apollo';
import {addPage, areaNode, bigTextNode, textNode} from '../../../src/utils/ContentHelper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApolloCall = {mutationFile?: string, variables?: any, errorPolicy?: string};

let lastCall: ApolloCall | null = null;

Cypress.Commands.add('apollo', ((options: ApolloCall) => {
    lastCall = options;
    return cy.wrap({data: {}});
}) as Cypress.CommandFn<'apollo'>);

describe('ContentHelper addPage', () => {
    beforeEach(() => {
        lastCall = null;
    });

    it('adds a jnt:page under the given parent', () => {
        return addPage({
            parentPathOrId: '/sites/mySite/home',
            name: 'myPage',
            template: 'simple',
            title: 'My page',
            language: 'en'
        }).then(() => {
            expect(lastCall.mutationFile).to.equal('graphql/jcr/mutation/addNode.graphql');
            expect(lastCall.variables.parentPathOrId).to.equal('/sites/mySite/home');
            expect(lastCall.variables.name).to.equal('myPage');
            expect(lastCall.variables.primaryNodeType).to.equal('jnt:page');
        });
    });

    it('derives j:templateName and jcr:title in the given language', () => {
        return addPage({
            parentPathOrId: '/sites/mySite/home',
            name: 'myPage',
            template: 'simple',
            title: 'My page',
            language: 'en'
        }).then(() => {
            expect(lastCall.variables.properties).to.deep.equal([
                {name: 'j:templateName', type: 'STRING', value: 'simple'},
                {name: 'jcr:title', type: 'STRING', value: 'My page', language: 'en'}
            ]);
        });
    });

    it('imposes no page structure: children, mixins and properties reach addNode untouched', () => {
        const children = [{name: 'pagecontent', primaryNodeType: 'jnt:contentList'}];
        const mixins = ['jmix:sitemap'];
        const properties = [{name: 'jcr:title', type: 'STRING', value: 'Ma page', language: 'fr'}];

        return addPage({
            parentPathOrId: '/sites/mySite/home',
            name: 'myPage',
            template: 'simple',
            title: 'My page',
            language: 'en',
            children: children,
            mixins: mixins,
            properties: properties
        }).then(() => {
            expect(lastCall.variables.children).to.deep.equal(children);
            expect(lastCall.variables.mixins).to.deep.equal(mixins);
            expect(lastCall.variables.properties).to.deep.equal([
                {name: 'jcr:title', type: 'STRING', value: 'Ma page', language: 'fr'},
                {name: 'j:templateName', type: 'STRING', value: 'simple'},
                {name: 'jcr:title', type: 'STRING', value: 'My page', language: 'en'}
            ]);
        });
    });

    it('sets no jcr:title when no title is given', () => {
        return addPage({
            parentPathOrId: '/sites/mySite/home',
            name: 'myPage',
            template: 'simple'
        }).then(() => {
            expect(lastCall.variables.properties).to.deep.equal([
                {name: 'j:templateName', type: 'STRING', value: 'simple'}
            ]);
        });
    });

    it('sets an unlocalized jcr:title when a title is given without a language', () => {
        return addPage({
            parentPathOrId: '/sites/mySite/home',
            name: 'myPage',
            template: 'simple',
            title: 'My page'
        }).then(() => {
            expect(lastCall.variables.properties).to.deep.equal([
                {name: 'j:templateName', type: 'STRING', value: 'simple'},
                {name: 'jcr:title', type: 'STRING', value: 'My page'}
            ]);
        });
    });

    it('defaults children and mixins to empty arrays', () => {
        return addPage({
            parentPathOrId: '/sites/mySite/home',
            name: 'myPage',
            template: 'simple'
        }).then(() => {
            expect(lastCall.variables.children).to.deep.equal([]);
            expect(lastCall.variables.mixins).to.deep.equal([]);
        });
    });

    it('forwards apollo options', () => {
        return addPage({
            parentPathOrId: '/sites/mySite/home',
            name: 'myPage',
            template: 'simple'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, {errorPolicy: 'ignore'} as any).then(() => {
            expect(lastCall.errorPolicy).to.equal('ignore');
        });
    });
});

describe('ContentHelper node builders', () => {
    const page = {parentPathOrId: '/sites/mySite/home', name: 'myPage', template: 'simple', title: 'My page', language: 'en'};

    const expectedText = (name: string, primaryNodeType: string, value: string, language?: string) => ({
        name,
        primaryNodeType,
        properties: [language === undefined ? {name: 'text', type: 'STRING', value} : {name: 'text', type: 'STRING', value, language}]
    });

    beforeEach(() => {
        lastCall = null;
    });

    it('areaNode(name, textNode()) adds the area with a jnt:text holding the page name in the page language', () => {
        return addPage({...page, children: [areaNode('area-main', textNode())]}).then(() => {
            expect(lastCall.variables.children).to.deep.equal([{
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                children: [expectedText('text', 'jnt:text', 'myPage', 'en')]
            }]);
        });
    });

    it('takes the area name, the value and the node type', () => {
        return addPage({...page, children: [areaNode('pagecontent', bigTextNode('<p>my text</p>'))]}).then(() => {
            expect(lastCall.variables.children).to.deep.equal([{
                name: 'pagecontent',
                primaryNodeType: 'jnt:contentList',
                children: [expectedText('bigText', 'jnt:bigText', '<p>my text</p>', 'en')]
            }]);
        });
    });

    it('sets an unlocalized text when the page has no language', () => {
        return addPage({parentPathOrId: '/sites/mySite/home', name: 'myPage', template: 'simple', children: [areaNode('area-main', textNode())]}).then(() => {
            expect(lastCall.variables.children[0].children).to.deep.equal([expectedText('text', 'jnt:text', 'myPage')]);
        });
    });

    it('lets a node set its own name and language', () => {
        return addPage({...page, children: [areaNode('area-main', textNode('Bonjour', {name: 'intro', language: 'fr'}))]}).then(() => {
            expect(lastCall.variables.children[0].children).to.deep.equal([expectedText('intro', 'jnt:text', 'Bonjour', 'fr')]);
        });
    });

    it('names the unnamed children of an area after their type, suffixed', () => {
        return addPage({...page, children: [areaNode('area-main', textNode('a'), textNode('b'), textNode('c'), bigTextNode('d'))]}).then(() => {
            expect(lastCall.variables.children[0].children.map(child => child.name)).to.deep.equal(['text', 'text-1', 'text-2', 'bigText']);
        });
    });

    it('keeps a given name and suffixes the unnamed nodes past it', () => {
        return addPage({...page, children: [areaNode('area-main', textNode('a'), textNode('b', {name: 'text-1'}), textNode('c'))]}).then(() => {
            expect(lastCall.variables.children[0].children.map(child => child.name)).to.deep.equal(['text', 'text-1', 'text-2']);
        });
    });

    it('throws on two nodes given one name, without suffixing either', () => {
        expect(() => addPage({...page, children: [areaNode('area-main', textNode('a', {name: 'intro'}), textNode('b', {name: 'intro'}))]}))
            .to.throw('Two sibling nodes are named \'intro\'');
        expect(lastCall).to.equal(null);
    });

    it('mixes node builders with plain nodes, in an area and under the page', () => {
        const links = {name: 'links', primaryNodeType: 'jnt:linkList'};
        const footer = {name: 'footer', primaryNodeType: 'jnt:contentList'};

        return addPage({...page, children: [areaNode('area-main', textNode('my text'), links), footer]}).then(() => {
            expect(lastCall.variables.children.map(child => child.name)).to.deep.equal(['area-main', 'footer']);
            expect(lastCall.variables.children[0].children[1]).to.deep.equal(links);
            expect(lastCall.variables.children[1]).to.deep.equal(footer);
        });
    });
});
