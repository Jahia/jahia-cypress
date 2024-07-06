import { JahiaServer } from '../support';
export declare const createSite: (siteKey: string, config?: {
    languages?: string;
    templateSet: string;
    serverName: string;
    locale: string;
}, jahiaServer?: JahiaServer) => void;
export declare const deleteSite: (siteKey: string, jahiaServer?: JahiaServer) => void;
export declare const enableModule: (moduleName: string, siteKey: string, jahiaServer?: JahiaServer) => void;
export declare const disableModule: (moduleName: string, siteKey: string, apollo?: Function) => void;
export declare const editSite: (siteKey: string, config?: {
    serverName: string;
}, jahiaServer?: JahiaServer) => void;
