import { describe, expect, test } from 'bun:test'
import 'fake-indexeddb/auto'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { newPowerSyncDatabase } from '../../../../powersync/frontend/database'
import { Logger } from '../../logger'
import { p } from '../../parser'
import { isErr, isOk } from '../../result'
import '../../vdom/test-render/happydom'
import { Config, DbConnSql } from '../backend/impl'

// @ts-ignore
if (!globalThis.readAsync) {
  // @ts-ignore
  globalThis.readAsync = async (file) => {
    const fs = require('fs/promises') // Use Node.js's fs.promises
    const path = require('path')
    const resolvedPath = path.resolve(file)
    return fs.readFile(resolvedPath)
  }
}

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
    fileSystem: { t: 'in-memory' },
    logger: Logger({ t: 'noop' }),
  })

  const SHOULD_TEST_POWERSYNC = false
  if (SHOULD_TEST_POWERSYNC) {
    configs.push({
      t: 'powersync',
      powersync: newPowerSyncDatabase({
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

  if (CONFIG_SHARED.IS_INTEGRATION_TEST && typeof CONFIG_BACKEND.DATABASE_URL === 'string') {
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
        sql: `INSERT INTO foo DEFAULT VALUES`,
        vars: {},
      })
      expect(isOk(inserted)).toBe(true)
      const queried = await f.dbConnSql.query({
        parser: p.obj({ id: p.num }),
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
