import 'fake-indexeddb/auto'
import { FileSystem } from '~/@/file-system'
import { PgliteInstance } from '~/@/pglite/pglite-instance'
import { SecretString } from '~/@/secrets/secret-string'
import { describe, expect, test } from '~/@/test-runner'
import { IS_INTEGRATION_TEST } from '~/app/@/test/is-integration-test'
import { Logger } from '../../logger'
import { isErr, isOk } from '../../result'
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

  const SHOULD_TEST_SQLITE = true

  if (SHOULD_TEST_SQLITE) {
    configs.push({
      t: 'better-sqlite3',
      databasePath: ':memory:',
      logger: Logger.init({ t: 'noop' }),
      fs: FileSystem({ t: 'node' }),
    })
  }

  const pglite = PgliteInstance({ t: 'in-memory' })

  configs.push({
    t: 'pglite',
    logger: Logger.init({ t: 'noop' }),
    pglite,
  })

  const DATABASE_URL = SecretString.init('DATABASE_URL', process.env.DATABASE_URL)
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')

  if (IS_INTEGRATION_TEST) {
    configs.push({
      t: 'postgres',
      databaseUrl: DATABASE_URL,
      logger: Logger.init({ t: 'noop' }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('SqlDb', () => {
  test('querying ok', async () => {
    for (const f of await Fixtures()) {
      const result = await f.sqlDb.query({
        schema: s.unknown,
        sql: `SELECT 1`,
        vars: {},
      })
      expect(isOk(result)).toEqual(true)
    }
  })

  test('querying err', async () => {
    for (const f of await Fixtures()) {
      const result = await f.sqlDb.query({
        schema: s.unknown,
        sql: `SELECT foo`,
        vars: {},
      })
      expect(isErr(result)).toEqual(true)
    }
  })

  test('create, insert, query, drop', async () => {
    for (const f of await Fixtures()) {
      await f.sqlDb.query({
        schema: s.unknown,
        sql: `DROP TABLE foo`,
        vars: {},
      })
      const created = await f.sqlDb.query({
        schema: s.unknown,
        sql: `CREATE TABLE IF NOT EXISTS foo (id SERIAL PRIMARY KEY)`,
        vars: {},
      })
      expect(isOk(created)).toEqual(true)
      const id = 1
      const inserted = await f.sqlDb.query({
        schema: s.unknown,
        sql: `INSERT INTO foo(id) VALUES (:id)`,
        vars: { id },
      })
      expect(isOk(inserted)).toEqual(true)
      const queried = await f.sqlDb.query({
        schema: s.obj({ id: s.maybe(s.or(s.num(), s.str(), s.bool)) }),
        sql: `SELECT id FROM foo WHERE id = :id`,
        vars: { id },
      })

      expect(isOk(queried)).toEqual(true)
      if (isOk(queried)) {
        expect(queried.value).toEqual([{ id }])
      }
      const dropped = await f.sqlDb.query({
        schema: s.unknown,
        sql: `DROP TABLE foo`,
        vars: {},
      })
      expect(isOk(dropped)).toEqual(true)
    }
  })
})
