import type { VDom } from '../vdom'
import type { AriaRole } from '../aria-role'

export type TestNode = {
  click: () => Promise<void>
  keydown: (key: string) => Promise<void>
  query: (cssSelector: string) => TestNode[]
  getByRole: (ariaRole: AriaRole, ariaName?: string) => TestNode[]
  getByTestId: (testId: string | number) => TestNode[]
  getAttribute: (attribute: string) => string | null
  disabled: boolean
  textContent: string | null
}

export type ITestRender = (vdom: VDom) => TestNode
