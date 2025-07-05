import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/types'
import { SettingsFrontend } from '~/app/settings/frontend'

export const doOpenRendererScreen = async (f: IFixtureApp) => {
  const rendererScreenOpenButton = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.RENDERER_SCREEN_OPEN_BUTTON)
  expect(rendererScreenOpenButton).toBeTruthy()
  await rendererScreenOpenButton!.do({ t: 'click' })
  const chooseRendererScreen = await f.frontend.findByTestId(SettingsFrontend.TEST_ID.RENDERER_SCREEN)
  expect(chooseRendererScreen).toBeTruthy()
}
