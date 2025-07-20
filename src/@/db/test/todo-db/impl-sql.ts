import { Db } from '~/@/db/impl/impl'
import { IKeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { ISqlDb } from '~/@/sql-db/interface'
import { ITodoDb } from './interface'

export type TodoDb = {
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
    updated_at_unix_ms BIGINT NULL
)
`,
]

const DOWN = [
  `
DROP TABLE IF EXISTS todo
`,
]

const init = (config: TodoDb): ITodoDb => {
  return Db({
    t: 'sql-db',
    logger: config.logger,
    parser: ITodoDb.schema,
    sqlDb: config.sqlDb,
    migration: {
      policy: SqlDbMigrationPolicy({
        t: 'dangerously-wipe-on-new-schema',
        logger: config.logger,
        kvDb: config.kvDb,
      }),
      up: UP,
      down: DOWN,
    },
    getRelated: async () => ({}),
    viewName: 'todo',
    primaryKey: 'id',
    schema: s.obj({
      id: s.str(),
      title: s.str(),
      completed: s.bool,
      created_at_unix_ms: s.num(),
      updated_at_unix_ms: s.num(),
    }),
    entityKeyToSqlColumn: (key) => {
      switch (key) {
        case 'id':
          return 'id'
        case 'title':
          return 'title'
        case 'completed':
          return 'completed'
        case 'createdAt':
          return 'created_at_unix_ms'
        case 'updatedAt':
          return 'updated_at_unix_ms'
      }
    },
    rowToEntity(row) {
      return {
        id: row.id,
        title: row.title,
        completed: row.completed,
        createdAt: row.created_at_unix_ms,
        updatedAt: row.updated_at_unix_ms,
      }
    },
    entityToRow(entity) {
      return {
        id: entity.id,
        title: entity.title,
        completed: entity.completed,
        created_at_unix_ms: entity.createdAt,
        updated_at_unix_ms: entity.updatedAt,
      }
    },
  })
}

export const TodoDb = {
  init,
}
