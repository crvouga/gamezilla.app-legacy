import type { Page, expect as pwExpect, test as pwTest } from '@playwright/test'
import type { describe as bunDescribe, expect as bunExpect, test as bunTest } from 'bun:test'

type BunExpect = typeof bunExpect
type PWExpect = typeof pwExpect

type BunDescribe = typeof bunDescribe
type PWDescribe = typeof pwTest.describe

type BunTest = typeof bunTest
type PWTest = typeof pwTest

export type SharedExpect = BunExpect & PWExpect
export type SharedDescribe = BunDescribe & PWDescribe
export type SharedTest = BunTest & PWTest

export type TestRunnerEnv =
  | {
      t: 'playwright'
      page: Page
    }
  | {
      t: 'bun'
    }

export type ITestRunner = (
  defineTests: (config: {
    expect: SharedExpect
    test: SharedTest
    describe: SharedDescribe
    env: TestRunnerEnv
  }) => void,
) => void
