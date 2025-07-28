import { describe, expect, test } from '~/@/test-runner'
import { ensureLength } from './ensure-length'

describe('ensureLength', () => {
  test('pads array with fill value when shorter than target length', () => {
    expect(ensureLength(['x'], 3, null)).toEqual(['x', null, null])
    expect(ensureLength([1, 2], 4, 0)).toEqual([1, 2, 0, 0])
  })

  test('truncates array when longer than target length', () => {
    expect(ensureLength([1, 2, 3], 2, 0)).toEqual([1, 2])
  })

  test('returns empty array when target length is 0', () => {
    expect(ensureLength([1, 2, 3], 0, 0)).toEqual([])
  })

  test('returns empty array when target length is negative', () => {
    expect(ensureLength([1, 2, 3], -1, 0)).toEqual([])
  })

  test('returns empty array for NaN length', () => {
    expect(ensureLength([1, 2, 3], NaN, 0)).toEqual([])
  })

  test('returns empty array for Infinity length', () => {
    expect(ensureLength([1, 2, 3], Infinity, 0)).toEqual([])
    expect(ensureLength([1, 2, 3], -Infinity, 0)).toEqual([])
  })

  test('handles empty input array', () => {
    expect(ensureLength([], 3, 0)).toEqual([0, 0, 0])
    expect(ensureLength([], 0, 0)).toEqual([])
  })

  test('returns copy of array when length matches target', () => {
    const input = [1, 2, 3]
    const result = ensureLength(input, 3, 0)
    expect(result).toEqual(input)
  })
})
