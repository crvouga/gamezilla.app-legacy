import { describe, expect, test } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { FixtureAppE2E, IFixtureApp } from '~/app/@/test/app-fixture'
import { doDismissAlert } from '~/app/@/test/flows/do-dismiss-alert'
import { doLoginWithSms } from '~/app/@/test/flows/do-login-with-sms'
import { doOpenSettingsScreen } from '~/app/settings/@/test/do-open-settings-screen'
import { TEST_ID_LOGOUT_LIST_ITEM_BUTTON } from '~/app/settings/frontend'
import { TEST_ID_LOGIN_SCREEN } from '../frontend'
import { TEST_ID_LOGOUT_CONFIRMATION } from './frontend'

export const Fixture = FixtureAppE2E

describe('logout', () => {
  test('logout', async (e) => {
    await using f = await Fixture(e)
    await doLoginWithSms(f)
    await doOpenSettingsScreen(f)
    const logoutConfirmation = await doOpenLogoutConfirmation(f)
    const logoutButton = await logoutConfirmation.findByRole('button', 'Logout')
    expect(logoutButton).toBeTruthy()
    await logoutButton!.do({ t: 'click' })
    await doDismissAlert(f.frontend, 'info')
    const after = await f.frontend.findByTestId(TEST_ID_LOGIN_SCREEN)
    expect(after).toBeTruthy()
  })
})

const doOpenLogoutConfirmation = async (f: IFixtureApp) => {
  const before = await f.frontend.findByTestId(TEST_ID_LOGOUT_CONFIRMATION)
  await eventually(async () => expect(await before?.isVisible()).toBeFalsy())
  const logoutListItem = await f.frontend.findByTestId(TEST_ID_LOGOUT_LIST_ITEM_BUTTON)
  expect(logoutListItem).toBeTruthy()
  await logoutListItem!.do({ t: 'click' })
  const after = await f.frontend.findByTestId(TEST_ID_LOGOUT_CONFIRMATION)
  await eventually(async () => expect(await after?.isVisible()).toBeTruthy())
  return after!
}
