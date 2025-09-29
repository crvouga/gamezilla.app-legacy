import { s } from '~/@/schema'
import { DbQueryCache } from '~/app/frontend/query-cache/db-query-cache'
import { UserSession } from './user-session'

export const UserSessionDbQueryCache = DbQueryCache.init({
  entity: UserSession,
  related: s.partialObj({}),
  entityType: 'user-session',
  lastUpdatedAtKey: 'createdAt',
  primaryKey: 'userSessionId',
})
