import { Expect, Test } from './interface'

export let expect: Expect
export let test: Test

type TestRunnerImpl = 'playwright' | 'vitest'

const IS_PLAYWRIGHT = process.env.PLAYWRIGHT_TEST === 'true'

const TEST_RUNNER_IMPL: TestRunnerImpl = IS_PLAYWRIGHT ? 'playwright' : 'vitest'

switch (TEST_RUNNER_IMPL) {
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
      }
    }
    test = (name, fn) => {
      playwright.test(name, async ({ page }) => {
        await page.goto('http://localhost:3001')
        await fn({
          t: 'playwright',
          getPage: () => page,
        })
      })
    }
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
      }
    }
    test = (name, fn) => {
      vitest.test(name, async () => {
        await fn({
          t: 'vitest',
        })
      })
    }
    break
  }
}
