import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { TEST_ID_RENDERER_SCREEN } from '../../screen-renderer/frontend'

export const doOpenRendererScreen = async (f: IFixtureApp) => {
  const rendererScreenOpenButton = await f.frontend.findByRole('menuitem', 'Renderer')
  expect(rendererScreenOpenButton).toBeTruthy()
  await rendererScreenOpenButton!.do({ t: 'click' })
  const rendererScreen = await f.frontend.findByTestId(TEST_ID_RENDERER_SCREEN)
  expect(rendererScreen).toBeTruthy()
}
