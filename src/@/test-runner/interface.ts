import type { Page, expect as pwExpect, test as pwTest } from '@playwright/test'
import type { describe as vitestDescribe, expect as vitestExpect, test as vitestTest } from 'vitest'

type VitestExpect = typeof vitestExpect
type PWExpect = typeof pwExpect

type VitestDescribe = typeof vitestDescribe
type PWDescribe = typeof pwTest.describe

type VitestTest = typeof vitestTest
type PWTest = typeof pwTest

export type SharedExpect = VitestExpect & PWExpect
export type SharedDescribe = VitestDescribe & PWDescribe
export type SharedTest = VitestTest & PWTest

export type TestRunnerEnv =
  | {
      t: 'playwright'
      getPage: () => Promise<Page>
    }
  | {
      t: 'vitest'
    }

export type ITestRunner = (
  defineTests: (config: {
    expect: SharedExpect
    test: SharedTest
    describe: SharedDescribe
    env: TestRunnerEnv
  }) => void,
) => void
