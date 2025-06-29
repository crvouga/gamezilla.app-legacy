import { ITestClient } from '~/@/test-client'

export type IFixtureApp = {
  frontend: ITestClient
  [Symbol.asyncDispose]: () => Promise<void>
}
