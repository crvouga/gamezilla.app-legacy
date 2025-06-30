import { expect, TestRunnerEnv } from '~/@/test-runner'
import { FixtureAppE2E } from '~/app/@/test/fixture'
import { setupLoginWithSms } from '~/app/@/test/setup-login-with-sms'

export const FixtureSpacesE2E = async (e: TestRunnerEnv) => {
  const f = await FixtureAppE2E(e)

  await setupLoginWithSms(f)

  const [screen] = await f.frontend.query(`[data-testid='spaces/space-list-screen']`)
  expect(screen).toBeDefined()

  return {
    ...f,
  }
}
