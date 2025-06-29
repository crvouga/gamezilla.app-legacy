import { describe, expect, test } from '~/@/test-runner'
import { difference } from './difference'

describe('difference', () => {
  test('should return elements in first array that are not in second array using key function', () => {
    const a = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' },
    ]
    const b = [
      { id: '1', name: 'Alex' },
      { id: '3', name: 'Chuck' },
    ]

    const result = difference(a, b, (x) => x.id)

    expect(result).toEqual([{ id: '2', name: 'Bob' }])
  })

  test('should return all elements when second array is empty', () => {
    const a = ['a', 'b', 'c']
    const b: string[] = []

    const result = difference(a, b, (x) => x)

    expect(result).toEqual(['a', 'b', 'c'])
  })

  test('should return empty array when first array is empty', () => {
    const a: string[] = []
    const b = ['a', 'b', 'c']

    const result = difference(a, b, (x) => x)

    expect(result).toEqual([])
  })

  test('should handle primitive values using identity function', () => {
    const a = ['a1', 'b1', 'c1', 'd1']
    const b = ['a1', 'c1']

    const result = difference(a, b, (x) => x)

    expect(result).toEqual(['b1', 'd1'])
  })
})
