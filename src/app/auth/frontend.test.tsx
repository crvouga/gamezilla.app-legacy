import { testRunner } from '~/@/test-runner'
import { FixtureAuth } from './@/test/fixture'

testRunner(({ test, describe, expect, env }) => {
  const Fixture = async () => {
    const f = await FixtureAuth(env)
    return f
  }

  describe('Auth', () => {
    test('login screen', async () => {
      await using f = await Fixture()
      const [screen] = await f.frontend.query(`[data-testid='auth/login-screen']`)
      expect(screen).toBeDefined()
    })

    test('continue with sms', async () => {
      await using f = await Fixture()
      const [button] = await f.frontend.query(`[data-testid='auth/continue-with-phone-button']`)
      await button!.do({ t: 'click' })
      const [screen] = await f.frontend.query(`[data-testid='auth/send-code-screen']`)
      expect(screen).toBeDefined()
    })
  })
})
