import { TestRunnerEnv } from '~/@/test-runner'
import { FixtureAppPlaywright } from './fixture-playwright'
import { FixtureAppUnitTest } from './fixture-unit'
import { IFixtureApp } from './types'

export const FixtureApp = (env: TestRunnerEnv): Promise<IFixtureApp> => {
  switch (env.t) {
    case 'vitest': {
      return FixtureAppUnitTest()
    }
    case 'playwright': {
      return FixtureAppPlaywright(env)
    }
  }
}
