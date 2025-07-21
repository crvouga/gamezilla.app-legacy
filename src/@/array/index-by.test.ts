import { describe, expect, test } from '~/@/test-runner'
import { indexBy } from './index-by'

describe('indexBy', () => {
  test('should create object mapping from array using key function', () => {
    const users = [
      { id: 'user1', name: 'Alice' },
      { id: 'user2', name: 'Bob' },
    ]

    const result = indexBy(users, (user) => user.id)

    expect(result).toEqual({
      user1: { id: 'user1', name: 'Alice' },
      user2: { id: 'user2', name: 'Bob' },
    })
  })

  test('should handle empty array', () => {
    const emptyArray: Array<{ id: string; name: string }> = []

    const result = indexBy(emptyArray, (item) => item.id)

    expect(result).toEqual({})
  })

  test('should overwrite duplicate keys with latest value', () => {
    const users = [
      { id: 'user1', name: 'Alice' },
      { id: 'user1', name: 'Alex' },
    ]

    const result = indexBy(users, (user) => user.id)

    expect(result).toEqual({
      user1: { id: 'user1', name: 'Alex' },
    })
  })

  test('should handle primitive values using identity function', () => {
    const items = ['a', 'b', 'c']

    const result = indexBy(items, (x) => x)

    expect(result).toEqual({
      a: 'a',
      b: 'b',
      c: 'c',
    })
  })
})
