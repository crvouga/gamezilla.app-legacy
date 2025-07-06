import { describe, test, TestRunnerEnv } from '~/@/test-runner'
import { doLoginWithSms } from '~/app/@/test/setup/do-login-with-sms'
import { FixtureAuthE2E } from '../@/test/e2e'

export const Fixture = async (e: TestRunnerEnv) => {
  const f = await FixtureAuthE2E(e)

  return { ...f }
}

describe('logout', () => {
  test.skip('open logout confirmation', async (e) => {
    await using f = await Fixture(e)
    await doLoginWithSms(f)
    // const openButton = await f.frontend.findByTestId(AppBarFrontend.TEST_ID.OPEN_BUTTON)
    // await openButton!.do({ t: 'click' })
    // const logoutListItemButton = await f.frontend.findByTestId(AuthFrontend.TEST_ID.LOGOUT_LIST_ITEM_BUTTON)
    // expect(logoutListItemButton).toBeTruthy()
  })
})
