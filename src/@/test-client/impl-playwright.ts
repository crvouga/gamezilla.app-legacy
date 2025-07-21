import { Locator, type Page } from '@playwright/test'
import type { PlayedAudioRecord } from '../audio-player'
import { TimeSpan } from '../time/time-span'
import { findByRole, findByTestId, type ITestNode, type TestAction } from './interface'

export type BaseConfig = {
  maxWait: TimeSpan
  poll: TimeSpan
}

export type ImplPlaywright = BaseConfig & {
  t: 'playwright'
  getPage: () => Page
}

const init = (config: ImplPlaywright): ITestNode => {
  return {
    async audio(): Promise<PlayedAudioRecord[]> {
      return []
    },
    async find(selector: string, queryConfig) {
      return find(selector, {
        maxWait: queryConfig?.maxWait ?? config.maxWait,
        poll: queryConfig?.poll ?? config.poll,
        onPoll: queryConfig?.onPoll ?? (() => {}),
        onDone: queryConfig?.onDone ?? (() => {}),
        getPage: config.getPage,
      })
    },
    async findByTestId(testId) {
      return findByTestId(this, testId)
    },
    async findByRole(role, label) {
      return findByRole(this, role, label)
    },
    async text() {
      return null
    },
    async attr(_name) {
      return null
    },
    async inputValue() {
      return null
    },
    async do(_action) {
      return
    },
    async isVisible() {
      return true
    },
  }
}

const find = async (
  selector: string,
  config: {
    maxWait: TimeSpan
    poll: TimeSpan
    onPoll: () => void
    onDone: () => void
    getPage: () => Page
  },
) => {
  const poll = async () => {
    const page = config.getPage()
    const locator = page.locator(selector)
    const elements = await locator.all()

    return elements.map(locatorToTestNode)
  }

  const maxWait = config.maxWait
  const pollInterval = config.poll

  const pollIntervalMs = TimeSpan.toMilliseconds(pollInterval)
  const maxWaitMs = TimeSpan.toMilliseconds(maxWait)
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

const locatorToTestNode = (locator: Locator): ITestNode => {
  return {
    async find(selector, queryConfig) {
      return find(selector, {
        maxWait: queryConfig?.maxWait ?? TimeSpan.milliseconds(1000),
        poll: queryConfig?.poll ?? TimeSpan.milliseconds(10),
        onPoll: queryConfig?.onPoll ?? (() => {}),
        onDone: queryConfig?.onDone ?? (() => {}),
        getPage: () => locator.page(),
      })
    },
    async findByTestId(testId) {
      return findByTestId(locatorToTestNode(locator), testId)
    },
    async findByRole(role, label) {
      return findByRole(locatorToTestNode(locator), role, label)
    },
    async text() {
      const text = await locator.textContent()
      return text
    },
    async audio() {
      return []
    },
    async inputValue() {
      const value = await locator.inputValue()
      return value
    },
    async isVisible() {
      const element = await locator.elementHandle()

      if (!element) {
        return false
      }

      const isVisible = await element.evaluate((el) => {
        const isElementVisible = (node: Element) => {
          if (!node) return false

          const ariaHidden = node.getAttribute('aria-hidden')
          if (ariaHidden === 'true') return false

          const computedStyle = window.getComputedStyle(node)
          if (computedStyle.display === 'none') return false
          if (computedStyle.visibility === 'hidden') return false
          if (computedStyle.visibility === 'collapse') return false
          if (computedStyle.opacity === '0') return false

          let parent = node.parentElement
          while (parent) {
            const parentStyle = window.getComputedStyle(parent)
            if (parentStyle.display === 'none') return false
            if (parentStyle.visibility === 'hidden') return false
            if (parentStyle.visibility === 'collapse') return false
            if (parent.getAttribute('aria-hidden') === 'true') return false

            parent = parent.parentElement
          }
          return true
        }

        return isElementVisible(el)
      })

      return isVisible
    },
    async attr(name: string) {
      const attr = await locator.getAttribute(name)
      return attr
    },
    async do(action: TestAction) {
      switch (action.t) {
        case 'click':
          await locator.click()
          break
        case 'keydown':
          await locator.press(action.key)
          break
        case 'input':
        case 'change':
          await locator.fill(action.value)
          break
        case 'submit':
          await locator.evaluate((el) => (el as HTMLFormElement).submit())
          break
      }
    },
  }
}

export const ImplPlaywright = {
  init,
}
