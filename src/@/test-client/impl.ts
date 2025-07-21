import { ImplHappyDom } from './impl-happydom'
import { ImplJsdom } from './impl-jsdom'
import { ImplPlaywright } from './impl-playwright'
import { ImplWindow } from './impl-window'
import { ITestNode } from './interface'

export type TestClient = ImplHappyDom | ImplJsdom | ImplPlaywright | ImplWindow

const init = async (config: TestClient): Promise<ITestNode> => {
  switch (config.t) {
    case 'happydom': {
      return ImplHappyDom.init(config)
    }
    case 'jsdom': {
      return ImplJsdom.init(config)
    }
    case 'playwright': {
      return ImplPlaywright.init(config)
    }
    case 'window': {
      return ImplWindow.init(config)
    }
  }
}

export const TestClient = {
  init,
}
