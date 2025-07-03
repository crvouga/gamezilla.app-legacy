import { difference } from '~/@/array/difference'
import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { FixtureAuthE2E } from '../@/test/e2e'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAuthE2E(e)
  const continueAsGuest = async () => {
    const [button] = await f.frontend.find(`[data-testid='auth/continue-as-guest-button']`)
    await button!.do({ t: 'click' })
  }
  return { ...f, continueAsGuest }
}

describe('login as guest', () => {
  test('login as guest screen', async (e) => {
    await using f = await Fixture(e)
    await f.continueAsGuest()
    const [screen] = await f.frontend.find(`[data-testid='spaces/space-list-screen']`)
    expect(screen).toBeTruthy()
  })

  test('should show alert on login as guest', async (e) => {
    await using f = await Fixture(e)
    await f.continueAsGuest()
    const [alert] = await f.frontend.find(`[role='alert'][data-info='true']`)
    expect(alert).toBeTruthy()
  })

  test('sound', async (e) => {
    if (e.e2e) return
    await using f = await Fixture(e)
    const before = await f.frontend.audio()
    await f.continueAsGuest()
    await eventually(async () => {
      const after = await f.frontend.audio()
      const played = difference(after, before, (x) => x.id)
      expect(played.map((x) => x.tag)).toEqual(['interaction.tap', 'feedback.positive'])
    })
  })
})
