import { Db } from '~/@/db/impl/impl'
import { IDb } from '~/@/db/interface'
import { Json } from '~/@/json/json'
import { IKeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { isErr, Ok } from '~/@/result'
import { s } from '~/@/schema'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb } from '~/@/sql-db/interface'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../space'
import { SpaceEntity } from './space-entity'
import { UnixMs } from '~/@/time/unix-ms'
import { DbQueryCache } from '~/app/frontend/query-cache/db-query-cache'

export type SpaceDbConfig = {
  t: 'sql-db'
  sqlDb: ISqlDb
  logger: ILogger
  kvDb: IKeyValueDb
  migrationPolicy: ISqlDbMigrationPolicy
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
      policy: config.migrationPolicy,
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
      created_at_unix_ms: (ts) => UnixMs.init(ts),
      updated_at_unix_ms: (ts) => UnixMs.init(ts),
      deleted_at_unix_ms: (ts) => (ts ? UnixMs.init(ts) : null),
      model: (model) => {
        const json = typeof model === 'string' ? Json.parse(model) : Ok(model)
        if (isErr(json)) throw new Error(json.error)
        const space = Space.schema.parse(json.value)
        if (isErr(space)) throw new Error(space.error.entries.map((e) => e.message).join('\n'))
        return space.value
      },
    },
  })
}

const SpaceDbQueryCacheBase = DbQueryCache.init({
  entityType: 'space',
  lastUpdatedAtKey: 'updatedAt',
  primaryKey: 'id',
  entity: SpaceEntity,
  related: s.partialObj({}),
})

// Helper to extract Space from SpaceEntity
const entity = (
  ctx: { queryCache: import('~/app/frontend/query-cache').QueryCache.Model },
  spaceId: SpaceId,
): Space | null => {
  const entity = SpaceDbQueryCacheBase.toEntity(ctx, spaceId)
  return entity?.space ?? null
}

// Helper to read Space[] from query results
const read = (
  ctx: { queryCache: import('~/app/frontend/query-cache').QueryCache.Model },
  query: import('~/@/db/interface/query-input/query-input').QueryInput<SpaceEntity>,
): Space[] => {
  const entities = SpaceDbQueryCacheBase.query(ctx, query)
  return entities.map((e) => e.space)
}

export const SpaceDbQueryCache = {
  ...SpaceDbQueryCacheBase,
  entity,
  read,
  sub: SpaceDbQueryCacheBase.watch,
}
