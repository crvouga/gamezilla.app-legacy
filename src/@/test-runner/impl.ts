import { initPlaywright } from './impl-playwright'
import { initVitest } from './impl-vitest'
import { Describe, Expect, Test } from './interface'
import { TestRunnerImpl } from './test-runner-impl'

export let expect: Expect
export let test: Test
export let describe: Describe

const testRunnerImpl = TestRunnerImpl.get()

switch (testRunnerImpl) {
  case 'playwright': {
    const playwright = await initPlaywright()
    expect = playwright.expect
    test = playwright.test
    describe = playwright.describe
    break
  }

  case 'vitest': {
    const vitest = await initVitest()
    expect = vitest.expect
    test = vitest.test
    describe = vitest.describe
    break
  }
}
