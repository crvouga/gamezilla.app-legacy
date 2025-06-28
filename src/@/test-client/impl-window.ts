import { TimeSpan } from '../time/time-span'
import type { ITestClient, ITestNode, PlayedAudioRecord, TestAction } from './interface'

export type BaseConfig = {
  maxWait: TimeSpan
  poll: TimeSpan
}

export type Config = {
  t: 'window'
} & BaseConfig

export const TestClient = (config: Config): ITestClient => {
  const playedAudioRecords: PlayedAudioRecord[] = []

  return {
    audio() {
      return playedAudioRecords
    },
    async query(selector: string, queryConfig) {
      const poll = async () => {
        const found = Array.from(document.querySelectorAll(selector))
        const testNodes = found.map((node): ITestNode => {
          return {
            text: () => Promise.resolve(node.textContent ?? null),
            attr: (name: string) => Promise.resolve(node.getAttribute(name) ?? null),
            do: async (action: TestAction) => {
              switch (action.t) {
                case 'keydown': {
                  node.dispatchEvent(new KeyboardEvent('keydown', { key: action.key, bubbles: true }))
                  break
                }
                case 'click': {
                  node.dispatchEvent(new MouseEvent('click', { bubbles: true }))
                  break
                }
                case 'input': {
                  node.dispatchEvent(new InputEvent('input', { data: action.value, bubbles: true }))
                  break
                }
                case 'change': {
                  node.dispatchEvent(new Event('change', { bubbles: true }))
                  break
                }
                case 'submit': {
                  node.dispatchEvent(new Event('submit', { bubbles: true }))
                  break
                }
              }
            },
          }
        })
        return testNodes
      }

      const maxWait = queryConfig?.maxWait ?? config.maxWait
      const pollInterval = queryConfig?.poll ?? config.poll

      const pollIntervalMs = TimeSpan.toMilliseconds(pollInterval)
      const maxWaitMs = TimeSpan.toMilliseconds(maxWait)
      const startTimeMs = Date.now()

      while (Date.now() - startTimeMs < maxWaitMs) {
        const nodes = await poll()
        if (nodes.length > 0) {
          return nodes
        }
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
      }

      return []
    },
  }
}
