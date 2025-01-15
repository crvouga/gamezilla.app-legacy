import { describe, expect, test } from 'bun:test'
import 'fake-indexeddb/auto'
import { Logger } from '../logger'
import { p } from '../parser'
import { Config, DbConnSql } from './backend-impl'

const Fixture = async (config: Config) => {
  const dbConnSql = await DbConnSql(config)
  return {
    dbConnSql,
  }
}

const Fixtures = async () => {
  const configs: Config[] = []

  if (Math.random() > 0.5) {
    configs.push({
      t: 'pglite',
      fileSystem: {
        t: 'in-memory',
      },
      logger: Logger({ t: 'noop' }),
    })
  } else {
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

const Row = p.obj({ id: p.num })

type Row = p.Infer<typeof Row>

describe('db-conn-sql subscribe', () => {
  test('subscribe', async () => {
    for (const f of await Fixtures()) {
      await f.dbConnSql.query(p.unknown, `DROP TABLE foo`, {}).catch(() => {})
      await f.dbConnSql.query(p.unknown, `CREATE TABLE foo (id SERIAL PRIMARY KEY)`, {})
      let got: Row[] = []
      const subscribed = await f.dbConnSql.subscribe(Row, `SELECT id FROM foo`, {}, (rows) => {
        got = rows
      })
      await f.dbConnSql.query(p.unknown, `INSERT INTO foo DEFAULT VALUES`, {})
      await new Promise((r) => setTimeout(r, 1))
      expect(got).toEqual([{ id: 1 }])
      await subscribed.unsubscribe()
    }
  })
})
