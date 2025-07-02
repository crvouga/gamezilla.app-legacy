import { IAudioPlayer } from '../audio-player'
import { TimeSpan } from '../time/time-span'
import type { ITestClientBase, ITestNode, TestAction } from './interface'

export type BaseConfig = {
  maxWait: TimeSpan
  poll: TimeSpan
  audioPlayer: IAudioPlayer
}

export type Config = {
  t: 'window'
} & BaseConfig

export const TestClient = (config: Config): ITestClientBase => {
  return {
    async audio() {
      return config.audioPlayer.played()
    },
    async query(selector: string, queryConfig) {
      const poll = async () => {
        const found = Array.from(document.querySelectorAll(selector))
        const testNodes = found.map((node): ITestNode => {
          return {
            async text() {
              return node.textContent ?? null
            },
            async attr(name: string) {
              return node.getAttribute(name) ?? null
            },
            async do(action: TestAction) {
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
