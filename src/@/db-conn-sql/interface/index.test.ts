import { describe, expect, test } from 'bun:test'
import 'fake-indexeddb/auto'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { newPowerSyncDatabase } from '../../../powersync/frontend/database'
import { Logger } from '../../logger'
import { p } from '../../parser'
import { isErr, isOk } from '../../result'
import { Config, DbConnSql } from '../backend/impl'

const Fixture = async (config: Config) => {
  const dbConnSql = await DbConnSql(config)
  return {
    dbConnSql,
  }
}

const Fixtures = async () => {
  const configs: Config[] = []

  configs.push({
    t: 'bun-sqlite',
    fileSystem: {
      t: 'in-memory',
    },
    logger: Logger({ t: 'noop' }),
  })

  const SHOULD_TEST_PGLITE = false
  if (SHOULD_TEST_PGLITE) {
    configs.push({
      t: 'pglite',
      fileSystem: { t: 'in-memory' },
      logger: Logger({ t: 'noop' }),
    })
  }

  const SHOULD_TEST_POWERSYNC = false
  if (SHOULD_TEST_POWERSYNC) {
    configs.push({
      t: 'powersync',
      powersync: await newPowerSyncDatabase({
        dbFilename: ':memory:',
      }),
      logger: Logger({ t: 'noop' }),
    })
  }
  const SHOULD_TEST_LOCAL_PG = false
  if (SHOULD_TEST_LOCAL_PG) {
    configs.push({
      t: 'pglite',
      fileSystem: { t: 'indexed-db', dbName: 'test-gamezilla-app' },
      logger: Logger({ t: 'noop' }),
    })
    configs.push({
      t: 'pglite',
      fileSystem: { t: 'file-system', dataDir: './postgres-data' },
      logger: Logger({ t: 'noop' }),
    })
  }

  if (CONFIG_SHARED.IS_INTEGRATION_TEST) {
    configs.push({
      t: 'postgres',
      databaseUrl: CONFIG_BACKEND.DATABASE_URL,
      logger: Logger({ t: 'noop' }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe('db-conn-sql', () => {
  test('querying ok', async () => {
    for (const f of await Fixtures()) {
      const result = await f.dbConnSql.query({
        parser: p.unknown,
        sql: `SELECT 1`,
        vars: {},
      })
      expect(isOk(result)).toBe(true)
    }
  })

  test('querying err', async () => {
    for (const f of await Fixtures()) {
      const result = await f.dbConnSql.query({
        parser: p.unknown,
        sql: `SELECT foo`,
        vars: {},
      })
      expect(isErr(result)).toBe(true)
    }
  })

  test('create, insert, query, drop', async () => {
    for (const f of await Fixtures()) {
      const created = await f.dbConnSql.query({
        parser: p.unknown,
        sql: `CREATE TABLE foo (id SERIAL PRIMARY KEY)`,
        vars: {},
      })
      expect(isOk(created)).toBe(true)
      const inserted = await f.dbConnSql.query({
        parser: p.unknown,
        sql: `INSERT INTO foo(id) VALUES (1)`,
        vars: {},
      })
      expect(isOk(inserted)).toBe(true)
      const queried = await f.dbConnSql.query({
        parser: p.obj({ id: p.maybe(p.or(p.num, p.str, p.bool)) }),
        sql: `SELECT id FROM foo`,
        vars: {},
      })

      expect(isOk(queried)).toBe(true)
      if (isOk(queried)) {
        expect(queried.value).toEqual([{ id: 1 }])
      }
      const dropped = await f.dbConnSql.query({
        parser: p.unknown,
        sql: `DROP TABLE foo`,
        vars: {},
      })
      expect(isOk(dropped)).toBe(true)
    }
  })
})
