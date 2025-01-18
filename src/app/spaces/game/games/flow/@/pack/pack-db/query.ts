import { p } from '~/@/parser'
import { Pagination } from '~/@/query/query'
import { UserId } from '~/app/@/data/user-id'

const WhereClause = p.partialObj({
  createdBy: p.maybe(
    p.obj({
      equals: UserId,
    }),
  ),
})

export type WhereClause = p.Infer<typeof WhereClause>

const OrderClause = p.partialObj({
  createdAt: p.enumeration(['asc', 'desc']),
  lastUpdatedAt: p.enumeration(['asc', 'desc']),
})

export type OrderClause = p.Infer<typeof OrderClause>

const parser = p.obj({
  pagination: Pagination,
  where: WhereClause,
  order: OrderClause,
})

export type PacksDbQuery = p.Infer<typeof parser>

export const PacksDbQuery = {
  ...parser,
}
