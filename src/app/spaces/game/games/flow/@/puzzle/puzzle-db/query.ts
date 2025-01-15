import { Pagination } from '~/@/query/query'
import { UserId } from '~/app/@/data/user-id'
import type { PuzzleId } from '../puzzle-id'

export type WhereClause = {
  createdBy?: {
    equals: UserId
  }
  puzzleId?: {
    in: PuzzleId[]
  }
}

export type OrderClause = {
  createdAt?: 'asc' | 'desc'
  lastUpdatedAt?: 'asc' | 'desc'
}

export type QueryPuzzlesInput = {
  pagination: Pagination
  where: WhereClause
  order: OrderClause
}

const toKey = (input: QueryPuzzlesInput): string => {
  return [
    'limit',
    input.pagination.limit,
    'offset',
    input.pagination.offset,
    'where.createdBy.equals',
    input.where.createdBy?.equals,
    'where.puzzleId.in',
    input.where.puzzleId?.in,
    'order.createdAt',
    input.order.createdAt,
    'order.lastUpdatedAt',
    input.order.lastUpdatedAt,
  ].join(':')
}

export const QueryPuzzlesInput = {
  toKey,
}
