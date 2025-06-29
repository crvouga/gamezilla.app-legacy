import { expect, test } from '@playwright/test'
import { ITestRunner } from './interface'

export const playwrightTestRunner: ITestRunner = async (defineTests) => {
  defineTests({
    // @ts-expect-error
    expect,
    // @ts-expect-error
    test,
    // @ts-expect-error
    describe: test.describe,
    env: {
      t: 'playwright',
      // @ts-expect-error Page is defined in global scope by playwright
      page,
    },
  })
}
