import { TestRunnerEnv } from './test-runner-env'

type MaybePromise<T> = T | Promise<T>

export type Expected<T> = {
  toBeTruthy: () => void
  toBeFalsy: () => void
  toEqual: (value: T) => void
  not: {
    toBeTruthy: () => void
    toBeFalsy: () => void
    toEqual: (value: T) => void
  }
}
export type Expect = <T>(value: T) => Expected<T>

type DescribeFn = (name: string, fn: (...args: any[]) => MaybePromise<void>) => MaybePromise<void>
export type Describe = DescribeFn & { skip: DescribeFn }

type TestFn = (name: string, fn: (env: TestRunnerEnv) => MaybePromise<void>) => MaybePromise<void>
export type Test = TestFn & { skip: TestFn }

export type ITestRunner = (
  defineTests: (config: { expect: Expect; test: Test; describe: Describe; env: TestRunnerEnv }) => void,
) => void
