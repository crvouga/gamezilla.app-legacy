import { shuffle } from '~/@/array/shuffle'
import { describe, expect, test } from '~/@/test-runner'
import { VDomImplWeb } from '~/@/vdom/vdom-impl-web'
import { FixtureAppE2E } from '~/app/@/test/app-fixture/impl'
import { doClickBackButton } from '~/app/@/test/flows/do-click-back-button'
import { doOpenRendererScreen } from '../@/test/do-open-renderer-screen'
import { doOpenSettingsScreen } from '../@/test/do-open-settings-screen'
import { TEST_ID_SETTINGS_SCREEN } from '../frontend'
import { TEST_ID_RENDERER_SCREEN } from './frontend'

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
    await using f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)
    for (const vDomImpl of VDomImplWeb.VISIBLE) {
      const option = await f.frontend.findByRole('menuitem', VDomImplWeb.toName(vDomImpl))
      expect(option).toBeTruthy()
    }
  })

  test('change renderer', async (e) => {
    await using f = await Fixture(e)
    await doOpenSettingsScreen(f)
    await doOpenRendererScreen(f)

    const rendererScreen = await f.frontend.findByTestId(TEST_ID_RENDERER_SCREEN)
    expect(rendererScreen).toBeTruthy()

    for (const vDomImpl of shuffle(VDomImplWeb.VISIBLE)) {
      const option = await f.frontend.findByRole('menuitem', VDomImplWeb.toName(vDomImpl))
      expect(option).toBeTruthy()
      await option!.do({ t: 'click' })
      const optionText = await option!.text()
      const [selected] = await f.frontend.find(`[aria-selected="true"]`)
      expect(selected).toBeTruthy()
      const selectedText = await selected!.text()
      expect(optionText).toEqual(selectedText)
    }
  })
})
