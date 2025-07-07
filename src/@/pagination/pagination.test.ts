import { describe, expect, test } from '~/@/test-runner'
import { Pagination } from './pagination'

describe('Pagination', () => {
  describe('nextPage', () => {
    test('should increment offset by limit', () => {
      const pagination = { limit: 10, offset: 0 }
      const next = Pagination.nextPage(pagination)

      expect(next).toEqual({ limit: 10, offset: 10 })
    })

    test('should maintain limit value', () => {
      const pagination = { limit: 5, offset: 15 }
      const next = Pagination.nextPage(pagination)

      expect(next.limit).toEqual(5)
    })
  })

  describe('prevPage', () => {
    test('should decrement offset by limit', () => {
      const pagination = { limit: 10, offset: 20 }
      const prev = Pagination.prevPage(pagination)

      expect(prev).toEqual({ limit: 10, offset: 10 })
    })

    test('should maintain limit value', () => {
      const pagination = { limit: 5, offset: 15 }
      const prev = Pagination.prevPage(pagination)

      expect(prev.limit).toEqual(5)
    })
  })
})
