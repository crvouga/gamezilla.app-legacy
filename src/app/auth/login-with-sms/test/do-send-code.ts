import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { TEST_ID_SEND_CODE_SCREEN } from '../frontend'
import { randomPhoneNumber } from './random-phone-number'

export const doSendCode = async (f: IFixtureApp, config?: { phoneNumber?: string }) => {
  const screen = await f.frontend.findByTestId(TEST_ID_SEND_CODE_SCREEN)
  expect(screen).toBeTruthy()
  const input = await f.frontend.findByRole('textbox', 'Phone number')
  expect(input).toBeTruthy()
  await input!.do({
    t: 'input',
    value: config?.phoneNumber ?? String(randomPhoneNumber()),
  })
  const button = await f.frontend.findByRole('button', 'Send code')
  expect(button).toBeTruthy()
  await button!.do({ t: 'click' })
}
