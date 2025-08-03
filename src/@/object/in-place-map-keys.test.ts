import { describe, expect, test } from '~/@/test-runner'
import { inPlaceMapKeys } from './in-place-map-keys'

describe('inPlaceMapKeys', () => {
  test('maps keys using provided function', () => {
    const obj: Record<string, unknown> = { 'foo-bar': 1, 'baz-qux': 2 }
    inPlaceMapKeys(obj, (key) => String(key).replace(/-/g, ''))
    expect(obj).toEqual({ foobar: 1, bazqux: 2 })
  })

  test('handles empty object', () => {
    const obj: Record<string, unknown> = {}
    inPlaceMapKeys(obj, (key) => key)
    expect(obj).toEqual({})
  })

  test('preserves values while mapping keys', () => {
    const obj: Record<string, unknown> = { first_name: 'John', last_name: 'Doe' }
    inPlaceMapKeys(obj, (key) => key.toUpperCase())
    expect(obj).toEqual({ FIRST_NAME: 'John', LAST_NAME: 'Doe' })
  })

  test('handles key collisions by using last mapped value', () => {
    const obj: Record<string, unknown> = { a: 1, b: 2 }
    inPlaceMapKeys(obj, () => 'x')
    expect(obj).toEqual({ x: 2 })
  })

  test('handles key collisions by using last mapped value', () => {
    const obj: Record<string, unknown> = { a: 1, b: 2 }
    inPlaceMapKeys(obj, (x) => x)
    expect(obj).toEqual({ a: 1, b: 2 })
  })
})
