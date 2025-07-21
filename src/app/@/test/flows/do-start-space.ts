import { expect } from '~/@/test-runner'
import { TEST_ID_SPACE_LIST_SCREEN } from '~/app/spaces/list-spaces/frontend'
import { TEST_ID_SPACE_SCREEN } from '~/app/spaces/space/frontend'
import { IFixtureApp } from '../app-fixture/interface'
import { doDismissAlert } from './do-dismiss-alert'

export const doStartSpace = async (f: IFixtureApp) => {
  const spaceListScreen = await f.frontend.findByTestId(TEST_ID_SPACE_LIST_SCREEN)
  expect(spaceListScreen).toBeTruthy()
  const [spaceSpaceFab] = await f.frontend!.find(`[data-fab='true']`)
  await spaceSpaceFab!.do({ t: 'click' })
  await doDismissAlert(f.frontend, 'info')
  const screen = await f.frontend.findByTestId(TEST_ID_SPACE_SCREEN)
  expect(screen).toBeTruthy()
}
