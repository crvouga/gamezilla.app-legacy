import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { FixtureAuth } from '../@/test/fixture'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAuth(e)
  const continueAsGuest = async () => {
    const [button] = await f.frontend.query(`[data-testid='auth/continue-as-guest-button']`)
    await button!.do({ t: 'click' })
  }
  return { ...f, continueAsGuest }
}

describe('login as guest', () => {
  test('login as guest screen', async (e) => {
    await using f = await Fixture(e)
    await f.continueAsGuest()
    const [screen] = await f.frontend.query(`[data-testid='spaces/space-list-screen']`)
    expect(screen).toBeDefined()
  })

  test('should show alert on login as guest', async (e) => {
    await using f = await Fixture(e)
    await f.continueAsGuest()
    const [alert] = await f.frontend.query(`[role='alert'][data-info='true']`)
    expect(alert).toBeDefined()
  })
})
