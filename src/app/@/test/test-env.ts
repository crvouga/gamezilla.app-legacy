export type ITestEnv =
  | {
      t: 'unit'
    }
  | {
      t: 'integration'
    }

export const TestEnv = (): ITestEnv => {
  if (process.env.IS_INTEGRATION_TEST === 'true') {
    return {
      t: 'integration',
    }
  }

  return {
    t: 'unit',
  }
}
