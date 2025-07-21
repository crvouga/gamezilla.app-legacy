import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import {
  TEST_ID_SETTINGS_SCREEN,
  TEST_ID_SETTINGS_SCREEN_OPEN_BUTTON,
  TEST_ID_TOP_BAR_DROP_DOWN_SURFACE,
  TEST_ID_TOP_BAR_OPEN_BUTTON,
} from '../../frontend'

export const doOpenSettingsScreen = async (f: IFixtureApp) => {
  const topBarOpenButton = await f.frontend.findByTestId(TEST_ID_TOP_BAR_OPEN_BUTTON)
  expect(topBarOpenButton).toBeTruthy()
  await topBarOpenButton!.do({ t: 'click' })
  //
  const topBarDropDownSurface = await f.frontend.findByTestId(TEST_ID_TOP_BAR_DROP_DOWN_SURFACE)
  expect(topBarDropDownSurface).toBeTruthy()
  //
  const settingsScreenOpenButton = await f.frontend.findByTestId(TEST_ID_SETTINGS_SCREEN_OPEN_BUTTON)
  expect(settingsScreenOpenButton).toBeTruthy()
  await settingsScreenOpenButton!.do({ t: 'click' })
  //
  const settingsScreen = await f.frontend.findByTestId(TEST_ID_SETTINGS_SCREEN)
  expect(settingsScreen).toBeTruthy()
}
