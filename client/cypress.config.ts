// const { defineConfig } = require("cypress");
import { defineConfig } from "cypress";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: "./.env" });

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    excludeSpecPattern: [
      "**/1-getting-started/**",
      "**/2-advanced-examples/**",
      "**/page-objects/**"
    ],
    tsConfig: 'cypress/tsconfig.ts', // Make sure this path is correct

    setupNodeEvents(on, config) {
      config.env.CYPRESS_TEST_WITH = process.env.CYPRESS_TEST_WITH;

      return config;
    },
  },
});
