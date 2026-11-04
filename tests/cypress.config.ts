import {defineConfig} from 'cypress';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {registerGlobalVarsTasks} from '../src/plugins/globalVars';
import {assetsReader} from '../src/cli/provisioningCheck';

type AssetsFixture = {
    /** The files of the assets folder, by their path in it */
    files: Record<string, string>;
    /** The symbolic links of the assets folder, by their path in it, to the path they point at */
    links: Record<string, string>;
    /** The names to look up */
    names: string[];
};

// assetsReader reads the filesystem, which the spec of the check, run in the browser, reaches here
const readAssets = ({files, links, names}: AssetsFixture) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'assets-'));
    try {
        Object.keys(files).forEach(file => {
            fs.mkdirSync(path.dirname(path.join(dir, file)), {recursive: true});
            fs.writeFileSync(path.join(dir, file), files[file]);
        });
        Object.keys(links).forEach(link => fs.symlinkSync(path.join(dir, links[link]), path.join(dir, link)));
        const read = assetsReader(dir);
        return names.map(name => read(name));
    } finally {
        fs.rmSync(dir, {recursive: true, force: true});
    }
};

export default defineConfig({
    reporter: 'cypress-multi-reporters',

    reporterOptions: {
        configFile: 'reporter-config.json'
    },

    e2e: {
        // No baseUrl needed for unit tests
        // Spec pattern for test files
        specPattern: 'cypress/e2e/**/*.spec.ts',
        // Support file
        supportFile: false,
        // Video and screenshot settings
        video: false,
        screenshotOnRunFailure: false,
        setupNodeEvents(on, config) {
            registerGlobalVarsTasks(on);
            on('task', {readAssets});
            return config;
        }
    }
});
