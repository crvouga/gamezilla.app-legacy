import { TestRunnerEnv } from '~/@/test-runner'
import { FixtureAppE2E } from '~/app/@/test/app-fixture/impl'

export const FixtureAuthE2E = async (env: TestRunnerEnv) => {
  const f = await FixtureAppE2E(env)

  return { ...f }
}
