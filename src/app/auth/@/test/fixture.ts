import { TestRunnerEnv } from '~/@/test-runner'
import { FixtureApp } from '~/app/@/test/fixture'

export const FixtureAuth = async (env: TestRunnerEnv) => {
  const f = await FixtureApp(env)

  return { ...f }
}
