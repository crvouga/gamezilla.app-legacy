import { p } from '~/@/parser'
import { Pagination } from '~/@/query/query'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleId } from '../puzzle-id'

export const WhereClause = p.partialObj({
  createdBy: p.maybe(
    p.obj({
      equals: UserId,
    }),
  ),
  puzzleId: p.maybe(
    p.obj({
      in: p.arr(PuzzleId),
    }),
  ),
})

export type WhereClause = p.Infer<typeof WhereClause>

export const OrderClause = p.partialObj({
  createdAt: p.enumeration(['asc', 'desc']),
  lastUpdatedAt: p.enumeration(['asc', 'desc']),
})

export type OrderClause = p.Infer<typeof OrderClause>

const parser = p.obj({
  pagination: Pagination,
  where: WhereClause,
  order: OrderClause,
})

export type PuzzleQuery = p.Infer<typeof parser>

const toKey = (input: PuzzleQuery): string => {
  return [
    'limit',
    input.pagination.limit,
    'offset',
    input.pagination.offset,
    'where.createdBy.equals',
    input.where.createdBy?.equals,
    'where.puzzleId.in',
    input.where.puzzleId?.in.join(','),
    'order.createdAt',
    input.order.createdAt,
    'order.lastUpdatedAt',
    input.order.lastUpdatedAt,
  ].join(':')
}

const random = (): PuzzleQuery => {
  return {
    order: {
      createdAt: 'asc',
    },
    pagination: {
      limit: 10,
      offset: 0,
    },
    where: {
      createdBy: {
        equals: UserId.generate(),
      },
    },
  }
}

const toOrderField = (input: PuzzleQuery): keyof PuzzleQuery['order'] | null => {
  if (input.order.createdAt) {
    return 'createdAt'
  }
  if (input.order.lastUpdatedAt) {
    return 'lastUpdatedAt'
  }
  return null
}

export const PuzzleQuery = {
  ...parser,
  toKey,
  toOrderField,
  random,
}
