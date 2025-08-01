import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { TEST_ID_NUMBERLINK_MAIN_MENU_SCREEN } from '../../frontend'

export const doOpenNumberlink = async (f: IFixtureApp) => {
  const numberlinkGameTile = await f.frontend.findByRole('link', 'numberlink')
  expect(numberlinkGameTile).toBeTruthy()
  await numberlinkGameTile!.do({ t: 'click' })
  const screen = await f.frontend.findByTestId(TEST_ID_NUMBERLINK_MAIN_MENU_SCREEN)
  expect(screen).toBeTruthy()
}
