import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/types'

import { AppBarFrontend } from '~/app/frontend/app-bar'
import { SettingsFrontend } from '../../frontend'

export const doOpenSettingsScreen = async (f: IFixtureApp) => {
  const statusBarOpenButton = await f.frontend.findByTestId(AppBarFrontend.TEST_ID.OPEN_BUTTON)
  expect(statusBarOpenButton).toBeTruthy()
  await statusBarOpenButton!.do({ t: 'click' })
  const dropDownSurface = await f.frontend.findByTestId(AppBarFrontend.TEST_ID.DROP_DOWN_SURFACE)
  expect(dropDownSurface).toBeTruthy()
  const settingsScreenOpenButton = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.SETTINGS_SCREEN_OPEN_BUTTON)
  expect(settingsScreenOpenButton).toBeTruthy()
  await settingsScreenOpenButton!.do({ t: 'click' })
  const settingsScreen = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.SETTINGS_SCREEN)
  expect(settingsScreen).toBeTruthy()
}
