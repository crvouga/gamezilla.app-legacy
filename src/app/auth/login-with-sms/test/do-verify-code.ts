import { IFixtureApp } from '~/app/@/test/types'

export const doVerifyCode = async (f: IFixtureApp, config?: { code?: string }) => {
  await f.frontend.find(`[data-testid='auth/verify-code-screen']`)
  const [input] = await f.frontend.find(`input[type='tel']`)
  await input!.do({ t: 'input', value: config?.code ?? '123' })
  const [button] = await f.frontend.find(`button[type='submit']`)
  await button!.do({ t: 'click' })
}
