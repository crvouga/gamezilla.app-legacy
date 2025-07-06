import { expect, TestRunnerEnv } from '~/@/test-runner'
import { FixtureAppE2E } from '~/app/@/test/app-fixture/impl'
import { doLoginWithSms } from '~/app/@/test/setup/do-login-with-sms'

export const FixtureSpacesE2E = async (e: TestRunnerEnv) => {
  const f = await FixtureAppE2E(e)

  await doLoginWithSms(f)

  const [screen] = await f.frontend.find(`[data-testid='spaces/space-list-screen']`)
  expect(screen).toBeTruthy()

  return {
    ...f,
  }
}
