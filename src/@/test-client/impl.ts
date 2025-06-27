import * as ImplHappyDom from './impl-happydom'
import * as ImplJsdom from './impl-jsdom'
import * as ImplPlaywright from './impl-playwright'
import { ITestClient } from './interface'

export type Config = ImplHappyDom.Config | ImplJsdom.Config | ImplPlaywright.Config

export const TestClient = async (config: Config): Promise<ITestClient> => {
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
  }
}
