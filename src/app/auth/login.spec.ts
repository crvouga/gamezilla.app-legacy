import { expect, test, TestRunnerEnv, describe } from '~/@/test-runner'
import { FixtureAuthE2E } from './@/test/e2e'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAuthE2E(e)
  return f
}

describe('login', () => {
  test('login screen', async (e) => {
    await using f = await Fixture(e)
    const [screen] = await f.frontend.query(`[data-testid='auth/login-screen']`)
    expect(screen).toBeTruthy()
  })

  test('continue with sms', async (e) => {
    await using f = await Fixture(e)
    const [button] = await f.frontend.query(`[data-testid='auth/continue-with-phone-button']`)
    await button!.do({ t: 'click' })
    const [screen] = await f.frontend.query(`[data-testid='auth/send-code-screen']`)
    expect(screen).toBeTruthy()
  })
})
