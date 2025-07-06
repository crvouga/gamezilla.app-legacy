import { expect } from '~/@/test-runner'
import { IFixtureApp } from '~/app/@/test/app-fixture/interface'
import { AuthFrontend } from '../../frontend'

export const doVerifyCode = async (f: IFixtureApp, config?: { code?: string }) => {
  const screen = await f.frontend.findByTestId(AuthFrontend.TEST_ID.VERIFY_CODE_SCREEN)
  expect(screen).toBeTruthy()
  //
  const [input] = await f.frontend.find(`input[type='tel']`)
  await input!.do({ t: 'input', value: config?.code ?? '123' })
  const [button] = await f.frontend.find(`button[type='submit']`)
  await button!.do({ t: 'click' })
}
