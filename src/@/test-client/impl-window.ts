import { IAudioPlayer } from '../audio-player'
import { TimeSpan } from '../time/time-span'
import type { ITestClientBase, ITestNode, TestAction, TestClientQueryConfig } from './interface'
import { isElementVisible } from './is-element-visible'

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
    async find(selector: string, queryConfig?: TestClientQueryConfig) {
      const maxWait = queryConfig?.maxWait ?? config.maxWait
      const pollInterval = queryConfig?.poll ?? config.poll
      return find(document, selector, {
        maxWait,
        pollInterval,
        onPoll: queryConfig?.onPoll ?? (() => {}),
        onDone: queryConfig?.onDone ?? (() => {}),
      })
    },
  }
}

const find = async (
  root: Element | Document,
  selector: string,
  config: {
    maxWait: TimeSpan
    pollInterval: TimeSpan
    onPoll: () => void
    onDone: () => void
  },
): Promise<ITestNode[]> => {
  const poll = async () => {
    const found = Array.from(root.querySelectorAll(selector))
    const testNodes = found.map(elementToTestNode)
    return testNodes
  }

  const pollIntervalMs = TimeSpan.toMilliseconds(config.pollInterval)
  const maxWaitMs = TimeSpan.toMilliseconds(config.maxWait)
  const startTimeMs = Date.now()

  while (Date.now() - startTimeMs < maxWaitMs) {
    config.onPoll?.()
    const nodes = await poll()
    config.onPoll?.()
    if (nodes.length > 0) {
      return nodes
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
  }

  config.onDone?.()

  return []
}

export const elementToTestNode = (node: Element): ITestNode => {
  return {
    async text() {
      return node.textContent ?? null
    },
    async attr(name: string) {
      return node.getAttribute(name) ?? null
    },
    async isVisible() {
      return isElementVisible(node)
    },
    async find(selector: string, queryConfig?: TestClientQueryConfig) {
      return find(node, selector, {
        maxWait: queryConfig?.maxWait ?? TimeSpan.milliseconds(1000),
        pollInterval: queryConfig?.poll ?? TimeSpan.milliseconds(10),
        onPoll: queryConfig?.onPoll ?? (() => {}),
        onDone: queryConfig?.onDone ?? (() => {}),
      })
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
}
