import { expect } from '~/@/test-runner'
import { AuthFrontend } from '~/app/auth/frontend'
import { SpacesFrontend } from '~/app/spaces/frontend'
import { IFixtureApp } from '../types'

const randomPhoneNumber = (): number => {
  const base = 480_209_0000
  const random4 = Math.floor(Math.random() * 10000)
  return base + random4
}

export const doLoginWithSms = async (f: IFixtureApp) => {
  await doContinueWithPhone(f)
  await doSendCode(f)
  await doVerifyCode(f)
  const spaceListScreen = await f.frontend.findByTestId(SpacesFrontend.TEST_ID.SPACE_LIST_SCREEN)
  expect(spaceListScreen).toBeTruthy()
}

const doContinueWithPhone = async (f: IFixtureApp) => {
  const loginScreen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.LOGIN_SCREEN)
  expect(loginScreen).toBeTruthy()
  const button = await f.frontend.findByTestId(AuthFrontend.TEST_ID.CONTINUE_WITH_PHONE_BUTTON)
  expect(button).toBeTruthy()
  await button!.do({ t: 'click' })
}

const doSendCode = async (f: IFixtureApp) => {
  const sendCodeScreen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.SEND_CODE_SCREEN)
  expect(sendCodeScreen).toBeTruthy()
  const [sendCodeInput] = await f.frontend.find(`input[type='tel']`)
  expect(sendCodeInput).toBeTruthy()
  await sendCodeInput!.do({ t: 'input', value: String(randomPhoneNumber()) })
  const [sendCodeButton] = await f.frontend.find(`button[type='submit']`)
  expect(sendCodeButton).toBeTruthy()
  await sendCodeButton!.do({ t: 'click' })
}

const doVerifyCode = async (f: IFixtureApp) => {
  const verifyCodeScreen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.VERIFY_CODE_SCREEN)
  expect(verifyCodeScreen).toBeTruthy()
  const [verifyCodeInput] = await f.frontend.find(`input[type='tel']`)
  expect(verifyCodeInput).toBeTruthy()
  await verifyCodeInput!.do({ t: 'input', value: '123' })
  const [verifyCodeButton] = await f.frontend.find(`button[type='submit']`)
  expect(verifyCodeButton).toBeTruthy()
  await verifyCodeButton!.do({ t: 'click' })
}
