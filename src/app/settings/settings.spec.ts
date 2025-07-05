import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { FixtureAppE2E } from '~/app/@/test/fixture'
import { doClickBackButton } from '../@/test/setup/do-click-back-button'
import { AuthFrontend } from '../auth/frontend'
import { AppBarFrontend } from '../frontend/app-bar'
import { doOpenRendererScreen } from './@/test/do-open-renderer-screen'
import { doOpenSettingsScreen } from './@/test/do-open-settings-screen'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAppE2E(e)

  return { ...f }
}

describe('settings', () => {
  test('open settings screen', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    const [title] = await f.frontend.find(`[data-title='true']`)
    const titleString = await title?.text()
    expect(titleString).toEqual('Settings')
  })

  test.skip('back button', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doClickBackButton(f)
    const screen = await f.frontend.findByTestId(AuthFrontend.dataTestId.loginScreen)
    expect(screen).toBeTruthy()
  })

  test.skip('status bar dropdown should close after opening settings screen', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    const dropDownSurface = await f.frontend.findByTestId(AppBarFrontend.TEST_ID.DROP_DOWN_SURFACE)
    expect(dropDownSurface).toBeFalsy()
  })

  test('open choose renderer screen', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)
  })
})
