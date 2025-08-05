import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: false, // Run tests sequentially to avoid multiple browsers
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Only one worker to avoid multiple browsers
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable headed mode for local development
        headless: process.env.HEADLESS !== 'false',
      },
    },
    // Only include other browsers for local development
    ...(process.env.CI ? [] : [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },
    ]),
  ],

  // Only use webServer for local development
  ...(process.env.CI ? {} : {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
  }),

  // Global test timeout
  timeout: 60000, // Increased to 60 seconds
  expect: {
    timeout: 15000, // Increased to 15 seconds
  },
}); 