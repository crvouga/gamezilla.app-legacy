import { Describe, Expect, Test } from './interface'

export const initPlaywright = async (): Promise<{
  expect: Expect
  test: Test
  describe: Describe
}> => {
  const playwright = await import('@playwright/test')

  const expect: Expect = (value) => {
    return {
      toBeTruthy() {
        playwright.expect(value).toBeTruthy()
      },
      toBeFalsy() {
        playwright.expect(value).toBeFalsy()
      },
      toEqual(expected) {
        playwright.expect(value).toBe(expected)
      },
      not: {
        toBeTruthy() {
          playwright.expect(value).not.toBeTruthy()
        },
        toBeFalsy() {
          playwright.expect(value).not.toBeFalsy()
        },
        toEqual(expected) {
          playwright.expect(value).not.toBe(expected)
        },
      },
    }
  }
  const test: Test = (name, fn) => {
    playwright.test(name, async ({ page }) => {
      await page.goto('/')
      await fn({
        t: 'playwright',
        getPage: () => page,
        e2e: true,
        unit: false,
      })
    })
  }
  test.todo = (name, fn) => {
    playwright.test.skip(name, async ({ page }) => {
      await page.goto('/')
      await fn({
        t: 'playwright',
        getPage: () => page,
        e2e: true,
        unit: false,
      })
    })
  }

  const describe: Describe = (name, fn) => {
    playwright.test.describe(name, () => {
      fn()
    })
  }
  describe.todo = (name, fn) => {
    playwright.test.describe.skip(name, () => {
      fn()
    })
  }

  return { expect, test, describe }
}
