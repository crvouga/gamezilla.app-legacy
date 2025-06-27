import { GlobalRegistrator } from '@happy-dom/global-registrator'
import type { ITestClient, ITestNode, TestAction } from './interface'

export type Config = {
  t: 'happydom'
}

GlobalRegistrator.register()
export const TestClient = (_config: Config): ITestClient => {
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
                node.dispatchEvent(new KeyboardEvent('keydown', { key: action.key }))
                break
              }
              case 'click': {
                node.dispatchEvent(new MouseEvent('click'))
                break
              }
              case 'input': {
                node.dispatchEvent(new InputEvent('input', { data: action.value }))
                break
              }
              case 'change': {
                node.dispatchEvent(new Event('change'))
                break
              }
              case 'submit': {
                node.dispatchEvent(new Event('submit'))
                break
              }
            }
          },
        }
      })
    },
  }
}
