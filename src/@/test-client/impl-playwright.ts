import { type Page } from '@playwright/test'
import type { ITestClient, ITestNode, TestAction } from './interface'

export type Config = {
  t: 'playwright'
  page: Page
}

export const TestClient = (config: Config): ITestClient => {
  return {
    async query(selector: string): Promise<ITestNode[]> {
      const elements = await config.page.$$(selector)
      return elements.map((element) => ({
        async text() {
          const text = await element.textContent()
          return text
        },
        async attr(name: string) {
          const attr = await element.getAttribute(name)
          return attr
        },
        async do(action: TestAction) {
          switch (action.t) {
            case 'click':
              await element.click()
              break
            case 'keydown':
              await element.press(action.key)
              break
            case 'input':
            case 'change':
              await element.fill(action.value)
              break
            case 'submit':
              await element.evaluate((el) => (el as HTMLFormElement).submit())
              break
          }
        },
      }))
    },
  }
}
