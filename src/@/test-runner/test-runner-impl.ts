export type TestRunnerImpl = 'playwright' | 'vitest'

const get = (): TestRunnerImpl => {
  if (process.env.IS_PLAYWRIGHT_TEST === 'true') return 'playwright'
  if (process.env.IS_VITEST_TEST === 'true') return 'vitest'
  return 'vitest'
}

export const TestRunnerImpl = {
  get,
}
