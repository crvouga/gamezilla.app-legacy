import { describe, expect, test, TestRunnerEnv } from '~/@/test-runner'
import { setupLoginWithSms } from '~/app/@/test/setup-login-with-sms'
import { AppStatusBar } from '~/app/frontend/app-status-bar/app-status-bar'
import { FixtureAuthE2E } from '../@/test/e2e'
import { AuthFrontend } from '../frontend'

export const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAuthE2E(e)

  return { ...f }
}

describe('logout', () => {
  test.todo('open logout confirmation', async (e) => {
    await using f = await Fixture(e)
    await setupLoginWithSms(f)
    const openButton = await f.frontend.byDataTestId(AppStatusBar.dataTestId.openButton)
    await openButton!.do({ t: 'click' })
    const logoutListItemButton = await f.frontend.byDataTestId(AuthFrontend.dataTestId.logoutListItemButton)
    expect(logoutListItemButton).toBeTruthy()
  })
})
