import { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { UserId } from '~/app/@/data/user-id'
import type { Pack } from '../pack'
import type { PackId } from '../pack-id'
import { PackQuery, WhereClause } from './interface-query'

export type IPackDb = {
  count: (input: { where: WhereClause }) => Promise<Result<string, number>>
  list: (input: PackQuery) => Promise<Result<string, Paginated<Pack>>>
  sub: <T>(input: PackQuery, mapper: (m: Pack[]) => T) => Sub<T>
  get: (id: PackId) => Promise<Result<string, Pack | null>>
  put: (pack: Pack) => Promise<Result<string, Pack>>
  zap: (input: { id: PackId; deletedBy: UserId }) => Promise<Result<string, null>>
}
