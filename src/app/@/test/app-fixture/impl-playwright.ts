import type { Page } from '@playwright/test'
import { TestClient } from '~/@/test-client'
import { IFixtureApp } from './interface'
import { MAX_WAIT, POLL } from './test-max-wait'
import { Translator } from '~/@/l18n/generated'

export const FixtureAppPlaywrightE2E = async (config: { getPage: () => Page }): Promise<IFixtureApp> => {
  const client = await TestClient.init({
    t: 'playwright',
    getPage: config.getPage,
    maxWait: MAX_WAIT,
    poll: POLL,
  })

  const cleanUp = async () => {
    //
  }

  return {
    frontend: client,
    t: Translator('en'),
    [Symbol.asyncDispose]: cleanUp,
  }
}
