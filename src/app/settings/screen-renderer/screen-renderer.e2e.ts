import { describe, expect, test } from '~/@/test-runner'
import { VDomImpl } from '~/@/vdom/vdom-impl'
import { FixtureAppE2E } from '~/app/@/test/app-fixture/impl'
import { doClickBackButton } from '~/app/@/test/setup/do-click-back-button'
import { doOpenRendererScreen } from '../@/test/do-open-renderer-screen'
import { doOpenSettingsScreen } from '../@/test/do-open-settings-screen'
import { SettingsFrontend } from '../frontend'

const Fixture = FixtureAppE2E

describe('screen renderer', () => {
  test('back button', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)
    await doClickBackButton(f)
    const settingsScreen = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.SETTINGS_SCREEN)
    expect(settingsScreen).toBeTruthy()
  })

  test('render renderer options', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)
    for (const vDomImpl of VDomImpl.VISIBLE) {
      const option = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.RENDERER_MENU_ITEM(vDomImpl))
      expect(option).toBeTruthy()
    }
  })

  test('change renderer', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)

    const vDomImpl = VDomImpl.VISIBLE[Math.floor(VDomImpl.VISIBLE.length * Math.random())] ?? 'preact'

    const option = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.RENDERER_MENU_ITEM(vDomImpl))
    expect(option).toBeTruthy()
    await option!.do({ t: 'click' })

    const [selected] = await f.frontend.find(`[aria-selected="true"]`)
    expect(selected).toBeTruthy()

    const optionText = await option!.text()
    const selectedText = await selected!.text()
    expect(optionText).toEqual(selectedText)
  })
})
