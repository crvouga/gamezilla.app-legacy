import { Describe, Expect, Test } from './interface'

export const initVitest = async (): Promise<{
  expect: Expect
  test: Test
  describe: Describe
}> => {
  const vitest = await import('vitest')

  const expect: Expect = (value) => {
    return {
      toBeTruthy() {
        vitest.expect(value).toBeTruthy()
      },
      toBeFalsy() {
        vitest.expect(value).toBeFalsy()
      },
      toEqual(expected) {
        vitest.expect(value).toEqual(expected)
      },
      not: {
        toBeTruthy() {
          vitest.expect(value).not.toBeTruthy()
        },
        toBeFalsy() {
          vitest.expect(value).not.toBeFalsy()
        },
        toEqual(expected) {
          vitest.expect(value).not.toEqual(expected)
        },
      },
    }
  }

  const test: Test = (name, fn) => {
    vitest.test(name, async () => {
      await fn({
        t: 'vitest',
        e2e: false,
        unit: true,
      })
    })
  }
  test.skip = (name, fn) => {
    vitest.test.skip(name, async () => {
      await fn({
        t: 'vitest',
        e2e: false,
        unit: true,
      })
    })
  }

  const describe: Describe = (name, fn) => {
    vitest.describe(name, () => {
      fn()
    })
  }
  describe.skip = (name, fn) => {
    vitest.describe.skip(name, () => {
      fn()
    })
  }

  return {
    expect,
    test,
    describe,
  }
}
