import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { TEST_ID_VERIFY_CODE_SCREEN } from '../frontend'

export const doVerifyCode = async (f: IFixtureApp, config?: { code?: string }) => {
  const screen = await f.frontend.findByTestId(TEST_ID_VERIFY_CODE_SCREEN)
  expect(screen).toBeTruthy()
  const input = await screen!.findByRole('textbox', 'Code')
  expect(input).toBeTruthy()
  await input!.do({ t: 'input', value: config?.code ?? '123' })
  const button = await screen!.findByRole('button', 'Verify code')
  expect(button).toBeTruthy()
  await button!.do({ t: 'click' })
}
