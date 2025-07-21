import { expect } from '~/@/test-runner'
import { TEST_ID_CONTINUE_WITH_PHONE_BUTTON, TEST_ID_LOGIN_SCREEN } from '~/app/auth/frontend'
import { TEST_ID_SEND_CODE_SCREEN, TEST_ID_VERIFY_CODE_SCREEN } from '~/app/auth/login-with-sms/frontend'
import { TEST_ID_SPACE_LIST_SCREEN } from '~/app/spaces/list-spaces/frontend'
import { IFixtureApp } from '../app-fixture/interface'
import { doDismissAlert } from './do-dismiss-alert'

const randomPhoneNumber = (): number => {
  const base = 480_209_0000
  const random4 = Math.floor(Math.random() * 10000)
  return base + random4
}

export const doLoginWithSms = async (f: IFixtureApp) => {
  await doContinueWithPhone(f)
  await doSendCode(f)
  await doVerifyCode(f)
  const spaceListScreen = await f.frontend.findByTestId(TEST_ID_SPACE_LIST_SCREEN)
  expect(spaceListScreen).toBeTruthy()
}

const doContinueWithPhone = async (f: IFixtureApp) => {
  const loginScreen = await f.frontend.findByTestId(TEST_ID_LOGIN_SCREEN)
  expect(loginScreen).toBeTruthy()
  const button = await f.frontend.findByTestId(TEST_ID_CONTINUE_WITH_PHONE_BUTTON)
  expect(button).toBeTruthy()
  await button!.do({ t: 'click' })
}

const doSendCode = async (f: IFixtureApp) => {
  const sendCodeScreen = await f.frontend.findByTestId(TEST_ID_SEND_CODE_SCREEN)
  expect(sendCodeScreen).toBeTruthy()
  const [sendCodeInput] = await f.frontend.find(`input[type='tel']`)
  expect(sendCodeInput).toBeTruthy()
  await sendCodeInput!.do({ t: 'input', value: String(randomPhoneNumber()) })
  const [sendCodeButton] = await f.frontend.find(`button[type='submit']`)
  expect(sendCodeButton).toBeTruthy()
  await sendCodeButton!.do({ t: 'click' })
  await doDismissAlert(f.frontend, 'info')
}

const doVerifyCode = async (f: IFixtureApp) => {
  const verifyCodeScreen = await f.frontend.findByTestId(TEST_ID_VERIFY_CODE_SCREEN)
  expect(verifyCodeScreen).toBeTruthy()
  const [verifyCodeInput] = await f.frontend.find(`input[type='tel']`)
  expect(verifyCodeInput).toBeTruthy()
  await verifyCodeInput!.do({ t: 'input', value: '123' })
  const [verifyCodeButton] = await f.frontend.find(`button[type='submit']`)
  expect(verifyCodeButton).toBeTruthy()
  await verifyCodeButton!.do({ t: 'click' })
  await doDismissAlert(f.frontend, 'info')
}
