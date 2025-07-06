import { IFixtureApp } from '~/app/@/test/types'
import { AuthFrontend } from '../../frontend'
import { randomPhoneNumber } from './random-phone-number'
import { expect } from '~/@/test-runner'

export const doSendCode = async (f: IFixtureApp, config?: { phoneNumber?: string }) => {
  const screen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.SEND_CODE_SCREEN)
  expect(screen).toBeTruthy()

  const [input] = await f.frontend.find(`input[type='tel']`)
  await input!.do({
    t: 'input',
    value: config?.phoneNumber ?? String(randomPhoneNumber()),
  })
  const [button] = await f.frontend.find(`button[type='submit']`)
  await button!.do({ t: 'click' })
}
