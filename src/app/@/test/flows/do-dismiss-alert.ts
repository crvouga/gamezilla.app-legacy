import { ITestNode } from '~/@/test-client'
import { expect } from '~/@/test-runner'

export const doDismissAlert = async (node: ITestNode, variant: 'success' | 'info' | 'error' | 'warning') => {
  const [alert] = await node.find(`[role='alert'][data-${variant}='true']`)
  expect(alert).toBeTruthy()
  const dismissButton = await alert!.findByRole('button', 'Dismiss')
  expect(dismissButton).toBeTruthy()
  await dismissButton!.do({ t: 'click' })
}
