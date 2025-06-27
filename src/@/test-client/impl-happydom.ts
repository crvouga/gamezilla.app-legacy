import { GlobalRegistrator } from '@happy-dom/global-registrator'
import * as ImplWindow from './impl-window'
import type { ITestClient } from './interface'

export type Config = {
  t: 'happydom'
}

GlobalRegistrator.register()
export const TestClient = (_config: Config): ITestClient => {
  const testClient = ImplWindow.TestClient({ t: 'window' })
  return testClient
}
