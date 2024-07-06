"use strict";
exports.__esModule = true;
exports.removeVanityUrl = exports.getVanityUrl = exports.addVanityUrl = void 0;
var addVanityUrl = function (pathOrId, language, url) {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            language: language,
            url: url
        },
        mutationFile: 'graphql/jcr/mutation/addVanityUrl.graphql'
    });
};
exports.addVanityUrl = addVanityUrl;
var getVanityUrl = function (path, languages) {
    return cy.apollo({
        variables: {
            path: path,
            languages: languages
        },
        queryFile: 'graphql/jcr/query/getVanityUrls.graphql'
    });
};
exports.getVanityUrl = getVanityUrl;
var removeVanityUrl = function (pathOrId, url) {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            url: url
        },
        mutationFile: 'graphql/jcr/mutation/removeVanityUrl.graphql'
    });
};
exports.removeVanityUrl = removeVanityUrl;
