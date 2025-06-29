import type { Page } from '@playwright/test'
import { TestClient } from '~/@/test-client'
import { IFixtureApp } from './types'

export const FixtureAppPlaywright = async (config: { getPage: () => Promise<Page> }): Promise<IFixtureApp> => {
  const client = await TestClient({
    t: 'playwright',
    getPage: config.getPage,
  })

  const cleanUp = async () => {
    //
  }

  return {
    frontend: client,
    [Symbol.asyncDispose]: cleanUp,
  }
}
