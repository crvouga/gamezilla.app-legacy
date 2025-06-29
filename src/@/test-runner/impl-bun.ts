import { describe, expect, test } from 'bun:test'
import { ITestRunner } from './interface'

export const bunTestRunner: ITestRunner = (defineTests) => {
  defineTests({
    // @ts-expect-error
    expect,
    // @ts-expect-error
    test,
    // @ts-expect-error
    describe,
    env: {
      t: 'bun',
    },
  })
}
