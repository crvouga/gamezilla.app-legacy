import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { setupLoginWithSms } from '~/app/@/test/setup/do-login-with-sms'
import { SettingsBar } from '~/app/settings/settings-bar'
import { FixtureAuthE2E } from '../@/test/e2e'
import { AuthFrontend } from '../frontend'

export const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAuthE2E(e)

  return { ...f }
}

describe('logout', () => {
  test.skip('open logout confirmation', async (e) => {
    await using f = await Fixture(e)
    await setupLoginWithSms(f)
    const openButton = await f.frontend.findByTestId(SettingsBar.TEST_ID.OPEN_BUTTON)
    await openButton!.do({ t: 'click' })
    const logoutListItemButton = await f.frontend.findByTestId(AuthFrontend.dataTestId.logoutListItemButton)
    expect(logoutListItemButton).toBeTruthy()
  })
})
