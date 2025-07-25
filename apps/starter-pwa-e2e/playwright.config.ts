import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:3000';

// Check if API backend should be used for E2E tests
const useApiBackend = process.env['E2E_USE_API_BACKEND'] === 'true';
const apiUrl = process.env['E2E_API_BASE_URL'] || 'http://localhost:4000';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests */
  webServer: useApiBackend
    ? [
        // Start API server first when using API backend
        {
          command: 'PORT=4000 NODE_ENV=development CORS_ORIGIN=http://localhost:3000 DB_TYPE=memory DB_ORM=native npx nx serve starter-api',
          url: apiUrl,
          reuseExistingServer: true,
          cwd: workspaceRoot,
          timeout: 30000,
        },
        // Then start PWA server with API backend configuration
        {
          command: 'VITE_USE_API_BACKEND=true VITE_API_BASE_URL=' + apiUrl + ' npx nx serve starter-pwa',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          cwd: workspaceRoot,
          timeout: 30000,
        }
      ]
    : {
        // Default configuration: only start PWA server with local storage
        command: 'VITE_USE_API_BACKEND=false npx nx serve starter-pwa',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        cwd: workspaceRoot,
        timeout: 30000,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment for other browsers
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    }, */

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
