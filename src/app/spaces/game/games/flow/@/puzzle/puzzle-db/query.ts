import { s } from '~/@/schema'
import { Pagination } from '~/@/query/query'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleId } from '../puzzle-id'

export const WhereClause = s.partialObj({
  createdBy: s.maybe(
    s.obj({
      equals: UserId,
    }),
  ),
  puzzleId: s.maybe(
    s.obj({
      in: s.arr(PuzzleId),
    }),
  ),
})

export type WhereClause = s.Infer<typeof WhereClause>

export const OrderClause = s.partialObj({
  createdAt: s.enumeration(['asc', 'desc']),
  lastUpdatedAt: s.enumeration(['asc', 'desc']),
})

export type OrderClause = s.Infer<typeof OrderClause>

const schema = s.obj({
  pagination: Pagination,
  where: WhereClause,
  order: OrderClause,
})

export type PuzzleQuery = s.Infer<typeof schema>

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
  ...schema,
  toKey,
  toOrderField,
  random,
}
