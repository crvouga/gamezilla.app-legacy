import { TestRunnerEnv } from '~/@/test-runner'
import { IFixtureApp } from './interface'

export const FixtureAppE2E = async (env: TestRunnerEnv): Promise<IFixtureApp> => {
  switch (env.t) {
    case 'playwright': {
      const { FixtureAppPlaywrightE2E } = await import('./impl-playwright')
      return FixtureAppPlaywrightE2E(env)
    }
    default: {
      const { FixtureAppUnitTestE2E } = await import('./impl-unit')
      return FixtureAppUnitTestE2E()
    }
  }
}
