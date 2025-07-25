import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { TEST_ID_LOGIN_SCREEN } from '../../frontend'
import { TEST_ID_SEND_CODE_SCREEN } from '../frontend'

export const doOpenSendCodeScreen = async (f: IFixtureApp) => {
  const loginScreen = await f.frontend.findByTestId(TEST_ID_LOGIN_SCREEN)
  expect(loginScreen).toBeTruthy()
  //
  const button = await f.frontend.findByRole('button', 'Continue with phone')
  expect(button).toBeTruthy()
  await button!.do({ t: 'click' })
  //
  const screen = await f.frontend.findByTestId(TEST_ID_SEND_CODE_SCREEN)
  expect(screen).toBeTruthy()
}
