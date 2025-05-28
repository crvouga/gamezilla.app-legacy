import { describe, expect, test } from 'bun:test'
import 'fake-indexeddb/auto'
import { sleep } from '~/@/promise/sleep'
import { TimeSpan } from '~/@/time/time-span'
import { Logger } from '../../logger'
import { s } from '../../schema'
import { Config, DbConnSql } from '../backend/impl'

const Fixture = async (config: Config) => {
  const dbConnSql = await DbConnSql(config)
  return {
    dbConnSql,
  }
}

const Fixtures = async () => {
  const configs: Config[] = []

  const SHOULD_TEST_IN_MEMORY_PG = true
  if (SHOULD_TEST_IN_MEMORY_PG) {
    configs.push({
      t: 'pglite',
      fileSystem: {
        t: 'in-memory',
      },
      logger: Logger({ t: 'noop' }),
    })
  }

  const SHOULD_TEST_INDEXED_DB_PG = false
  if (SHOULD_TEST_INDEXED_DB_PG) {
    configs.push({
      t: 'pglite',
      fileSystem: {
        t: 'indexed-db',
        dbName: 'test-gamezilla-app',
      },
      logger: Logger({ t: 'noop' }),
    })
  }

  const SHOULD_TEST_LOCAL_PG = false
  if (SHOULD_TEST_LOCAL_PG) {
    configs.push({
      t: 'pglite',
      fileSystem: {
        t: 'file-system',
        dataDir: './postgres-data',
      },
      logger: Logger({ t: 'noop' }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

const Row = s.obj({ id: s.num })

type Row = s.Infer<typeof Row>

describe.skip('db-conn-sql subscribe', () => {
  test('subscribe', async () => {
    for (const f of await Fixtures()) {
      await f.dbConnSql.query({ schema: s.unknown, sql: `DROP TABLE foo`, vars: {} }).catch(() => {})
      await f.dbConnSql.query({
        schema: s.unknown,
        sql: `CREATE TABLE foo (id SERIAL PRIMARY KEY)`,
        vars: {},
      })
      let got: Row[] = []
      const sub = f.dbConnSql.sub({
        schema: Row,
        sql: `SELECT id FROM foo`,
        vars: {},
      })
      const unsub = sub.sub((rows) => {
        got = rows
      })
      await f.dbConnSql.query({
        schema: s.unknown,
        sql: `INSERT INTO foo DEFAULT VALUES`,
        vars: {},
      })
      await sleep(TimeSpan.milliseconds(100))
      expect(got).toEqual([{ id: 1 }])
      unsub()
    }
  })
})
