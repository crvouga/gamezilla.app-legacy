import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { FixtureAppE2E } from '~/app/@/test/fixture'
import { AppStatusBar } from '../frontend/app-status-bar/app-status-bar'
import { SettingsFrontend } from './frontend'

const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAppE2E(e)

  return { ...f }
}

describe('settings', () => {
  test('open settings page', async (e) => {
    const f = await Fixture(e)
    const [statusBarOpenButton] = await f.frontend.query(`[data-testid="${AppStatusBar.dataTestId.openButton}"]`)
    await statusBarOpenButton!.do({ t: 'click' })
    const [settingsListItem] = await f.frontend.query(`[data-testid="${AppStatusBar.dataTestId.openSettingsButton}"]`)
    await settingsListItem!.do({ t: 'click' })
    const [settingsScreen] = await f.frontend.query(`[data-testid="${SettingsFrontend.dataTestId.mainScreen}"]`)
    expect(settingsScreen).toBeDefined()
  })
})
