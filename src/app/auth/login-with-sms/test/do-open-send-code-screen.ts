import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/types'
import { AuthFrontend } from '../../frontend'

export const doOpenSendCodeScreen = async (f: IFixtureApp) => {
  const button = await f.frontend.findByTestId(AuthFrontend.TEST_ID.CONTINUE_WITH_PHONE_BUTTON)
  expect(button).toBeTruthy()
  await button!.do({ t: 'click' })
  //
  const screen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.SEND_CODE_SCREEN)
  expect(screen).toBeTruthy()
}
