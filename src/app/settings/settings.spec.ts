import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { FixtureAppE2E } from '~/app/@/test/fixture'
import { ScreenTestIds } from '../@/ui/screen/screen-test-ids'
import { AppStatusBar } from '../frontend/app-status-bar/app-status-bar'
import { SettingsFrontend } from './frontend'
import { VDomImpl } from '~/@/vdom/vdom-impl'
import { AuthFrontend } from '../auth/frontend'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAppE2E(e)
  const openSettingsScreen = async () => {
    const [statusBarOpenButton] = await f.frontend.query(`[data-testid="${AppStatusBar.dataTestId.openButton}"]`)
    await statusBarOpenButton!.do({ t: 'click' })
    const [settingsListItem] = await f.frontend.query(
      `[data-testid="${SettingsFrontend.dataTestId.openSettingsScreen}"]`,
    )
    await settingsListItem!.do({ t: 'click' })
    const [settingsScreen] = await f.frontend.query(`[data-testid="${SettingsFrontend.dataTestId.mainScreen}"]`)
    expect(settingsScreen).toBeTruthy()
  }

  const openChooseRendererScreen = async () => {
    const [button] = await f.frontend.query(`[data-testid="${SettingsFrontend.dataTestId.openChooseRendererScreen}"]`)
    button!.do({ t: 'click' })
    const [chooseRendererScreen] = await f.frontend.query(
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
    const [title] = await f.frontend.query(`[data-title='true']`)
    expect(await title?.text()).toEqual('Settings')
  })

  test.todo('back button', async (e) => {
    const f = await Fixture(e)
    await f.openSettingsScreen()
    const backButton = await f.frontend.byDataTestId(ScreenTestIds.backButton)
    expect(backButton).toBeTruthy()
    await backButton!.do({ t: 'click' })
    const loginScreen = await f.frontend.byDataTestId(AuthFrontend.dataTestId.loginScreen)
    expect(loginScreen).toBeTruthy()
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
    const backButton = await f.frontend.byDataTestId(ScreenTestIds.backButton)
    expect(backButton).toBeTruthy()
    await backButton!.do({ t: 'click' })
    const settingsScreen = await f.frontend.byDataTestId(SettingsFrontend.dataTestId.mainScreen)
    expect(settingsScreen).toBeTruthy()
  })

  test('render render options', async (e) => {
    const f = await Fixture(e)
    await f.openSettingsScreen()
    await f.openChooseRendererScreen()
    for (const vDomImpl of VDomImpl.ALL) {
      const option = await f.frontend.byDataTestId(SettingsFrontend.dataTestId.chooseRendererListItem(vDomImpl))
      expect(option).toBeTruthy()
    }
  })

  test.todo('change renderer to preact', async (e) => {
    const f = await Fixture(e)
    await f.openSettingsScreen()
    await f.openChooseRendererScreen()
    const option = await f.frontend.byDataTestId(SettingsFrontend.dataTestId.chooseRendererListItem('preact'))
    await option!.do({ t: 'click' })
    const backButton = await f.frontend.byDataTestId(ScreenTestIds.backButton)
    await backButton!.do({ t: 'click' })
    const mainScreen = await f.frontend.byDataTestId(SettingsFrontend.dataTestId.mainScreen)
    expect(mainScreen).toBeTruthy()
    const [found] = await f.frontend.query(`include-text("Preact")`)
    expect(found).toBeTruthy()
  })
})
