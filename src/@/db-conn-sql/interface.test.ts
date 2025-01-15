import { describe, expect, test } from 'bun:test'
import 'fake-indexeddb/auto'
import { DATABASE_URL } from '~/config/backend'
import { IS_INTEGRATION_TEST } from '~/config/shared'
import { Logger } from '../logger'
import { p } from '../parser'
import { isErr, isOk } from '../result'
import { Config, DbConnSql } from './impl'
import { DbConnSqlNotification } from './interface'

const Fixture = async (config: Config) => {
  const dbConnSql = await DbConnSql(config)
  return {
    dbConnSql,
  }
}

const Fixtures = async () => {
  const configs: Config[] = []

  configs.push({
    t: 'pglite',
    dataDir: '', // in memory,
    logger: Logger({ t: 'noop' }),
  })

  configs.push({
    t: 'pglite',
    dataDir: 'idb://test-gamezilla-app',
    logger: Logger({ t: 'noop' }),
  })

  const SHOULD_TEST_LOCAL_PG = false
  if (SHOULD_TEST_LOCAL_PG) {
    configs.push({
      t: 'pglite',
      dataDir: './postgres-data',
      logger: Logger({ t: 'noop' }),
    })
  }

  if (IS_INTEGRATION_TEST) {
    configs.push({
      t: 'postgres',
      databaseUrl: DATABASE_URL,
      logger: Logger({ t: 'noop' }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('db-conn-sql', () => {
  test('querying ok', async () => {
    for (const f of await Fixtures()) {
      const result = await f.dbConnSql.query(p.unknown, `SELECT 1`, {})
      expect(isOk(result)).toBe(true)
    }
  })

  test('querying err', async () => {
    for (const f of await Fixtures()) {
      const result = await f.dbConnSql.query(p.unknown, `SELECT foo`, {})
      expect(isErr(result)).toBe(true)
    }
  })

  test('create, insert, query, drop', async () => {
    for (const f of await Fixtures()) {
      const created = await f.dbConnSql.query(p.unknown, `CREATE TABLE foo (id SERIAL PRIMARY KEY)`, {})
      expect(isOk(created)).toBe(true)
      const inserted = await f.dbConnSql.query(p.unknown, `INSERT INTO foo DEFAULT VALUES`, {})
      expect(isOk(inserted)).toBe(true)
      const queried = await f.dbConnSql.query(p.obj({ id: p.num }), `SELECT id FROM foo`, {})
      expect(isOk(queried)).toBe(true)
      if (isOk(queried)) {
        expect(queried.value).toEqual([{ id: 1 }])
      }
      const dropped = await f.dbConnSql.query(p.unknown, `DROP TABLE foo`, {})
      expect(isOk(dropped)).toBe(true)
    }
  })

  test('listen, notify', async () => {
    for (const f of await Fixtures()) {
      const channel = 'foo'
      const notifications: DbConnSqlNotification[] = []
      const unlisten = await f.dbConnSql.listen(channel, (n) => {
        notifications.push(n)
      })
      await f.dbConnSql.notify(channel, 'bar')
      await new Promise((r) => setTimeout(r, 1))
      expect(notifications).toEqual([{ channel, payload: 'bar' }])
      await unlisten()
    }
  })
})
