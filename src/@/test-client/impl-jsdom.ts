import { JSDOM } from 'jsdom'
import type { ITestClient, ITestNode, TestAction } from './interface'

export type Config = {
  t: 'jsdom'
}

export const TestClient = (_config: Config): ITestClient => {
  // Set up JSDOM environment
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable',
  })

  // Set up global environment safely
  Object.defineProperty(global, 'window', { value: dom.window, writable: true, configurable: true })
  Object.defineProperty(global, 'document', { value: dom.window.document, writable: true, configurable: true })
  Object.defineProperty(global, 'navigator', { value: dom.window.navigator, writable: true, configurable: true })
  Object.defineProperty(global, 'HTMLElement', { value: dom.window.HTMLElement, writable: true, configurable: true })
  Object.defineProperty(global, 'Element', { value: dom.window.Element, writable: true, configurable: true })
  Object.defineProperty(global, 'Node', { value: dom.window.Node, writable: true, configurable: true })
  Object.defineProperty(global, 'Event', { value: dom.window.Event, writable: true, configurable: true })
  Object.defineProperty(global, 'MouseEvent', { value: dom.window.MouseEvent, writable: true, configurable: true })
  Object.defineProperty(global, 'KeyboardEvent', {
    value: dom.window.KeyboardEvent,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(global, 'InputEvent', { value: dom.window.InputEvent, writable: true, configurable: true })
  return {
    async query(_selector: string) {
      const found = Array.from(document.querySelectorAll(_selector))
      return found.map((node): ITestNode => {
        return {
          text: () => Promise.resolve(node.textContent ?? null),
          attr: (name: string) => Promise.resolve(node.getAttribute(name) ?? null),
          do: async (action: TestAction) => {
            switch (action.t) {
              case 'keydown': {
                const event = new KeyboardEvent('keydown', { key: action.key })
                node.dispatchEvent(event)
                break
              }
              case 'click': {
                const event = new MouseEvent('click', { bubbles: true })
                node.dispatchEvent(event)
                break
              }
              case 'input': {
                // For input events, we need to set the value and dispatch the event
                if (node instanceof HTMLInputElement) {
                  node.value = action.value
                }
                const event = new InputEvent('input', { data: action.value, bubbles: true })
                node.dispatchEvent(event)
                break
              }
              case 'change': {
                const event = new Event('change', { bubbles: true })
                node.dispatchEvent(event)
                break
              }
              case 'submit': {
                const event = new Event('submit', { bubbles: true })
                node.dispatchEvent(event)
                break
              }
            }
          },
        }
      })
    },
  }
}
