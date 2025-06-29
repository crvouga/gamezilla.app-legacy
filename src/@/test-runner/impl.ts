import { Page } from '@playwright/test'
import { Expect, Test, TestRunnerEnv } from './interface'

export let expect: Expect
export let test: Test
export let env: TestRunnerEnv

type TestRunnerImpl = 'playwright' | 'vitest'

const IS_PLAYWRIGHT = process.env.PLAYWRIGHT_TEST === 'true'

const TEST_RUNNER_IMPL: TestRunnerImpl = IS_PLAYWRIGHT ? 'playwright' : 'vitest'

switch (TEST_RUNNER_IMPL) {
  case 'playwright': {
    let pageSingleton: Page
    env = {
      t: 'playwright',
      getPage() {
        return pageSingleton
      },
    }
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
        pageSingleton = page
        await pageSingleton.goto('http://localhost:3001')
        await fn()
      })
    }
    break
  }

  case 'vitest': {
    console.log('using vitest test runner')
    env = {
      t: 'vitest',
    }
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
    test = vitest.test
    break
  }
}
