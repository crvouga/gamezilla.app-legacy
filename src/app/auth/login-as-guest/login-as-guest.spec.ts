import { difference } from '~/@/array/difference'
import { describe, expect, test } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { FixtureAuthE2E } from '../@/test/e2e'
import { AuthFrontend } from '../frontend'

const Fixture = FixtureAuthE2E

describe('login as guest', () => {
  test('login as guest screen', async (e) => {
    await using f = await Fixture(e)
    await doContinueAsGuest(f)
    const screen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.LOGIN_SCREEN)
    expect(screen).toBeTruthy()
  })

  test('should show alert on login as guest', async (e) => {
    await using f = await Fixture(e)
    await doContinueAsGuest(f)
    const [alert] = await f.frontend.find(`[role='alert'][data-info='true']`)
    expect(alert).toBeTruthy()
  })

  test('sound', async (e) => {
    if (e.e2e) return
    await using f = await Fixture(e)
    const before = await f.frontend.audio()
    await doContinueAsGuest(f)
    await eventually(async () => {
      const after = await f.frontend.audio()
      const played = difference(after, before, (x) => x.id)
      expect(played.map((x) => x.tag)).toEqual(['interaction.tap', 'feedback.positive'])
    })
  })
})

const doContinueAsGuest = async (f: IFixtureApp) => {
  const button = await f.frontend.findByTestId(AuthFrontend.TEST_ID.CONTINUE_AS_GUEST_BUTTON)
  expect(button).toBeTruthy()
  await button!.do({ t: 'click' })
}
