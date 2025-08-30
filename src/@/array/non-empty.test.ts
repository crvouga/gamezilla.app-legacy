import { describe, expect, test } from '~/@/test-runner'
import { NonEmpty } from './non-empty'

describe('NonEmpty', () => {
  describe('is', () => {
    test('should return true for non-empty arrays', () => {
      expect(NonEmpty.is([1])).toEqual(true)
      expect(NonEmpty.is([1, 2, 3])).toEqual(true)
    })

    test('should return false for empty arrays', () => {
      expect(NonEmpty.is([])).toEqual(false)
    })
  })

  describe('last', () => {
    test('should return last element of non-empty array', () => {
      expect(NonEmpty.last([1])).toEqual(1)
      expect(NonEmpty.last([1, 2, 3])).toEqual(3)
    })
  })

  describe('map', () => {
    test('should map function over non-empty array', () => {
      const double = (x: number) => x * 2
      expect(NonEmpty.map([1], double)).toEqual([2])
      expect(NonEmpty.map([1, 2, 3], double)).toEqual([2, 4, 6])
    })
  })

  describe('concat', () => {
    test('should concatenate multiple non-empty arrays', () => {
      expect(NonEmpty.concat([1], [2], [3])).toEqual([1, 2, 3])
      expect(NonEmpty.concat([1, 2], [3, 4], [5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('append', () => {
    test('should append element to non-empty array', () => {
      expect(NonEmpty.append(2, [1])).toEqual([1, 2])
      expect(NonEmpty.append(4, [1, 2, 3])).toEqual([1, 2, 3, 4])
    })
  })

  describe('prepend', () => {
    test('should prepend element to non-empty array', () => {
      expect(NonEmpty.prepend(0, [1])).toEqual([0, 1])
      expect(NonEmpty.prepend(0, [1, 2, 3])).toEqual([0, 1, 2, 3])
    })
  })

  describe('assert', () => {
    test('should return array if non-empty', () => {
      expect(NonEmpty.assert([1])).toEqual([1])
      expect(NonEmpty.assert([1, 2, 3])).toEqual([1, 2, 3])
    })

    test('should throw error if array is empty', () => {
      try {
        NonEmpty.assert([])
        expect(true).toEqual(false)
      } catch (error) {
        expect(true).toEqual(true)
      }
    })
  })
})
