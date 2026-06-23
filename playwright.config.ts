import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the auster.network E2E QA suite.
 *
 * Design goals:
 *  - Cross-browser (Chromium, Firefox, WebKit) + two mobile viewports.
 *  - Resilient against a live production target: sensible retries + timeouts.
 *  - Rich failure diagnostics: trace on first retry, screenshot + video on failure.
 *  - Visual-regression tests isolated into their own opt-in project so a missing
 *    baseline never reds the pipeline on a fresh checkout.
 */

const BASE_URL = process.env.BASE_URL ?? 'https://auster.network';
const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/specs',
  /* Visual tests are seeded with baselines; small AA/rendering deltas are tolerated. */
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' },
  },
  timeout: 45_000,
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 1,
  workers: IS_CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'en-US',
    timezoneId: 'UTC',
    /* A stable, identifiable UA helps when triaging server logs against test traffic. */
    userAgent:
      'Mozilla/5.0 (Auster-QA-Suite; +https://github.com/TobiasBoscoBrown/auster-playwright-qa-suite) Playwright',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /visual\.spec\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /visual\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /visual\.spec\.ts/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: /visual\.spec\.ts/,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      testIgnore: /visual\.spec\.ts/,
    },
    /* Opt-in visual project. Run with: npm run test:visual (after seeding baselines). */
    {
      name: 'visual',
      testMatch: /visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
