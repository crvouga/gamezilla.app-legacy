import { Translator } from '~/@/l18n/generated'
import { ITestNode } from '~/@/test-client'

export type IFixtureApp = {
  frontend: ITestNode
  t: Translator
  [Symbol.asyncDispose]: () => Promise<void>
}
