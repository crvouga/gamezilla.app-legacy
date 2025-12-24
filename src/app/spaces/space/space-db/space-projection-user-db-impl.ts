import { Db } from '~/@/db/impl/impl'
import { IDb } from '~/@/db/interface'
import { IKeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { ISqlDb } from '~/@/sql-db/interface'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpaceProjectionUserEntity } from './space-projection-user-entity'

export type SpaceProjectionUserDbConfig = {
  t: 'sql-db'
  sqlDb: ISqlDb
  logger: ILogger
  kvDb: IKeyValueDb
}

const UP = [
  `
CREATE TABLE IF NOT EXISTS space_projection_user (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL,
  user_id TEXT NOT NULL
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
    parser: IDb.schema({
      Entity: SpaceProjectionUserEntity,
      Related: s.partialObj({}),
    }),
    sqlDb: config.sqlDb,
    migration: {
      policy: SqlDbMigrationPolicy.init({
        t: 'never-run',
        logger: config.logger,
      }),
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
    }),
    mapKeyEntityToSql: {
      id: 'id',
      spaceId: 'space_id',
      userId: 'user_id',
    },
    mapKeySqlToEntity: {
      id: 'id',
      space_id: 'spaceId',
      user_id: 'userId',
    },
    mapValueEntityToSql: {
      id: (id) => id,
      spaceId: (spaceId) => spaceId,
      userId: (userId) => userId,
    },
    mapValueSqlToEntity: {
      id: (id) => id,
      space_id: (spaceId) => spaceId as SpaceId,
      user_id: (userId) => userId as UserId,
    },
  })
}
