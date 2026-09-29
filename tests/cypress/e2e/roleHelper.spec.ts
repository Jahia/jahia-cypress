import '../../../src/support/apollo/apollo';
import {createRole, deleteRole} from '../../../src/utils/RoleHelper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApolloCall = {mutationFile?: string, variables?: any, errorPolicy?: string};

let lastCall: ApolloCall | null = null;

Cypress.Commands.add('apollo', ((options: ApolloCall) => {
    lastCall = options;
    return cy.wrap({data: {}});
}) as Cypress.CommandFn<'apollo'>);

describe('RoleHelper', () => {
    beforeEach(() => {
        lastCall = null;
    });

    it('adds a jnt:role under /roles', () => {
        return createRole({name: 'myRole', roleGroup: 'edit-role', permissions: ['jcr:read_default']}).then(() => {
            expect(lastCall.mutationFile).to.equal('graphql/jcr/mutation/addNode.graphql');
            expect(lastCall.variables.parentPathOrId).to.equal('/roles');
            expect(lastCall.variables.name).to.equal('myRole');
            expect(lastCall.variables.primaryNodeType).to.equal('jnt:role');
            expect(lastCall.variables.properties).to.deep.equal([
                {name: 'j:roleGroup', type: 'STRING', value: 'edit-role'},
                {name: 'j:permissionNames', type: 'STRING', values: ['jcr:read_default']},
                {name: 'j:privilegedAccess', type: 'BOOLEAN', value: 'false'}
            ]);
        });
    });

    it('stores the site permissions in a currentSite-access child', () => {
        return createRole({name: 'myRole', roleGroup: 'edit-role', sitePermissions: ['jContentAccess']}).then(() => {
            expect(lastCall.variables.children).to.deep.equal([{
                name: 'currentSite-access',
                primaryNodeType: 'jnt:externalPermissions',
                properties: [
                    {name: 'j:path', type: 'STRING', value: 'currentSite'},
                    {name: 'j:permissionNames', type: 'STRING', values: ['jContentAccess']}
                ]
            }]);
        });
    });

    it('adds no child when the role grants no site permission', () => {
        return createRole({name: 'myRole', roleGroup: 'server-role'}).then(() => {
            expect(lastCall.variables.children).to.deep.equal([]);
        });
    });

    it('forwards apolloOptions', () => {
        return createRole({name: 'myRole', roleGroup: 'edit-role'}, {errorPolicy: 'all'}).then(() => {
            expect(lastCall.errorPolicy).to.equal('all');
        });
    });

    it('deletes the role node under /roles', () => {
        return deleteRole('myRole').then(() => {
            expect(lastCall.mutationFile).to.equal('graphql/jcr/mutation/deleteNode.graphql');
            expect(lastCall.variables.pathOrId).to.equal('/roles/myRole');
        });
    });
});
