import { IFixtureApp } from '~/app/@/test/types'
import { randomPhoneNumber } from './random-phone-number'

export const doSendCode = async (f: IFixtureApp, config?: { phoneNumber?: string }) => {
  await f.frontend.find(`[data-testid='auth/send-code-screen']`)
  const [input] = await f.frontend.find(`input[type='tel']`)
  await input!.do({
    t: 'input',
    value: config?.phoneNumber ?? String(randomPhoneNumber()),
  })
  const [button] = await f.frontend.find(`button[type='submit']`)
  await button!.do({ t: 'click' })
}
