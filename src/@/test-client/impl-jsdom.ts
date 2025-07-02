import { JSDOM } from 'jsdom'
import * as ImplWindow from './impl-window'
import type { ITestClientBase } from './interface'

export type Config = ImplWindow.BaseConfig & {
  t: 'jsdom'
}

export const TestClient = (config: Config): ITestClientBase => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable',
  })

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

  // Mock the Web Locks API for tests (required by Comlink/PowerSync)
  if (!dom.window.navigator.locks) {
    Object.defineProperty(dom.window.navigator, 'locks', {
      value: {
        request: async (_name: string, callback: Function) => {
          return await callback()
        },
      },
      writable: true,
      configurable: true,
    })
  }

  const testClient = ImplWindow.TestClient({ ...config, t: 'window' })
  return testClient
}
