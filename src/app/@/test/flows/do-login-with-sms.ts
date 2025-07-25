import { expect } from '~/@/test-runner'
import { TEST_ID_LOGIN_SCREEN } from '~/app/auth/frontend'
import { TEST_ID_SEND_CODE_SCREEN, TEST_ID_VERIFY_CODE_SCREEN } from '~/app/auth/login-with-sms/frontend'
import { randomPhoneNumber } from '~/app/auth/login-with-sms/test/random-phone-number'
import { TEST_ID_SPACE_LIST_SCREEN } from '~/app/spaces/list-spaces/frontend'
import { IFixtureApp } from '../app-fixture/interface'
import { doDismissAlert } from './do-dismiss-alert'

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
  const button = await f.frontend.findByRole('button', 'Continue with phone')
  expect(button).toBeTruthy()
  await button!.do({ t: 'click' })
}

const doSendCode = async (f: IFixtureApp) => {
  const sendCodeScreen = await f.frontend.findByTestId(TEST_ID_SEND_CODE_SCREEN)
  expect(sendCodeScreen).toBeTruthy()
  const phoneNumberInput = await f.frontend.findByRole('textbox', 'Phone number')
  expect(phoneNumberInput).toBeTruthy()
  await phoneNumberInput!.do({ t: 'input', value: String(randomPhoneNumber()) })
  const sendCodeButton = await f.frontend.findByRole('button', 'Send code')
  expect(sendCodeButton).toBeTruthy()
  await sendCodeButton!.do({ t: 'click' })
  await doDismissAlert(f.frontend, 'info')
}

const doVerifyCode = async (f: IFixtureApp) => {
  const verifyCodeScreen = await f.frontend.findByTestId(TEST_ID_VERIFY_CODE_SCREEN)
  expect(verifyCodeScreen).toBeTruthy()
  const codeInput = await f.frontend.findByRole('textbox', 'Code')
  expect(codeInput).toBeTruthy()
  await codeInput!.do({ t: 'input', value: '123' })
  const verifyCodeButton = await f.frontend.findByRole('button', 'Verify code')
  expect(verifyCodeButton).toBeTruthy()
  await verifyCodeButton!.do({ t: 'click' })
  await doDismissAlert(f.frontend, 'info')
}
