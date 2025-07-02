import * as ImplHappyDom from './impl-happydom'
import * as ImplJsdom from './impl-jsdom'
import * as ImplPlaywright from './impl-playwright'
import * as ImplWindow from './impl-window'
import { fromBase, ITestClient, ITestClientBase } from './interface'

export type Config = ImplHappyDom.Config | ImplJsdom.Config | ImplPlaywright.Config | ImplWindow.Config

export const TestClientBase = async (config: Config): Promise<ITestClientBase> => {
  switch (config.t) {
    case 'happydom': {
      return ImplHappyDom.TestClient(config)
    }
    case 'jsdom': {
      return ImplJsdom.TestClient(config)
    }
    case 'playwright': {
      return ImplPlaywright.TestClient(config)
    }
    case 'window': {
      return ImplWindow.TestClient(config)
    }
  }
}

export const TestClient = async (config: Config): Promise<ITestClient> => {
  return fromBase(await TestClientBase(config))
}
