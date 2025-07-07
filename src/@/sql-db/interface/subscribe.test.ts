import 'fake-indexeddb/auto'
import { FileSystem } from '~/@/file-system'
import { sleep } from '~/@/promise/sleep'
import { describe, expect, test } from '~/@/test-runner'
import { TimeSpan } from '~/@/time/time-span'
import { Logger } from '../../logger'
import { s } from '../../schema'
import { Config, SqlDb } from '../backend/impl'

const Fixture = async (config: Config) => {
  const sqlDb = SqlDb(config)
  return {
    sqlDb,
  }
}

const Fixtures = async () => {
  const configs: Config[] = []

  configs.push({
    t: 'better-sqlite3',
    databasePath: ':memory:',
    logger: Logger({ t: 'noop' }),
    fs: FileSystem({ t: 'node' }),
  })

  configs.push({
    t: 'pglite',
    // logger: Logger({ t: 'console', newLinePerMsg: true, namespace: ['sql-db'], maxLogLevel: 'debug' }),
    logger: Logger({ t: 'noop' }),
  })

  return Promise.all(configs.map(Fixture))
}

const Row = s.obj({ id: s.num() })

type Row = s.Infer<typeof Row>

describe.skip('sql-db subscribe', () => {
  test('subscribe', async () => {
    for (const f of await Fixtures()) {
      await f.sqlDb.query({ schema: s.unknown, sql: `DROP TABLE foo`, vars: {} }).catch(() => {})
      await f.sqlDb.query({
        schema: s.unknown,
        sql: `CREATE TABLE foo (id SERIAL PRIMARY KEY)`,
        vars: {},
      })
      let got: Row[] = []
      const sub = f.sqlDb.sub(
        {
          schema: Row,
          sql: `SELECT id FROM foo`,
          vars: {},
        },
        (x) => x,
      )
      const unsub = sub.sub((rows) => {
        got = rows
      })
      await f.sqlDb.query({
        schema: s.unknown,
        sql: `INSERT INTO foo DEFAULT VALUES`,
        vars: {},
      })
      await sleep(TimeSpan.milliseconds(200))
      expect(got).toEqual([{ id: 1 }])
      unsub()
    }
  })
})
