import { JahiaServer } from '../support';
export type ExportParameters = {
    viewContent?: boolean;
    viewVersion?: boolean;
    viewAcl?: boolean;
    viewLinks?: boolean;
    viewMetadata?: boolean;
    viewWorkflow?: boolean;
    exportPath?: string;
    exportformat: 'all' | 'site' | 'xml' | 'zip';
    root?: string;
    live?: boolean;
    users?: boolean;
    sitebox?: string[];
    paths?: string[];
    cleanup?: 'template' | 'simple';
    filesToZip?: string;
};
type ExportContentParams = {
    workspace?: string;
    nodePath?: string;
    exportFormat?: string;
    params?: ExportParameters;
    jahiaServer?: JahiaServer;
};
export declare const exportContent: ({ workspace, nodePath, exportFormat, params, jahiaServer }: ExportContentParams) => void;
export {};
