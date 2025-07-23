import { describe, expect, test } from '~/@/test-runner'
import { VDomImplWeb } from '~/@/vdom/vdom-impl-web'
import { FixtureAppE2E } from '~/app/@/test/app-fixture/impl'
import { doClickBackButton } from '~/app/@/test/flows/do-click-back-button'
import { doOpenRendererScreen } from '../@/test/do-open-renderer-screen'
import { doOpenSettingsScreen } from '../@/test/do-open-settings-screen'
import { TEST_ID_SETTINGS_SCREEN } from '../frontend'
import { TEST_ID_RENDERER_MENU_ITEM, TEST_ID_RENDERER_SCREEN } from './frontend'

const Fixture = FixtureAppE2E

describe('screen renderer', () => {
  test('back button', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)
    await doClickBackButton(f)
    const settingsScreen = await f.frontend.findByTestId(TEST_ID_SETTINGS_SCREEN)
    expect(settingsScreen).toBeTruthy()
  })

  test('render renderer options', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)
    for (const vDomImpl of VDomImplWeb.VISIBLE) {
      const option = await f.frontend.findByTestId(TEST_ID_RENDERER_MENU_ITEM(vDomImpl))
      expect(option).toBeTruthy()
    }
  })

  test('change renderer', async (e) => {
    const f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)

    const vDomImpl = VDomImplWeb.VISIBLE[Math.floor(VDomImplWeb.VISIBLE.length * Math.random())] ?? 'preact'

    const option = await f.frontend.findByTestId(TEST_ID_RENDERER_MENU_ITEM(vDomImpl))
    expect(option).toBeTruthy()
    await option!.do({ t: 'click' })
    const rendererScreen = await f.frontend.findByTestId(TEST_ID_RENDERER_SCREEN)
    expect(rendererScreen).toBeTruthy()

    const [selected] = await f.frontend.find(`[aria-selected="true"]`)
    expect(selected).toBeTruthy()

    const optionText = await option!.text()
    const selectedText = await selected!.text()
    expect(optionText).toEqual(selectedText)
  })
})
