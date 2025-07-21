import { describe, expect, test } from '~/@/test-runner'
import { FixtureAppE2E } from '~/app/@/test/app-fixture/impl'
import { doClickBackButton } from '../@/test/setup/do-click-back-button'
import { AuthFrontend } from '../auth/frontend'
import { doOpenRendererScreen } from './@/test/do-open-renderer-screen'
import { doOpenSettingsScreen } from './@/test/do-open-settings-screen'

const Fixture = FixtureAppE2E

describe('settings', () => {
  test('open settings screen', async (e) => {
    await using f = await Fixture(e)
    await doOpenSettingsScreen(f)
  })

  test.skip('back button', async (e) => {
    await using f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doClickBackButton(f)
    const screen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.LOGIN_SCREEN)
    expect(screen).toBeTruthy()
  })

  test.skip('status bar dropdown should close after opening settings screen', async (e) => {
    await using f = await Fixture(e)
    await doOpenSettingsScreen(f)
    // const dropDownSurface = await f.frontend.findByTestId(AppBarFrontend.TEST_ID.DROP_DOWN_SURFACE)
    // expect(dropDownSurface).toBeFalsy()
  })

  test('open choose renderer screen', async (e) => {
    await using f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)
  })
})
