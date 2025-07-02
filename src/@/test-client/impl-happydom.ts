import { GlobalRegistrator } from '@happy-dom/global-registrator'
import * as ImplWindow from './impl-window'
import type { ITestClientBase } from './interface'

export type Config = ImplWindow.BaseConfig & {
  t: 'happydom'
}

GlobalRegistrator.register()
export const TestClient = (config: Config): ITestClientBase => {
  const testClient = ImplWindow.TestClient({ ...config, t: 'window' })
  return testClient
}
