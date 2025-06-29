import { expect, test, TestRunnerEnv, describe } from '~/@/test-runner'
import { FixtureAuth } from './@/test/fixture'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAuth(e)
  return f
}

describe('login', () => {
  test('login screen', async (e) => {
    await using f = await Fixture(e)
    const [screen] = await f.frontend.query(`[data-testid='auth/login-screen']`)
    expect(screen).toBeDefined()
  })

  test('continue with sms', async (e) => {
    await using f = await Fixture(e)
    const [button] = await f.frontend.query(`[data-testid='auth/continue-with-phone-button']`)
    await button!.do({ t: 'click' })
    const [screen] = await f.frontend.query(`[data-testid='auth/send-code-screen']`)
    expect(screen).toBeDefined()
  })
})
