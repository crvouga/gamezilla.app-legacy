import { ITestNode } from '~/@/test-client'
import { expect } from '~/@/test-runner'

export const doExpectAlert = async (node: ITestNode, variant: 'success' | 'info' | 'error' | 'warning') => {
  const [alert] = await node.find(`[role='alert'][data-${variant}='true']`)
  expect(alert).toBeTruthy()
  return alert
}
