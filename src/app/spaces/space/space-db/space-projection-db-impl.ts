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
import { SpaceProjectionEntity } from './space-projection-entity'
import { DbQueryCache } from '~/app/frontend/query-cache/db-query-cache'

export type SpaceProjectionDbConfig = {
  t: 'sql-db'
  sqlDb: ISqlDb
  logger: ILogger
  kvDb: IKeyValueDb
  migrationPolicy: ISqlDbMigrationPolicy
}

const UP = [
  `
CREATE TABLE IF NOT EXISTS space_projection (
  id TEXT PRIMARY KEY,
  host_user_id TEXT,
  game_id TEXT,
  type TEXT NOT NULL,
  updated_at_unix_ms BIGINT NOT NULL
)
  `,
]

const DOWN = [
  `
DROP TABLE IF EXISTS space_projection
  `,
]

export const initSpaceProjectionDb = (config: SpaceProjectionDbConfig): IDb.IDb<SpaceProjectionEntity, {}> => {
  return Db.init({
    t: 'sql-db',
    logger: config.logger,
    parser: IDb.schema({
      Entity: SpaceProjectionEntity,
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
    viewName: 'space_projection',
    primaryKey: 'id',
    schema: s.obj({
      id: s.str(),
      host_user_id: s.maybe(s.str()),
      game_id: s.maybe(s.str()),
      type: s.str(),
      updated_at_unix_ms: s.or(s.num(), s.str()),
    }),
    mapKeyEntityToSql: {
      id: 'id',
      hostId: 'host_user_id',
      gameId: 'game_id',
      type: 'type',
      updatedAt: 'updated_at_unix_ms',
    },
    mapKeySqlToEntity: {
      id: 'id',
      host_user_id: 'hostId',
      game_id: 'gameId',
      type: 'type',
      updated_at_unix_ms: 'updatedAt',
    },
    mapValueEntityToSql: {
      id: (id) => id,
      hostId: (hostId) => hostId ?? null,
      gameId: (gameId) => gameId ?? null,
      type: (type) => type,
      updatedAt: (ts) => ts,
    },
    mapValueSqlToEntity: {
      id: (id) => id as SpaceId,
      host_user_id: (hostId) => (hostId ? (hostId as UserId) : null),
      game_id: (gameId) => gameId ?? null,
      type: (type) => type as 'initial' | 'started' | 'ended',
      updated_at_unix_ms: (ts) => UnixMs.init(ts),
    },
  })
}

export const SpaceProjectionDbQueryCache = DbQueryCache.init({
  entityType: 'space-projection',
  lastUpdatedAtKey: 'updatedAt',
  primaryKey: 'id',
  entity: SpaceProjectionEntity,
  related: s.partialObj({}),
})
