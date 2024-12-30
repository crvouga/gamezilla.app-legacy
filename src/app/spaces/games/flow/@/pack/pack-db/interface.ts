import type { Task } from '~/@/promise/task'
import type { Paginated, Pagination, UserId } from '~/app/@/data'
import type { Pack } from '../pack'
import type { PackId } from '../pack-id'

export type WhereClause = {
  createdBy?: UserId
}

export type OrderClause = {
  createdAt?: 'asc' | 'desc'
  lastUpdatedAt?: 'asc' | 'desc'
}

export type IPackDb = {
  count: (input: { where: WhereClause }) => Task<string, number>
  list: (input: { pagination: Pagination; where: WhereClause; order: OrderClause }) => Task<string, Paginated<Pack>>
  get: (id: PackId) => Task<string, Pack | null>
  put: (pack: Pack) => Task<string, Pack>
  zap: (input: { id: PackId; deletedBy: UserId }) => Task<string, null>
}
