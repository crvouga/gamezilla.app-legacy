import { defineConfig, devices } from '@playwright/test'
import { DotEnv } from './src/@/dotenv/dotenv'
import { FileSystem } from './src/@/file-system'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });
DotEnv.load({ fs: FileSystem({ t: 'node' }), path: '.env' })

const PLAYWRIGHT_PROJECT_SAMPLE_COUNT = parseEnvInt('PLAYWRIGHT_PROJECT_SAMPLE_COUNT')

const projects = sample(
  [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  PLAYWRIGHT_PROJECT_SAMPLE_COUNT,
)

if (typeof PLAYWRIGHT_PROJECT_SAMPLE_COUNT === 'number') {
  console.log(`🎲 Running Playwright tests on a random sample of ${PLAYWRIGHT_PROJECT_SAMPLE_COUNT} projects`)
}

for (const project of projects) {
  console.log(`🎲 Running Playwright tests on ${project.name}`)
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src',
  testMatch: '**/*.spec.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Run maximum parallel workers */
  workers: '100%',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'github' : 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Configure projects for major browsers */
  projects,

  /* Run your local dev server before starting the tests */
})

function sample<T>(arr: T[], count: number | null | undefined): T[] {
  if (count === null || count === undefined) return arr
  if (count >= arr.length) return arr
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function parseEnvInt(name: string): number | null {
  const value = process.env[name]
  if (!value) return null
  const parsed = parseInt(value)
  if (isNaN(parsed)) return null
  return parsed
}
