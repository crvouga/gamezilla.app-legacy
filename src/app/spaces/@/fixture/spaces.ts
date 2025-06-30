import { expect, TestRunnerEnv } from '~/@/test-runner'
import { FixtureApp } from '~/app/@/test/fixture'
import { setupLoginWithSms } from '~/app/@/test/setup-login-with-sms'

export const FixtureSpaces = async (e: TestRunnerEnv) => {
  const f = await FixtureApp(e)

  await setupLoginWithSms(f)

  const [screen] = await f.frontend.query(`[data-testid='spaces/space-list-screen']`)
  expect(screen).toBeDefined()

  return {
    ...f,
  }
}
