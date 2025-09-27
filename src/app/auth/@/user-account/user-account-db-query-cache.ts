import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { Sub } from '~/@/sub'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { QueryCache } from '~/app/frontend/query-cache/query-cache'
import { IUserAccountDb } from './user-account-db/interface'

const ENTITY_TYPE = 'user-account'

const sub = <TMsg>(
  _userAccountDb: IUserAccountDb,
  _query: { userId: UserId },
  _mapper: (m: unknown) => TMsg,
): Sub<TMsg> => {
  return Sub.none()
}

const read = (ctx: { queryCache: QueryCache }, query: { userId: UserId }): UserAccount[] => {
  const queryKey = deterministicJsonStringify(query)
  const results = ctx.queryCache.results[queryKey]
  const entities = results?.map((id) => ctx.queryCache.entities.byType[ENTITY_TYPE]?.byId[id] as UserAccount) ?? []
  return entities
}

const isLoading = (ctx: { queryCache: QueryCache }, query: { userId: UserId }): boolean => {
  const queryKey = deterministicJsonStringify(query)
  return ctx.queryCache.results[queryKey] === undefined
}

const isEmpty = (ctx: { queryCache: QueryCache }, query: { userId: UserId }): boolean => {
  const userAccounts = read(ctx, query)
  return !isLoading(ctx, query) && userAccounts.length === 0
}

const entity = (ctx: { queryCache: QueryCache }, userId: UserId): UserAccount | null => {
  return ctx.queryCache.entities.byType[ENTITY_TYPE]?.byId[userId] as UserAccount | null
}

export const UserAccountDbQueryCache = {
  sub,
  read,
  isLoading,
  isEmpty,
  entity,
}
