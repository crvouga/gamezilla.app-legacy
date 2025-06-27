import { JSDOM } from 'jsdom'
import * as ImplWindow from './impl-window'
import type { ITestClient } from './interface'

export type Config = {
  t: 'jsdom'
}

export const TestClient = (_config: Config): ITestClient => {
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
  const testClient = ImplWindow.TestClient({ t: 'window' })
  return testClient
}
