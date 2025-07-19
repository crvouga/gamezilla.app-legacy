import { defineConfig, devices } from '@playwright/test'
import { DotEnv } from './src/@/dotenv/dotenv'
import { FileSystem } from './src/@/file-system'
import { Url } from './src/@/url/url'

DotEnv.load({ fs: FileSystem({ t: 'node' }), paths: ['.env'] })

const PLAYWRIGHT_BASE_URL = Url.derive(process.env.PLAYWRIGHT_BASE_URL ?? '')

if (!PLAYWRIGHT_BASE_URL) throw new Error('PLAYWRIGHT_BASE_URL is not set')

const CI = Boolean(process.env.CI)

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src',
  testMatch: '**/*.spec.ts',
  timeout: 1000 * 30,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: Boolean(CI),
  /* Disable retries on CI to ensure failures cause job to fail */
  retries: 0,
  /* Run maximum parallel workers */
  // workers: '100%',
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: CI ? 'github' : 'list',
  /* Maximum number of test failures before stopping */
  maxFailures: 1,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: PLAYWRIGHT_BASE_URL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Record video on test failure */
    video: 'retain-on-failure',
    /* Headless mode is disabled in CI */
    headless: CI,
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run your local dev server before starting the tests */
})
