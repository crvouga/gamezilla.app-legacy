import type { Page } from '@playwright/test'
import { TestClient } from '~/@/test-client'
import { TimeSpan } from '~/@/time/time-span'
import { IFixtureApp } from './types'

export const FixtureAppPlaywrightE2E = async (config: { getPage: () => Page }): Promise<IFixtureApp> => {
  const client = await TestClient({
    t: 'playwright',
    getPage: config.getPage,
    maxWait: TimeSpan.seconds(5),
    poll: TimeSpan.seconds(1),
  })

  const cleanUp = async () => {
    //
  }

  return {
    frontend: client,
    [Symbol.asyncDispose]: cleanUp,
  }
}
