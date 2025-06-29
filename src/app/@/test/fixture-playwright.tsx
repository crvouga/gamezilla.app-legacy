import type { Page } from '@playwright/test'
import { TestClient } from '~/@/test-client'
import { IFixtureApp } from './types'

export const FixtureAppPlaywright = async (config: { page: Page }): Promise<IFixtureApp> => {
  const client = await TestClient({
    t: 'playwright',
    page: config.page,
  })

  const cleanUp = async () => {
    //
  }

  return {
    frontend: client,
    [Symbol.asyncDispose]: cleanUp,
  }
}
