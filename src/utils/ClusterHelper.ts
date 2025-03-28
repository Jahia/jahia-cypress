export const waitUntilJournalSync = (predicate?: (cluster) => boolean, timeout = 60000,
    interval = 1000) : void => {
    cy.waitUntil(() =>
        cy.apollo({
            fetchPolicy: 'no-cache',
            queryFile: 'graphql/jcr/query/adminCluster.graphql'
        }).then(result => {
            const adminResult = result?.data?.admin;
            if (adminResult) {
                return adminResult.cluster.isActivated &&
                        adminResult.cluster.journal.isClusterSync &&
                        (!predicate || predicate(adminResult.cluster));
            }
        }),
    {
        errorMsg: 'Timeout waiting for journal to be synced',
        timeout: timeout,
        verbose: true,
        interval: interval
    });
};
