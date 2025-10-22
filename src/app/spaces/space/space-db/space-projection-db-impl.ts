import { Db } from '~/@/db/impl/impl'
import { IDb } from '~/@/db/interface'
import { IKeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { ISqlDb } from '~/@/sql-db/interface'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpaceProjectionEntity } from './space-projection-entity'

export type SpaceProjectionDbConfig = {
  t: 'sql-db'
  sqlDb: ISqlDb
  logger: ILogger
  kvDb: IKeyValueDb
}

const UP = [
  `
CREATE TABLE IF NOT EXISTS space_projection (
  id TEXT PRIMARY KEY,
  host_user_id TEXT,
  game_id TEXT,
  type TEXT NOT NULL
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
      policy: SqlDbMigrationPolicy.init({
        t: 'always-run',
        logger: config.logger,
      }),
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
    }),
    mapKeyEntityToSql: {
      id: 'id',
      hostId: 'host_user_id',
      gameId: 'game_id',
      type: 'type',
    },
    mapKeySqlToEntity: {
      id: 'id',
      host_user_id: 'hostId',
      game_id: 'gameId',
      type: 'type',
    },
    mapValueEntityToSql: {
      id: (id) => id,
      hostId: (hostId) => hostId ?? null,
      gameId: (gameId) => gameId ?? null,
      type: (type) => type,
    },
    mapValueSqlToEntity: {
      id: (id) => id as SpaceId,
      host_user_id: (hostId) => (hostId ? (hostId as UserId) : null),
      game_id: (gameId) => gameId ?? null,
      type: (type) => type as 'initial' | 'started' | 'ended',
    },
  })
}
