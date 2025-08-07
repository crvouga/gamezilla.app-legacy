import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { TEST_ID_SETTINGS_SCREEN } from '../../frontend'
import { TEST_ID_TOP_BAR_SURFACE, TEST_ID_TOP_BAR_SURFACE_OPEN_BUTTON } from '../../settings-top-bar'

export const doOpenSettingsScreen = async (f: IFixtureApp) => {
  const topBarOpenButton = await f.frontend.findByTestId(TEST_ID_TOP_BAR_SURFACE_OPEN_BUTTON)
  expect(topBarOpenButton).toBeTruthy()
  await topBarOpenButton!.do({ t: 'click' })
  //
  const topBarDropDownSurface = await f.frontend.findByTestId(TEST_ID_TOP_BAR_SURFACE)
  expect(topBarDropDownSurface).toBeTruthy()
  //
  const settingsScreenOpenButton = await f.frontend.findByRole('menuitem', 'Settings')
  expect(settingsScreenOpenButton).toBeTruthy()
  await settingsScreenOpenButton!.do({ t: 'click' })
  //
  const settingsScreen = await f.frontend.findByTestId(TEST_ID_SETTINGS_SCREEN)
  expect(settingsScreen).toBeTruthy()
}
