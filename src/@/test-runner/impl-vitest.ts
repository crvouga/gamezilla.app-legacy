import { Describe, Expect, Test } from './interface'

export const initVitest = async (): Promise<{
  expect: Expect
  test: Test
  describe: Describe
}> => {
  const vitest = await import('vitest')

  const expect: Expect = (value) => {
    return {
      toBeDefined() {
        vitest.expect(value).toBeDefined()
      },
      toBeUndefined() {
        vitest.expect(value).toBeUndefined()
      },
      toEqual(expected) {
        vitest.expect(value).toEqual(expected)
      },
      not: {
        toBeDefined() {
          vitest.expect(value).not.toBeDefined()
        },
        toBeUndefined() {
          vitest.expect(value).not.toBeUndefined()
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
  test.todo = (name, fn) => {
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
  describe.todo = (name, fn) => {
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
