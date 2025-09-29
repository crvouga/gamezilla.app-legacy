import { s } from '~/@/schema'
import { UserAccount } from '~/app/@/data/user-account'
import { DbQueryCache } from '~/app/frontend/query-cache/db-query-cache'

export const UserAccountDbQueryCache = DbQueryCache.init({
  entity: UserAccount,
  related: s.partialObj({}),
  entityType: 'user-account',
  lastUpdatedAtKey: 'createdAt',
  primaryKey: 'userId',
})
