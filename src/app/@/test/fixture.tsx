import { TestRunnerEnv } from '~/@/test-runner'
import { IFixtureApp } from './types'

export const FixtureApp = async (env: TestRunnerEnv): Promise<IFixtureApp> => {
  switch (env.t) {
    case 'vitest': {
      const { FixtureAppUnitTest } = await import('./fixture-unit')
      return FixtureAppUnitTest()
    }
    case 'playwright': {
      const { FixtureAppPlaywright } = await import('./fixture-playwright')
      return FixtureAppPlaywright(env)
    }
  }
}
