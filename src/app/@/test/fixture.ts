import { TestRunnerEnv } from '~/@/test-runner'
import { IFixtureApp } from './types'

export const FixtureAppE2E = async (env: TestRunnerEnv): Promise<IFixtureApp> => {
  switch (env.t) {
    case 'playwright': {
      const { FixtureAppPlaywrightE2E } = await import('./fixture-playwright')
      return FixtureAppPlaywrightE2E(env)
    }
    default: {
      const { FixtureAppUnitTestE2E } = await import('./fixture-unit')
      return FixtureAppUnitTestE2E()
    }
  }
}
