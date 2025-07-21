import { ITestNode } from '~/@/test-client'

export type IFixtureApp = {
  frontend: ITestNode
  [Symbol.asyncDispose]: () => Promise<void>
}
