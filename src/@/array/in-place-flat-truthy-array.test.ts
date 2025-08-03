import { describe, expect, test } from '~/@/test-runner'
import { inPlaceFlatTruthyArray } from './in-place-flat-truthy-array'

describe('inPlaceFlatTruthyArray', () => {
  test('should return empty array for null input', () => {
    expect(inPlaceFlatTruthyArray(null)).toEqual([])
  })

  test('should return empty array for undefined input', () => {
    expect(inPlaceFlatTruthyArray(undefined)).toEqual([])
  })

  test('should return array with single value for non-array input', () => {
    expect(inPlaceFlatTruthyArray(1)).toEqual([1])
    expect(inPlaceFlatTruthyArray('test')).toEqual(['test'])
  })

  test('should filter out falsy values', () => {
    expect(inPlaceFlatTruthyArray([1, false, 2, null, 3, undefined, 4, 0, 5])).toEqual([1, 2, 3, 4, 5])
  })

  test('should flatten nested arrays', () => {
    expect(inPlaceFlatTruthyArray([1, [2, [3]], 4])).toEqual([1, 2, 3, 4])
  })

  test('should flatten and filter nested arrays with falsy values', () => {
    expect(inPlaceFlatTruthyArray([1, [2, false, [3, null]], 4, [undefined, 5]])).toEqual([1, 2, 3, 4, 5])
  })

  test('should handle empty arrays', () => {
    expect(inPlaceFlatTruthyArray([])).toEqual([])
    expect(inPlaceFlatTruthyArray([[], []])).toEqual([])
  })

  test('should preserve non-falsy zero-like numbers', () => {
    expect(inPlaceFlatTruthyArray([1, 1.0, -1, -1.0])).toEqual([1, 1.0, -1, -1.0])
  })
})
