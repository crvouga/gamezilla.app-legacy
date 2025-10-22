import { Db } from '~/@/db/impl/impl'
import { IDb } from '~/@/db/interface'
import { Json } from '~/@/json/json'
import { IKeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { isErr } from '~/@/result'
import { s } from '~/@/schema'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { ISqlDb } from '~/@/sql-db/interface'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../space'
import { SpaceEntity } from './space-entity'

export type SpaceDbConfig = {
  t: 'sql-db'
  sqlDb: ISqlDb
  logger: ILogger
  kvDb: IKeyValueDb
}

const UP = [
  `
CREATE TABLE IF NOT EXISTS space (
  id TEXT PRIMARY KEY,
  created_at_unix_ms BIGINT NOT NULL,
  updated_at_unix_ms BIGINT NOT NULL,
  deleted_at_unix_ms BIGINT,
  model TEXT NOT NULL
)
  `,
]

const DOWN = [
  `
DROP TABLE IF EXISTS space
  `,
]

export const initSpaceDb = (config: SpaceDbConfig): IDb.IDb<SpaceEntity, {}> => {
  return Db.init({
    t: 'sql-db',
    logger: config.logger,
    parser: IDb.schema({
      Entity: SpaceEntity,
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
    viewName: 'space',
    primaryKey: 'id',
    schema: s.obj({
      id: s.str(),
      created_at_unix_ms: s.or(s.num(), s.str()),
      updated_at_unix_ms: s.or(s.num(), s.str()),
      deleted_at_unix_ms: s.maybe(s.or(s.num(), s.str())),
      model: s.or(s.str(), s.json),
    }),
    mapKeyEntityToSql: {
      id: 'id',
      createdAt: 'created_at_unix_ms',
      updatedAt: 'updated_at_unix_ms',
      deletedAt: 'deleted_at_unix_ms',
      space: 'model',
    },
    mapKeySqlToEntity: {
      id: 'id',
      created_at_unix_ms: 'createdAt',
      updated_at_unix_ms: 'updatedAt',
      deleted_at_unix_ms: 'deletedAt',
      model: 'space',
    },
    mapValueEntityToSql: {
      id: (id) => id,
      createdAt: (ts) => ts,
      updatedAt: (ts) => ts,
      deletedAt: (ts) => ts ?? null,
      space: (space) => {
        const stringified = Json.stringify(space)
        if (isErr(stringified)) throw new Error(stringified.error)
        return stringified.value
      },
    },
    mapValueSqlToEntity: {
      id: (id) => id as SpaceId,
      created_at_unix_ms: (ts) => (typeof ts === 'string' ? parseInt(ts) : ts),
      updated_at_unix_ms: (ts) => (typeof ts === 'string' ? parseInt(ts) : ts),
      deleted_at_unix_ms: (ts) => (ts && typeof ts === 'string' ? parseInt(ts) : ts) ?? null,
      model: (model) => {
        const json = typeof model === 'string' ? Json.parse(model) : { ok: true, value: model }
        if (isErr(json)) throw new Error(json.error)
        const space = Space.schema.parse(json.value)
        if (isErr(space)) throw new Error(space.error)
        return space.value
      },
    },
  })
}
