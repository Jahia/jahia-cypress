declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            executeGroovy(scriptFile: string, replacements?: {
                [key: string]: string;
            }, jahiaServer?: JahiaServer): Chainable<any>;
        }
    }
}
declare type JahiaServer = {
    url: string;
    username: string;
    password: string;
};
export declare const executeGroovy: (scriptFile: string, replacements?: {
    [key: string]: string;
}, jahiaServer?: JahiaServer) => void;
export {};
