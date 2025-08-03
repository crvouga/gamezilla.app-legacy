import { describe, expect, test } from '~/@/test-runner'
import { editDistance } from './edit-distance'

describe('editDistance', () => {
  test('returns 0 for identical strings', () => {
    expect(editDistance('hello', 'hello')).toEqual(0)
  })

  test('returns length of first string when second is empty', () => {
    expect(editDistance('hello', '')).toEqual(5)
  })

  test('returns length of second string when first is empty', () => {
    expect(editDistance('', 'hello')).toEqual(5)
  })

  test('returns 0 for empty strings', () => {
    expect(editDistance('', '')).toEqual(0)
  })

  test('handles single character differences', () => {
    expect(editDistance('cat', 'cut')).toEqual(1)
    expect(editDistance('cat', 'cats')).toEqual(1)
  })

  test('handles multiple character differences', () => {
    expect(editDistance('kitten', 'sitting')).toEqual(3)
    expect(editDistance('sunday', 'saturday')).toEqual(3)
  })

  test('handles completely different strings', () => {
    expect(editDistance('abc', 'xyz')).toEqual(3)
  })

  test('is case sensitive', () => {
    expect(editDistance('hello', 'Hello')).toEqual(1)
  })
})
