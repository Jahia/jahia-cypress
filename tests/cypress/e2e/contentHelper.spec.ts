import '../../../src/support/apollo/apollo';
import {addPage} from '../../../src/utils/ContentHelper';

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
