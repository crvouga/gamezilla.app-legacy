import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { VDomImpl } from '~/@/vdom/vdom-impl'
import { FixtureAppE2E } from '~/app/@/test/fixture'
import { doClickBackButton } from '~/app/@/test/setup/do-click-back-button'
import { doOpenRendererScreen } from '../@/test/do-open-renderer-screen'
import { doOpenSettingsScreen } from '../@/test/do-open-settings-screen'
import { SettingsFrontend } from '../frontend'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAppE2E(e)

  return { ...f }
}

describe('screen renderer', () => {
  test('back button', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)
    await doClickBackButton(f)
    const settingsScreen = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.SETTINGS_SCREEN)
    expect(settingsScreen).toBeTruthy()
  })

  test.skip('render render options', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)
    for (const vDomImpl of VDomImpl.ALL) {
      const option = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.RENDERER_MENU_ITEM(vDomImpl))
      expect(option).toBeTruthy()
    }
  })

  test.skip('change renderer to preact', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)
    const option = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.RENDERER_MENU_ITEM('preact'))
    await option!.do({ t: 'click' })
    await doClickBackButton(f)
    const mainScreen = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.SETTINGS_SCREEN)
    expect(mainScreen).toBeTruthy()
    const [found] = await f.frontend.find(`include-text("Preact")`)
    expect(found).toBeTruthy()
  })
})
