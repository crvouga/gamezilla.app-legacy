import { describe, expect, test } from '~/@/test-runner'
import { PageBasedPagination } from './page-based-pagination'

describe('PageBasedPagination', () => {
  describe('fromPagination', () => {
    test('should convert offset-based pagination to page-based pagination', () => {
      const pagination = { limit: 10, offset: 20 }
      const result = PageBasedPagination.fromPagination(pagination)

      expect(result).toEqual({
        page: 3,
        pageSize: 10,
      })
    })

    test('should handle zero offset', () => {
      const pagination = { limit: 5, offset: 0 }
      const result = PageBasedPagination.fromPagination(pagination)

      expect(result).toEqual({
        page: 1,
        pageSize: 5,
      })
    })
  })

  describe('toPagination', () => {
    test('should convert page-based pagination to offset-based pagination', () => {
      const pageBasedPagination = { page: 3, pageSize: 10 }
      const result = PageBasedPagination.toPagination(pageBasedPagination)

      expect(result).toEqual({
        offset: 20,
        limit: 10,
      })
    })

    test('should handle first page', () => {
      const pageBasedPagination = { page: 1, pageSize: 5 }
      const result = PageBasedPagination.toPagination(pageBasedPagination)

      expect(result).toEqual({
        offset: 0,
        limit: 5,
      })
    })
  })
})
