import { describe, expect, test } from '~/@/test-runner'
import { filterObject } from './filter-object'

describe('filterObject', () => {
  test('filters object entries based on predicate', () => {
    const obj: Record<string, number> = { a: 1, b: 2, c: 3 }
    const result = filterObject(obj, ([_, value]) => value > 1)
    expect(result).toEqual({ b: 2, c: 3 })
  })

  test('filters based on key', () => {
    const obj: Record<string, unknown> = { name: 'John', age: 30, admin: true }
    const result = filterObject(obj, ([key]) => key !== 'admin')
    expect(result).toEqual({ name: 'John', age: 30 })
  })

  test('handles empty object', () => {
    const obj: Record<string, unknown> = {}
    const result = filterObject(obj, () => true)
    expect(result).toEqual({})
  })

  test('provides index and array to predicate', () => {
    const obj: Record<string, number> = { a: 1, b: 2, c: 3 }
    const result = filterObject(obj, (_, index, arr) => {
      return index < arr.length - 1 // Filter out last entry
    })
    expect(result).toEqual({ a: 1, b: 2 })
  })

  test('returns empty object when no entries pass predicate', () => {
    const obj: Record<string, number> = { a: 1, b: 2, c: 3 }
    const result = filterObject(obj, () => false)
    expect(result).toEqual({})
  })
})
