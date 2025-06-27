import { describe, expect, test } from 'bun:test'
import 'fake-indexeddb/auto'
import { Logger } from '~/@/logger'
import { sleep } from '~/@/promise/sleep'
import { TimeSpan } from '~/@/time/time-span'
import { CONFIG_BACKEND } from '~/config/backend'
import { s } from '../../schema'
import { Config, SqlDb } from '../backend/impl'

const Fixture = async (config: Config) => {
  const sqlDb = await SqlDb(config)
  return {
    sqlDb,
  }
}

const Fixtures = async () => {
  const configs: Config[] = []

  configs.push({
    t: 'postgres',
    databaseUrl: CONFIG_BACKEND.DATABASE_URL(),
    logger: Logger({ t: 'noop' }),
  })

  return Promise.all(configs.map(Fixture))
}

const Row = s.obj({ id: s.num() })

type Row = s.Infer<typeof Row>

describe('sql-db subscribe', () => {
  test('subscribe', async () => {
    for (const f of await Fixtures()) {
      await f.sqlDb.query({ schema: s.unknown, sql: `DROP TABLE foo`, vars: {} }).catch(() => {})
      await f.sqlDb.query({
        schema: s.unknown,
        sql: `CREATE TABLE foo (id SERIAL PRIMARY KEY)`,
        vars: {},
      })
      let got: Row[] = []
      const sub = f.sqlDb.sub({
        schema: Row,
        sql: `SELECT id FROM foo`,
        vars: {},
      })
      const unsub = sub.sub((rows) => {
        got = rows
      })
      await f.sqlDb.query({
        schema: s.unknown,
        sql: `INSERT INTO foo DEFAULT VALUES`,
        vars: {},
      })
      await sleep(TimeSpan.milliseconds(20))
      expect(got).toEqual([{ id: 1 }])
      unsub()
    }
  })
})
