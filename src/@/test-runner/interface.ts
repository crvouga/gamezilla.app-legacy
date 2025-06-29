import type { Page } from '@playwright/test'

export type Expected<T> = {
  toBeDefined: () => void
  toBeUndefined: () => void
  toEqual: (value: T) => void
}
export type Expect = <T>(value: T) => Expected<T>
type MaybePromise<T> = T | Promise<T>
export type Describe = (name: string, fn: (...args: any[]) => MaybePromise<void>) => MaybePromise<void>
export type Test = (name: string, fn: (env: TestRunnerEnv) => MaybePromise<void>) => MaybePromise<void>

export type TestRunnerEnv =
  | {
      t: 'playwright'
      getPage: () => Page
    }
  | {
      t: 'vitest'
    }

export type ITestRunner = (
  defineTests: (config: { expect: Expect; test: Test; describe: Describe; env: TestRunnerEnv }) => void,
) => void
