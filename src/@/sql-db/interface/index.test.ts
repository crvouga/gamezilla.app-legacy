import { describe, expect, test } from 'bun:test'
import 'fake-indexeddb/auto'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { PowerSyncClient } from '../../../service-powersync/client/database'
import { Logger } from '../../logger'
import { isErr, isOk } from '../../result'
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

  const SHOULD_TEST_SQLITE = false

  if (SHOULD_TEST_SQLITE) {
    configs.push({
      t: 'bun-sqlite',
      fileSystem: {
        t: 'in-memory',
      },
      logger: Logger({ t: 'noop' }),
    })
  }

  const SHOULD_TEST_POWERSYNC_CLIENT = false
  if (SHOULD_TEST_POWERSYNC_CLIENT) {
    configs.push({
      t: 'powersync-client',
      powerSyncClient: await PowerSyncClient({
        variant: 'in-memory',
        debug: true,
        powersyncUrl: CONFIG_SHARED.POWERSYNC_URL,
        backendUrl: CONFIG_SHARED.BACKEND_URL,
      }),
      logger: Logger({ t: 'noop' }),
    })
  }

  if (CONFIG_SHARED.IS_INTEGRATION_TEST) {
    configs.push({
      t: 'postgres',
      databaseUrl: CONFIG_BACKEND.DATABASE_URL(),
      logger: Logger({ t: 'noop' }),
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
      expect(isOk(result)).toBe(true)
    }
  })

  test('querying err', async () => {
    for (const f of await Fixtures()) {
      const result = await f.sqlDb.query({
        schema: s.unknown,
        sql: `SELECT foo`,
        vars: {},
      })
      expect(isErr(result)).toBe(true)
    }
  })

  test('create, insert, query, drop', async () => {
    for (const f of await Fixtures()) {
      const created = await f.sqlDb.query({
        schema: s.unknown,
        sql: `CREATE TABLE foo (id SERIAL PRIMARY KEY)`,
        vars: {},
      })
      expect(isOk(created)).toBe(true)
      const inserted = await f.sqlDb.query({
        schema: s.unknown,
        sql: `INSERT INTO foo(id) VALUES (1)`,
        vars: {},
      })
      expect(isOk(inserted)).toBe(true)
      const queried = await f.sqlDb.query({
        schema: s.obj({ id: s.maybe(s.or(s.num(), s.str(), s.bool)) }),
        sql: `SELECT id FROM foo`,
        vars: {},
      })

      expect(isOk(queried)).toBe(true)
      if (isOk(queried)) {
        expect(queried.value).toEqual([{ id: 1 }])
      }
      const dropped = await f.sqlDb.query({
        schema: s.unknown,
        sql: `DROP TABLE foo`,
        vars: {},
      })
      expect(isOk(dropped)).toBe(true)
    }
  })
})
