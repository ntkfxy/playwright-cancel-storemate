import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  reporter: 'html',

  use: {
    baseURL: 'https://storemate-final.vercel.app/',
    testIdAttribute: 'data-test',

    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',

    launchOptions: {
      slowMo: 1000,
    },
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'chromium',

      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },

      dependencies: ['setup'],
    },
  ],
});