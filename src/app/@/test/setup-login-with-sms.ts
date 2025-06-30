import { IFixtureApp } from './types'

const randomPhoneNumber = (): number => {
  const base = 480_209_0000
  const random4 = Math.floor(Math.random() * 10000)
  return base + random4
}

export const setupLoginWithSms = async (f: IFixtureApp) => {
  //
  await f.frontend.query(`[data-testid='auth/login-screen']`)
  const [continueWithPhoneButton] = await f.frontend.query(`[data-testid='auth/continue-with-phone-button']`)
  await continueWithPhoneButton!.do({ t: 'click' })
  //
  await f.frontend.query(`[data-testid='auth/send-code-screen']`)
  const [sendCodeInput] = await f.frontend.query(`input[type='tel']`)
  await sendCodeInput!.do({ t: 'input', value: String(randomPhoneNumber()) })
  const [sendCodeButton] = await f.frontend.query(`button[type='submit']`)
  await sendCodeButton!.do({ t: 'click' })
  //
  await f.frontend.query(`[data-testid='auth/verify-code-screen']`)
  const [verifyCodeInput] = await f.frontend.query(`input[type='tel']`)
  await verifyCodeInput!.do({ t: 'input', value: '123' })
  const [verifyCodeButton] = await f.frontend.query(`button[type='submit']`)
  await verifyCodeButton!.do({ t: 'click' })
  //
  await f.frontend.query(`[data-testid='spaces/space-list-screen']`)
}
