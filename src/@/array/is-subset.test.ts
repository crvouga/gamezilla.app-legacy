import { describe, expect, test } from '~/@/test-runner'
import { isSubset } from './is-subset'

const eq = <A>(a: A, b: A) => a === b

describe('isSubset', async () => {
  test('isSubset', async () => {
    expect(isSubset(eq, [], [])).toEqual(true)
    expect(isSubset(eq, [], ['a'])).toEqual(true)
    expect(isSubset(eq, ['a'], ['a'])).toEqual(true)
    expect(isSubset(eq, ['a'], ['a', 'b'])).toEqual(true)
    expect(isSubset(eq, ['a'], [])).toEqual(false)
    expect(isSubset(eq, ['a', 'b'], ['a'])).toEqual(false)
  })
})
