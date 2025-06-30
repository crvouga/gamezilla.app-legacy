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

const ALL_PROJECTS = Object.entries(devices).map(([name, use]) => ({ name, use }))
const PLAYWRIGHT_PROJECT_SAMPLE_COUNT = parseEnvInt('PLAYWRIGHT_PROJECT_SAMPLE_COUNT')
const projects = sample(ALL_PROJECTS, PLAYWRIGHT_PROJECT_SAMPLE_COUNT)

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
  workers: process.env.CI ? 1 : '100%',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Configure projects for major browsers */
  projects: projects,
  // projects: (() => {
  //   // // All available projects
  //   // const allProjects = [
  //   //   {
  //   //     name: 'chromium',
  //   //     use: { ...devices['Desktop Chrome'] },
  //   //   },
  //   //   {
  //   //     name: 'firefox',
  //   //     use: { ...devices['Desktop Firefox'] },
  //   //   },
  //   //   {
  //   //     name: 'webkit',
  //   //     use: { ...devices['Desktop Safari'] },
  //   //   },
  //   //   {
  //   //     name: 'Mobile Chrome',
  //   //     use: { ...devices['Pixel 5'] },
  //   //   },
  //   //   {
  //   //     name: 'Mobile Safari',
  //   //     use: { ...devices['iPhone 12'] },
  //   //   },
  //   //   {
  //   //     name: 'Microsoft Edge',
  //   //     use: { ...devices['Desktop Edge'], channel: 'msedge' },
  //   //   },
  //   //   {
  //   //     name: 'Google Chrome',
  //   //     use: { ...devices['Desktop Chrome'], channel: 'chrome' },
  //   //   },
  //   //   {
  //   //     name: 'iPad',
  //   //     use: { ...devices['iPad Pro'] },
  //   //   },
  //   //   {
  //   //     name: 'Galaxy S9+',
  //   //     use: { ...devices['Galaxy S9+'] },
  //   //   },
  //   // ]

  //   const ALL_PROJECTS = Object.entries(devices).map(([name, use]) => ({ name, use }))

  //   return ALL_PROJECTS
  // })(),

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
})

function sample<T>(arr: T[], count: number | null): T[] {
  if (count === null) return arr
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
