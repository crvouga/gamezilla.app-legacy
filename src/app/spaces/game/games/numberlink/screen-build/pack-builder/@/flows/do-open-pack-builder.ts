import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { TEST_ID_NUMBERLINK_PACK_BUILDER_OPEN_SCREEN } from '../../screen-pack-builder-open/frontend'

export const doOpenPackBuilder = async (f: IFixtureApp) => {
  const packBuilderOption = await f.frontend.findByRole('menuitem', 'Pack Builder')
  expect(packBuilderOption).toBeTruthy()
  await packBuilderOption!.do({ t: 'click' })
  const screen = await f.frontend.findByTestId(TEST_ID_NUMBERLINK_PACK_BUILDER_OPEN_SCREEN)
  expect(screen).toBeTruthy()
}
