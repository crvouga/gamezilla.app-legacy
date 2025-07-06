import { expect, test, TestRunnerEnv, describe } from '~/@/test-runner'
import { FixtureAuthE2E } from './@/test/e2e'
import { AuthFrontend } from './frontend'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAuthE2E(e)
  return f
}

describe('login', () => {
  test('login screen', async (e) => {
    await using f = await Fixture(e)
    const [screen] = await f.frontend.find(`[data-testid='auth/login-screen']`)
    expect(screen).toBeTruthy()
  })

  test('continue with sms', async (e) => {
    await using f = await Fixture(e)
    const button = await f.frontend.findByTestId(AuthFrontend.TEST_ID.CONTINUE_WITH_PHONE_BUTTON)
    await button!.do({ t: 'click' })
    const screen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.SEND_CODE_SCREEN)
    expect(screen).toBeTruthy()
  })
})
