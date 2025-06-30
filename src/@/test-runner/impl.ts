import { Describe, Expect, Test, TestRunnerEnv } from './interface'

type MaybePromise<T> = T | Promise<T>

export let expect: Expect
export let test: Test
export let describe: Describe

export type TestRunnerImpl = 'playwright' | 'vitest'

const TEST_RUNNER_IMPL = (): TestRunnerImpl => {
  if (process.env.IS_PLAYWRIGHT_TEST === 'true') return 'playwright'
  if (process.env.IS_VITEST_TEST === 'true') return 'vitest'
  return 'vitest'
}

switch (TEST_RUNNER_IMPL()) {
  case 'playwright': {
    const playwright = await import('@playwright/test')
    expect = (value) => {
      return {
        toBeDefined() {
          playwright.expect(value).toBeDefined()
        },
        toBeUndefined() {
          playwright.expect(value).toBeUndefined()
        },
        toEqual(expected) {
          playwright.expect(value).toBe(expected)
        },
        not: {
          toBeDefined() {
            playwright.expect(value).not.toBeDefined()
          },
          toBeUndefined() {
            playwright.expect(value).not.toBeUndefined()
          },
          toEqual(expected) {
            playwright.expect(value).not.toBe(expected)
          },
        },
      }
    }
    const testFn = (name: string, fn: (env: TestRunnerEnv) => MaybePromise<void>) => {
      playwright.test(name, async ({ page }) => {
        page.goto('/')
        await fn({ t: 'playwright', getPage: () => page })
      })
    }
    testFn.todo = (name: string, fn: (env: TestRunnerEnv) => MaybePromise<void>) => {
      playwright.test.skip(name, async ({ page }) => {
        page.goto('/')
        await fn({ t: 'playwright', getPage: () => page })
      })
    }
    test = testFn

    const describeFn = (name: string, fn: (...args: any[]) => MaybePromise<void>) => {
      playwright.test.describe(name, () => {
        fn()
      })
    }
    describeFn.todo = (name: string, fn: (...args: any[]) => MaybePromise<void>) => {
      playwright.test.describe.skip(name, () => {
        fn()
      })
    }
    describe = describeFn

    break
  }

  case 'vitest': {
    const vitest = await import('vitest')
    expect = (value) => {
      return {
        toBeDefined() {
          vitest.expect(value).toBeDefined()
        },
        toBeUndefined() {
          vitest.expect(value).toBeUndefined()
        },
        toEqual(expected) {
          vitest.expect(value).toEqual(expected)
        },
        not: {
          toBeDefined() {
            vitest.expect(value).not.toBeDefined()
          },
          toBeUndefined() {
            vitest.expect(value).not.toBeUndefined()
          },
          toEqual(expected) {
            vitest.expect(value).not.toEqual(expected)
          },
        },
      }
    }
    const testFn = (name: string, fn: (env: TestRunnerEnv) => MaybePromise<void>) => {
      vitest.test(name, async () => {
        await fn({
          t: 'vitest',
        })
      })
    }
    testFn.todo = (name: string, fn: (env: TestRunnerEnv) => MaybePromise<void>) => {
      vitest.test.skip(name, async () => {
        await fn({
          t: 'vitest',
        })
      })
    }
    test = testFn

    const describeFn = (name: string, fn: (...args: any[]) => MaybePromise<void>) => {
      vitest.describe(name, () => {
        fn()
      })
    }
    describeFn.todo = (name: string, fn: (...args: any[]) => MaybePromise<void>) => {
      vitest.describe.skip(name, () => {
        fn()
      })
    }
    describe = describeFn
    break
  }

  default: {
    throw new Error(`Unsupported test runner: ${TEST_RUNNER_IMPL}`)
  }
}
