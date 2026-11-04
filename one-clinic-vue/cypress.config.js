import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 10000,
    requestTimeout: 20000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
  },
  env: {
    apiUrl: "http://127.0.0.1:8000",
    senhaPadrao: "Senha@Cypress2026",
    roleIds: {
      ADMIN: 1,
      SECRETARIO: 2,
      PROFISSIONAL: 3,
    },
  },
});
