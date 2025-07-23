import { ITestNode } from '~/@/test-client'
import { expect } from '~/@/test-runner'

export const doSubmitForm = async (findable: ITestNode) => {
  const submitButton = await findable.findByRole('submit')
  expect(submitButton).toBeTruthy()
  await submitButton!.do({ t: 'click' })
}
