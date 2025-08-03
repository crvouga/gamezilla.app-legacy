import { describe, expect, test } from '~/@/test-runner'
import { dissoc } from './dissoc'

describe('dissoc', () => {
  test('removes a single key from object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = dissoc(obj, 'b')
    expect(result).toEqual({ a: 1, c: 3 })
    expect(obj).toEqual({ a: 1, b: 2, c: 3 }) // Original unchanged
  })

  test('removes multiple keys from object', () => {
    const obj = { name: 'John', age: 30, admin: true, id: 123 }
    const result = dissoc(obj, 'admin', 'id')
    expect(result).toEqual({ name: 'John', age: 30 })
  })

  test('handles non-existent keys', () => {
    const obj = { a: 1 }
    const result = dissoc(obj, 'b' as keyof typeof obj)
    expect(result).toEqual({ a: 1 })
  })

  test('handles empty object', () => {
    const obj = {}
    const result = dissoc(obj)
    expect(result).toEqual({})
  })

  test('returns new object instance', () => {
    const obj = { a: 1 }
    const result = dissoc(obj, 'a')
    expect(result).not.toEqual(obj)
  })
})
