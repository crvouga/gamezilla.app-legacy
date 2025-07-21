import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { TEST_ID_NUMBERLINK_BUILD_MAIN_MENU_SCREEN } from '../../screen-main-menu/frontend'

export const doOpenNumberlinkBuild = async (f: IFixtureApp) => {
  const buildOption = await f.frontend.findByRole('menuitem', 'Build')
  expect(buildOption).toBeTruthy()
  await buildOption!.do({ t: 'click' })
  const screen = await f.frontend.findByTestId(TEST_ID_NUMBERLINK_BUILD_MAIN_MENU_SCREEN)
  expect(screen).toBeTruthy()
}
