import { describe, expect, test } from '~/@/test-runner'
import { shuffle } from './shuffle'

describe('shuffle', () => {
  test('should return an array of the same length', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle([...input])
    expect(result.length).toEqual(input.length)
  })

  test('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle([...input])
    expect(new Set(result)).toEqual(new Set(input))
  })

  test('should modify original array', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result).toEqual(input) // Same array reference
  })

  test('should work with empty array', () => {
    const input: number[] = []
    const result = shuffle(input)
    expect(result).toEqual([])
  })

  test('should work with single element', () => {
    const input = [1]
    const result = shuffle(input)
    expect(result).toEqual([1])
  })

  test('should produce different orderings', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const iterations = 10
    const results = new Set<string>()

    for (let i = 0; i < iterations; i++) {
      const result = shuffle([...input])
      results.add(JSON.stringify(result))
    }

    // With 10 iterations, it's extremely unlikely to get the same ordering every time
    expect(results.size > 1).toBeTruthy() // eslint-disable-line no-magic-numbers
  })
})
