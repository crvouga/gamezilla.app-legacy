import { describe, expect, test } from '~/@/test-runner'
import { isSuperset } from './is-superset'

const eq = <A>(a: A, b: A) => a === b

describe('isSuperset', async () => {
  test('isSuperset', async () => {
    expect(isSuperset([], [], eq)).toEqual(true)
    expect(isSuperset(['a'], [], eq)).toEqual(true)
    expect(isSuperset(['a'], ['a'], eq)).toEqual(true)
    expect(isSuperset(['a', 'b'], ['a'], eq)).toEqual(true)
    expect(isSuperset([], ['a'], eq)).toEqual(false)
    expect(isSuperset(['a'], ['a', 'b'], eq)).toEqual(false)
  })
})
