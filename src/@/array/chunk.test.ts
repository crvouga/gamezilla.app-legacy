import { describe, expect, test } from '~/@/test-runner'
import { chunk } from './chunk'

describe('chunk', () => {
  test('splits array into chunks of specified size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ])
    expect(chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]])
  })

  test('returns empty array for empty input', () => {
    expect(chunk([], 2)).toEqual([])
  })

  test('returns empty array for invalid sizes', () => {
    expect(chunk([1, 2, 3], 0)).toEqual([])
    expect(chunk([1, 2, 3], -1)).toEqual([])
    expect(chunk([1, 2, 3], -Infinity)).toEqual([])
    expect(chunk([1, 2, 3], Infinity)).toEqual([])
    expect(chunk([1, 2, 3], NaN)).toEqual([])
  })

  test('handles size larger than array length', () => {
    expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]])
  })

  test('handles size equal to array length', () => {
    expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]])
  })
})
