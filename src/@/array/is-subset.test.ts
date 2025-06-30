import { describe, expect, test } from '~/@/test-runner'
import { isSubset } from './is-subset'

const eq = <A>(a: A, b: A) => a === b

describe('isSubset', async () => {
  test('isSubset', async () => {
    expect(isSubset([], [], eq)).toEqual(true)
    expect(isSubset([], ['a'], eq)).toEqual(true)
    expect(isSubset(['a'], ['a'], eq)).toEqual(true)
    expect(isSubset(['a'], ['a', 'b'], eq)).toEqual(true)
    expect(isSubset(['a'], [], eq)).toEqual(false)
    expect(isSubset(['a', 'b'], ['a'], eq)).toEqual(false)
  })
})
