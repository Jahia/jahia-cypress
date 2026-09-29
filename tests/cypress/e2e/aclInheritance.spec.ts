import '../../../src/support/apollo/apollo';
import {breakAclInheritance, restoreAclInheritance} from '../../../src/utils/UsersHelper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApolloCall = {queryFile?: string, mutationFile?: string, variables?: any};

let calls: ApolloCall[] = [];
let aclNodes: {name: string}[] = [];

Cypress.Commands.add('apollo', ((options: ApolloCall) => {
    calls.push(options);
    if (options.queryFile) {
        return cy.wrap({data: {jcr: {nodeByPath: {children: {nodes: aclNodes}}}}});
    }

    return cy.wrap({data: {}});
}) as Cypress.CommandFn<'apollo'>);

describe('UsersHelper ACL inheritance', () => {
    beforeEach(() => {
        calls = [];
        aclNodes = [];
    });

    it('creates the j:acl node when breaking inheritance on a node that has none', () => {
        return breakAclInheritance('/sites/mySite/home/page').then(() => {
            expect(calls.map(call => call.queryFile || call.mutationFile)).to.deep.equal([
                'graphql/jcr/query/getAclNode.graphql',
                'graphql/jcr/mutation/createAclNode.graphql'
            ]);
            expect(calls[0].variables).to.deep.equal({path: '/sites/mySite/home/page'});
            expect(calls[1].variables).to.deep.equal({pathOrId: '/sites/mySite/home/page', inherit: 'false'});
        });
    });

    it('updates the j:acl node when breaking inheritance on a node that has one', () => {
        aclNodes = [{name: 'j:acl'}];
        return breakAclInheritance('/sites/mySite/home/page').then(() => {
            expect(calls[1].mutationFile).to.equal('graphql/jcr/mutation/setAclInheritance.graphql');
            expect(calls[1].variables).to.deep.equal({pathOrId: '/sites/mySite/home/page', inherit: 'false'});
        });
    });

    it('updates the j:acl node when restoring inheritance on a node that has one', () => {
        aclNodes = [{name: 'j:acl'}];
        return restoreAclInheritance('/sites/mySite/home/page').then(() => {
            expect(calls[1].mutationFile).to.equal('graphql/jcr/mutation/setAclInheritance.graphql');
            expect(calls[1].variables).to.deep.equal({pathOrId: '/sites/mySite/home/page', inherit: 'true'});
        });
    });

    it('sends no mutation when restoring inheritance on a node without a j:acl node', () => {
        return restoreAclInheritance('/sites/mySite/home/page').then(() => {
            expect(calls.map(call => call.queryFile || call.mutationFile)).to.deep.equal([
                'graphql/jcr/query/getAclNode.graphql'
            ]);
        });
    });
});
