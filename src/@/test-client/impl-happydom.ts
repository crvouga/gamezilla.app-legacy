import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { ImplWindow, ImplWindowBase } from './impl-window'
import type { ITestNode } from './interface'

export type ImplHappyDom = ImplWindowBase & {
  t: 'happydom'
}

GlobalRegistrator.register()

const init = (config: ImplHappyDom): ITestNode => {
  return ImplWindow.init({ ...config, t: 'window' })
}

export const ImplHappyDom = {
  init,
}
