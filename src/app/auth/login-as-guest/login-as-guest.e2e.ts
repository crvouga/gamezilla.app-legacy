import { difference } from '~/@/array/difference'
import { describe, expect, test } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { FixtureAppE2E } from '~/app/@/test/app-fixture'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { doDismissAlert } from '~/app/@/test/flows/do-dismiss-alert'
import { TEST_ID_SPACE_LIST_SCREEN } from '~/app/spaces/list-spaces/frontend'
import { TEST_ID_LOGIN_SCREEN } from '../frontend'

const Fixture = FixtureAppE2E

describe('login as guest', () => {
  test('login as guest screen', async (e) => {
    await using f = await Fixture(e)
    await doContinueAsGuest(f)
    const screen = await f.frontend.findByTestId(TEST_ID_SPACE_LIST_SCREEN)
    expect(screen).toBeTruthy()
  })

  test('show alert on login as guest', async (e) => {
    await using f = await Fixture(e)
    await doContinueAsGuest(f)
    await doDismissAlert(f.frontend, 'info')
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
  const screen = await f.frontend.findByTestId(TEST_ID_LOGIN_SCREEN)
  expect(screen).toBeTruthy()
  //
  const button = await f.frontend.findByRole('button', 'Continue as guest')
  expect(button).toBeTruthy()
  await button!.do({ t: 'click' })
}
