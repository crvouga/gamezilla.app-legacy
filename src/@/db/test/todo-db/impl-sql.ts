import { Db } from '~/@/db/impl/impl'
import { IKeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { ISqlDb } from '~/@/sql-db/interface'
import { ITodoDb } from './interface'

export type ImplSql = {
  t: 'sql-db'
  sqlDb: ISqlDb
  logger: ILogger
  kvDb: IKeyValueDb
}

const UP = [
  `
CREATE TABLE IF NOT EXISTS todo (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL,
    created_at_unix_ms BIGINT NOT NULL,
    updated_at_unix_ms BIGINT NULL,
    deleted_at_unix_ms BIGINT NULL
)
`,
]

const DOWN = [
  `
DROP TABLE IF EXISTS todo
`,
]

const init = (config: ImplSql): ITodoDb => {
  return Db.init({
    t: 'sql-db',
    logger: config.logger,
    interface: ITodoDb.schema,
    sqlDb: config.sqlDb,
    migration: {
      policy: SqlDbMigrationPolicy.init({
        t: 'dangerously-wipe-on-new-schema',
        logger: config.logger,
        kvDb: config.kvDb,
      }),
      up: UP,
      down: DOWN,
    },
    async getRelated() {
      return {}
    },
    viewName: 'todo',
    primaryKey: 'id',
    schema: s.obj({
      id: s.str(),
      title: s.str(),
      completed: s.bool,
      created_at_unix_ms: s.num(),
      updated_at_unix_ms: s.num(),
      deleted_at_unix_ms: s.maybe(s.num()),
    }),
    mapKeyEntityToSql: {
      id: 'id',
      title: 'title',
      completed: 'completed',
      createdAt: 'created_at_unix_ms',
      updatedAt: 'updated_at_unix_ms',
      deletedAt: 'deleted_at_unix_ms',
    },
    mapKeySqlToEntity: {
      id: 'id',
      title: 'title',
      completed: 'completed',
      created_at_unix_ms: 'createdAt',
      updated_at_unix_ms: 'updatedAt',
      deleted_at_unix_ms: 'deletedAt',
    },
    mapValueEntityToSql: {
      id: (id) => id,
      title: (title) => title,
      completed: (completed) => completed,
      createdAt: (createdAt) => createdAt,
      updatedAt: (updatedAt) => updatedAt,
      deletedAt: (deletedAt) => deletedAt,
    },
    mapValueSqlToEntity: {
      id: (id) => id,
      title: (title) => title,
      completed: (completed) => completed,
      created_at_unix_ms: (createdAt) => createdAt,
      updated_at_unix_ms: (updatedAt) => updatedAt,
      deleted_at_unix_ms: (deletedAt) => deletedAt,
    },
  })
}

export const ImplSql = {
  init,
}
