import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { TEST_ID_SETTINGS_SCREEN } from '../../frontend'

export const doOpenSettingsScreen = async (f: IFixtureApp) => {
  const topBarOpenButton = await f.frontend.findByRole('button', f.t('app.open-settings'))
  expect(topBarOpenButton).toBeTruthy()
  await topBarOpenButton!.do({ t: 'click' })
  //
  const topBarDropDownSurface = await f.frontend.findByRole('menu', f.t('app.settings'))
  expect(topBarDropDownSurface).toBeTruthy()
  //
  const settingsScreenOpenButton = await f.frontend.findByRole('menuitem', f.t('app.settings'))
  expect(settingsScreenOpenButton).toBeTruthy()
  await settingsScreenOpenButton!.do({ t: 'click' })
  //
  const settingsScreen = await f.frontend.findByTestId(TEST_ID_SETTINGS_SCREEN)
  expect(settingsScreen).toBeTruthy()
}
