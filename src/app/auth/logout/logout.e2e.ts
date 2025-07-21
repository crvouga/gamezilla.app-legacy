import { describe, expect, test } from '~/@/test-runner'
import { eventually } from '~/@/test/eventually'
import { FixtureAppE2E, IFixtureApp } from '~/app/@/test/app-fixture'
import { doLoginWithSms } from '~/app/@/test/setup/do-login-with-sms'
import { doSubmitForm } from '~/app/@/test/setup/do-submit-form'
import { doOpenSettingsScreen } from '~/app/settings/@/test/do-open-settings-screen'
import { SettingsFrontend } from '~/app/settings/frontend'
import { AuthFrontend } from '../frontend'

export const Fixture = FixtureAppE2E

describe('logout', () => {
  test('logout', async (e) => {
    await using f = await Fixture(e)
    await doLoginWithSms(f)
    await doOpenSettingsScreen(f)
    const logoutConfirmation = await doOpenLogoutConfirmation(f)
    await doSubmitForm(logoutConfirmation)
    const after = await f.frontend.findByTestId(AuthFrontend.TEST_ID.LOGIN_SCREEN)
    expect(after).toBeTruthy()
  })
})

const doOpenLogoutConfirmation = async (f: IFixtureApp) => {
  const before = await f.frontend.findByTestId(AuthFrontend.TEST_ID.LOGOUT_CONFIRMATION)
  await eventually(async () => {
    expect(await before?.isVisible()).toBeFalsy()
  })
  await doClickLogoutListItem(f)
  const after = await f.frontend.findByTestId(AuthFrontend.TEST_ID.LOGOUT_CONFIRMATION)
  await eventually(async () => {
    expect(await after?.isVisible()).toBeTruthy()
  })
  return after!
}

const doClickLogoutListItem = async (f: IFixtureApp) => {
  const logoutListItem = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.LOGOUT_LIST_ITEM_BUTTON)
  expect(logoutListItem).toBeTruthy()
  await logoutListItem!.do({ t: 'click' })
}
