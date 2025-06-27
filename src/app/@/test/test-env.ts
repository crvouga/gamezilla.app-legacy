import { CONFIG_SHARED } from '~/config/shared'

export type ITestEnv =
  | {
      t: 'unit'
    }
  | {
      t: 'integration'
    }

export const TestEnv = (): ITestEnv => {
  if (CONFIG_SHARED.IS_INTEGRATION_TEST) {
    return {
      t: 'integration',
    }
  }

  return {
    t: 'unit',
  }
}
