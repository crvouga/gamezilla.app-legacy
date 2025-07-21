import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { doDismissAlert } from '~/app/@/test/flows/do-dismiss-alert'
import { TEST_ID_NUMBERLINK_PACK_BUILDER_OPEN_SCREEN } from '../../screen-pack-builder-open/frontend'
import { TEST_ID_NUMBERLINK_PACK_BUILDER_SCREEN } from '../../screen-pack-builder/frontend'

export const doCreateNewPack = async (f: IFixtureApp) => {
  expect(await f.frontend.findByTestId(TEST_ID_NUMBERLINK_PACK_BUILDER_OPEN_SCREEN)).toBeTruthy()
  const [createNewPackButton] = await f.frontend.find(`[data-fab='true']`)
  expect(createNewPackButton).toBeTruthy()
  await createNewPackButton!.do({ t: 'click' })
  await doDismissAlert(f.frontend, 'info')
  const screen = await f.frontend.findByTestId(TEST_ID_NUMBERLINK_PACK_BUILDER_SCREEN)
  expect(screen).toBeTruthy()
}
