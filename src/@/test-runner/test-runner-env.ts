import type { Page } from '@playwright/test'

export type TestRunnerEnvBase = {
  e2e: boolean
  unit: boolean
}

export type TestRunnerEnvVariant =
  | {
      t: 'playwright'
      getPage: () => Page
    }
  | {
      t: 'vitest'
    }

export type TestRunnerEnv = TestRunnerEnvBase & TestRunnerEnvVariant
