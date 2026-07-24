export declare const BrowserHelper: {
    logCookies: () => Cypress.Chainable<void>;
    logCookie: (cookieName: string) => Cypress.Chainable<void>;
    logSessionStorage: () => Cypress.Chainable<void>;
    logLocalStorage: () => Cypress.Chainable<void>;
    clearSessionCookies: () => Cypress.Chainable<void>;
    clearPersistentCookies: () => Cypress.Chainable<void>;
    simulateClose: () => void;
    resetState: () => void;
};
