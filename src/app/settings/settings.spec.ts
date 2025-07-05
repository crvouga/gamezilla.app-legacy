import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { VDomImpl } from '~/@/vdom/vdom-impl'
import { FixtureAppE2E } from '~/app/@/test/fixture'
import { ScreenTestIds } from '../@/ui/screen/screen-test-ids'
import { AppStatusBar } from './app-status-bar'
import { SettingsFrontend } from './frontend'
import { AuthFrontend } from '../auth/frontend'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAppE2E(e)
  const openSettingsScreen = async () => {
    const [statusBarOpenButton] = await f.frontend.find(`[data-testid="${AppStatusBar.dataTestId.openButton}"]`)
    await statusBarOpenButton!.do({ t: 'click' })
    const [settingsListItem] = await f.frontend.find(
      `[data-testid="${SettingsFrontend.dataTestId.openSettingsScreen}"]`,
    )
    await settingsListItem!.do({ t: 'click' })
    const [settingsScreen] = await f.frontend.find(`[data-testid="${SettingsFrontend.dataTestId.screen}"]`)
    expect(settingsScreen).toBeTruthy()
  }

  const openChooseRendererScreen = async () => {
    const [button] = await f.frontend.find(`[data-testid="${SettingsFrontend.dataTestId.openChooseRendererScreen}"]`)
    button!.do({ t: 'click' })
    const [chooseRendererScreen] = await f.frontend.find(
      `[data-testid="${SettingsFrontend.dataTestId.chooseRendererScreen}"]`,
    )
    expect(chooseRendererScreen).toBeTruthy()
  }

  return { ...f, openSettingsScreen, openChooseRendererScreen }
}

describe('settings', () => {
  test('open settings screen', async (e) => {
    const f = await Fixture(e)
    await f.openSettingsScreen()
    const [title] = await f.frontend.find(`[data-title='true']`)
    const titleString = await title?.text()
    expect(titleString).toEqual('Settings')
  })

  test.skip('back button', async (e) => {
    const f = await Fixture(e)
    await f.openSettingsScreen()
    const [backButton] = await f.frontend.find(`[data-testid="${ScreenTestIds.backButton}"]`)
    await backButton!.do({ t: 'click' })
    const screen = await f.frontend.findByTestId(AuthFrontend.dataTestId.loginScreen)
    expect(screen).toBeTruthy()
  })

  test('open choose renderer screen', async (e) => {
    const f = await Fixture(e)
    await f.openSettingsScreen()
    await f.openChooseRendererScreen()
  })
})

describe('change renderer screen', () => {
  test('back button', async (e) => {
    const f = await Fixture(e)
    await f.openSettingsScreen()
    await f.openChooseRendererScreen()
    const backButton = await f.frontend.findByTestId(ScreenTestIds.backButton)
    expect(backButton).toBeTruthy()
    await backButton!.do({ t: 'click' })
    const settingsScreen = await f.frontend.findByTestId(SettingsFrontend.dataTestId.screen)
    expect(settingsScreen).toBeTruthy()
  })

  test.skip('render render options', async (e) => {
    const f = await Fixture(e)
    await f.openSettingsScreen()
    await f.openChooseRendererScreen()
    for (const vDomImpl of VDomImpl.ALL) {
      const option = await f.frontend.findByTestId(SettingsFrontend.dataTestId.chooseRendererListItem(vDomImpl))
      expect(option).toBeTruthy()
    }
  })

  test.skip('change renderer to preact', async (e) => {
    const f = await Fixture(e)
    await f.openSettingsScreen()
    await f.openChooseRendererScreen()
    const option = await f.frontend.findByTestId(SettingsFrontend.dataTestId.chooseRendererListItem('preact'))
    await option!.do({ t: 'click' })
    const backButton = await f.frontend.findByTestId(ScreenTestIds.backButton)
    await backButton!.do({ t: 'click' })
    const mainScreen = await f.frontend.findByTestId(SettingsFrontend.dataTestId.screen)
    expect(mainScreen).toBeTruthy()
    const [found] = await f.frontend.find(`include-text("Preact")`)
    expect(found).toBeTruthy()
  })
})
