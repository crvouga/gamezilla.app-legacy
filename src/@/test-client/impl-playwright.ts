import { type Page } from '@playwright/test'
import type { PlayedAudioRecord } from '../audio-player'
import { TimeSpan } from '../time/time-span'
import type { ITestClientBase, ITestNode, TestAction } from './interface'

export type BaseConfig = {
  maxWait: TimeSpan
  poll: TimeSpan
}

export type Config = {
  t: 'playwright'
  getPage: () => Page
} & BaseConfig

export const TestClient = (config: Config): ITestClientBase => {
  return {
    async audio(): Promise<PlayedAudioRecord[]> {
      return []
    },
    async find(selector: string, queryConfig) {
      const poll = async () => {
        const page = config.getPage()
        const locator = page.locator(selector)
        const elements = await locator.all()

        return elements.map(
          (element): ITestNode => ({
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
          }),
        )
      }

      const maxWait = queryConfig?.maxWait ?? config.maxWait
      const pollInterval = queryConfig?.poll ?? config.poll

      const pollIntervalMs = TimeSpan.toMilliseconds(pollInterval)
      const maxWaitMs = TimeSpan.toMilliseconds(maxWait)
      const startTimeMs = Date.now()

      while (Date.now() - startTimeMs < maxWaitMs) {
        queryConfig?.onPoll?.()
        const nodes = await poll()
        queryConfig?.onPoll?.()
        if (nodes.length > 0) {
          return nodes
        }
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
      }

      queryConfig?.onDone?.()
      return []
    },
  }
}
