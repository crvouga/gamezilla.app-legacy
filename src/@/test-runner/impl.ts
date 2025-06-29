import { ITestRunner } from './interface'

export const testRunner: ITestRunner = async (defineTests) => {
  const IS_PLAYWRIGHT = process.env.PLAYWRIGHT_TEST === 'true'
  if (IS_PLAYWRIGHT) {
    return await import('./impl-playwright').then((m) => m.playwrightTestRunner(defineTests))
  }

  return defineTests
}
