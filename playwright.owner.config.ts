import { defineConfig, devices } from '@playwright/test'

/**
 * E2E against the deployed Sportiv Owner Web app.
 * @see https://app.sportiv.pk/
 */
export default defineConfig({
  testDir: '.',
  testMatch: ['**/e2e/owner/**/*.spec.ts', '**/tests/auth/**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL:
      process.env.OWNER_BASE_URL ??
      'https://app.sportiv.pk',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
