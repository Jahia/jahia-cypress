import {defineConfig} from 'cypress';

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
            return config;
        }
    }
});
