import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/types'

export const doOpenSendCodeScreen = async (f: IFixtureApp) => {
  const [button] = await f.frontend.find(`[data-testid='auth/continue-with-phone-button']`)
  await button!.do({ t: 'click' })
  const [screen] = await f.frontend.find(`[data-testid='auth/send-code-screen']`)
  expect(screen).toBeTruthy()
}
