import type { Task } from '~/@/promise/task'
import { Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { UserId } from '~/app/@/data/user-id'
import type { Pack } from '../pack'
import type { PackId } from '../pack-id'
import { PacksDbQuery, WhereClause } from './query'

export type IPackDb = {
  count: (input: { where: WhereClause }) => Task<string, number>
  list: (input: PacksDbQuery) => Task<string, Paginated<Pack>>
  sub: (input: PacksDbQuery) => Sub<Pack[]>
  get: (id: PackId) => Task<string, Pack | null>
  put: (pack: Pack) => Task<string, Pack>
  zap: (input: { id: PackId; deletedBy: UserId }) => Task<string, null>
}
