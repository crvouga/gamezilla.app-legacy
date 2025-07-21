import { s } from '~/@/schema'
import { Pagination } from '~/@/query/query'
import { UserId } from '~/app/@/data/user-id'

const WhereClause = s.partialObj({
  createdBy: s.maybe(
    s.obj({
      equals: UserId,
    }),
  ),
  isOfficial: s.maybe(s.obj({ equals: s.bool })),
})

export type WhereClause = s.Infer<typeof WhereClause>

const OrderClause = s.partialObj({
  createdAt: s.enumeration(['asc', 'desc']),
  lastUpdatedAt: s.enumeration(['asc', 'desc']),
})

export type OrderClause = s.Infer<typeof OrderClause>

const schema = s.obj({
  pagination: Pagination,
  where: WhereClause,
  order: OrderClause,
})

export type PackQuery = s.Infer<typeof schema>

const toKey = (input: PackQuery): string => {
  return [
    'limit',
    input.pagination.limit,
    'offset',
    input.pagination.offset,
    'where.createdBy.equals',
    input.where.createdBy?.equals,
    'order.createdAt',
    input.order.createdAt,
    'order.lastUpdatedAt',
    input.order.lastUpdatedAt,
  ].join(':')
}

export const PackQuery = {
  ...schema,
  toKey,
}
