import type { Page, expect as pwExpect } from '@playwright/test'
import type { expect as vitestExpect } from 'vitest'

type VitestExpect = typeof vitestExpect
type PWExpect = typeof pwExpect

export type Expect = VitestExpect & PWExpect
type MaybePromise<T> = T | Promise<T>
export type Describe = (name: string, fn: (...args: any[]) => MaybePromise<void>) => MaybePromise<void>
export type Test = (name: string, fn: (...args: any[]) => MaybePromise<void>) => MaybePromise<void>

export type TestRunnerEnv =
  | {
      t: 'playwright'
      getPage: () => Promise<Page>
    }
  | {
      t: 'vitest'
    }

export type ITestRunner = (
  defineTests: (config: { expect: Expect; test: Test; describe: Describe; env: TestRunnerEnv }) => void,
) => void
