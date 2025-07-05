import { expect } from '~/@/test-runner'
import { IFixtureApp } from '../types'

export const doClickBackButton = async (f: IFixtureApp) => {
  const [backButton] = await f.frontend.find(`button[aria-label='Back']`)
  expect(backButton).toBeTruthy()
  await backButton!.do({ t: 'click' })
}
