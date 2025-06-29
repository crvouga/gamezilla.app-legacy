import { expect, test } from '@playwright/test'
import { chromium, Page } from 'playwright'
import { ITestRunner } from './interface'

let page: Page | null = null

const getPage = async (): Promise<Page> => {
  if (page) return page
  const browser = await chromium.launch()
  const context = await browser.newContext()
  page = await context.newPage()
  return page
}

export const playwrightTestRunner: ITestRunner = async (defineTests) => {
  defineTests({
    // @ts-ignore
    expect: expect,

    test(name, fn): void {
      test(name, async (testInput) => {
        page = testInput.page
        await fn()
      })
    },
    describe(_name, fn): void {
      // test.describe(name, () => {
      fn()
      // })
    },
    env: {
      t: 'playwright',
      getPage,
    },
  })
}
