import { ITestRunner } from './interface'

const IS_PLAYWRIGHT = process.env.PLAYWRIGHT_TEST === 'true'

export const testRunner: ITestRunner = async (defineTests) => {
  if (IS_PLAYWRIGHT) {
    return await import('./impl-playwright').then((m) => m.playwrightTestRunner(defineTests))
  }
  return await import('./impl-bun').then((m) => m.bunTestRunner(defineTests))
}
