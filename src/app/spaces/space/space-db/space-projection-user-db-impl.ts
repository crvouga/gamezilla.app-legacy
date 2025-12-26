import { Db } from '~/@/db/impl/impl'
import { IDb } from '~/@/db/interface'
import { IKeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb } from '~/@/sql-db/interface'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { UnixMs } from '~/@/time/unix-ms'
import { SpaceProjectionUserEntity } from './space-projection-user-entity'
import { DbQueryCache } from '~/app/frontend/query-cache/db-query-cache'

export type SpaceProjectionUserDbConfig = {
  t: 'sql-db'
  sqlDb: ISqlDb
  logger: ILogger
  kvDb: IKeyValueDb
  migrationPolicy: ISqlDbMigrationPolicy
}

const UP = [
  `
CREATE TABLE IF NOT EXISTS space_projection_user (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  updated_at_unix_ms BIGINT NOT NULL
)
  `,
]

const DOWN = [
  `
DROP TABLE IF EXISTS space_projection_user
  `,
]

export const initSpaceProjectionUserDb = (
  config: SpaceProjectionUserDbConfig,
): IDb.IDb<SpaceProjectionUserEntity, {}> => {
  return Db.init({
    t: 'sql-db',
    logger: config.logger,
    interface: IDb.schema({
      Entity: SpaceProjectionUserEntity,
      Related: s.partialObj({}),
    }),
    sqlDb: config.sqlDb,
    migration: {
      policy: config.migrationPolicy,
      up: UP,
      down: DOWN,
    },
    async getRelated() {
      return {}
    },
    viewName: 'space_projection_user',
    primaryKey: 'id',
    schema: s.obj({
      id: s.str(),
      space_id: s.str(),
      user_id: s.str(),
      updated_at_unix_ms: s.or(s.num(), s.str()),
    }),
    mapKeyEntityToSql: {
      id: 'id',
      spaceId: 'space_id',
      userId: 'user_id',
      updatedAt: 'updated_at_unix_ms',
    },
    mapKeySqlToEntity: {
      id: 'id',
      space_id: 'spaceId',
      user_id: 'userId',
      updated_at_unix_ms: 'updatedAt',
    },
    mapValueEntityToSql: {
      id: (id) => id,
      spaceId: (spaceId) => spaceId,
      userId: (userId) => userId,
      updatedAt: (ts) => ts,
    },
    mapValueSqlToEntity: {
      id: (id) => id,
      space_id: (spaceId) => spaceId as SpaceId,
      user_id: (userId) => userId as UserId,
      updated_at_unix_ms: (ts) => UnixMs.init(ts),
    },
  })
}

export const SpaceProjectionUserDbQueryCache = DbQueryCache.init({
  entityType: 'space-projection-user',
  lastUpdatedAtKey: 'updatedAt',
  primaryKey: 'id',
  entity: SpaceProjectionUserEntity,
  related: s.partialObj({}),
})
