import { describe, expect, test } from '~/@/test-runner'
import { minBy } from './min-by'

describe('minBy', () => {
  test('should return undefined for empty array', () => {
    expect(minBy([], (x) => x)).toEqual(undefined)
  })

  test('should return undefined if array contains falsy values', () => {
    expect(minBy([1, null, 2], (x) => x)).toEqual(undefined)
    expect(minBy([1, undefined, 2], (x) => x)).toEqual(undefined)
  })

  test('should find minimum by numeric key', () => {
    const arr = [{ val: 3 }, { val: 1 }, { val: 2 }]
    expect(minBy(arr, (x) => x.val)).toEqual({ val: 1 })
  })

  test('should find minimum by string length', () => {
    const arr = ['cat', 'mouse', 'elephant']
    expect(minBy(arr, (x) => x.length)).toEqual('cat')
  })

  test('should handle array with single element', () => {
    expect(minBy([5], (x) => x)).toEqual(5)
  })

  test('should handle custom comparison keys', () => {
    const arr = [
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 20 },
    ]
    expect(minBy(arr, (x) => x.age)).toEqual({ name: 'Charlie', age: 20 })
  })

  test('should handle negative numbers', () => {
    const arr = [1, -3, 2, -5, 4]
    expect(minBy(arr, (x) => x)).toEqual(-5)
  })
})
