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
    expect: expect as any,
    test: test as any,
    describe: test.describe as any,
    env: {
      t: 'playwright',
      getPage,
    },
  })
}
