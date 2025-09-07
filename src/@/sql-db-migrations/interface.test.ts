import 'fake-indexeddb/auto'
import { Logger } from '~/@/logger'
import { isOk } from '~/@/result'
import { SecretString } from '~/@/secrets/secret-string'
import { describe, expect, test } from '~/@/test-runner'
import { IS_INTEGRATION_TEST } from '~/@/test/is-integration-test'
import { BackendSqlDb } from '../sql-db/backend-impl'
import { SqlDbMigration } from './impl'

const Fixture = async (config: SqlDbMigration) => {
  const sqlDb = SqlDbMigration.init(config)
  return {
    sqlDb,
  }
}

const Fixtures = async () => {
  const configs: SqlDbMigration[] = []
  const logger = Logger.init({ t: 'console' })

  if (IS_INTEGRATION_TEST) {
    const DATABASE_URL = SecretString.init('DATABASE_URL', process.env.DATABASE_URL)
    if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')
    const sqlDb = BackendSqlDb.init({ t: 'postgres', databaseUrl: DATABASE_URL, logger })
    configs.push({ t: 'dbmate', databaseUrl: DATABASE_URL, logger, sqlDb })
  }

  return Promise.all(configs.map(Fixture))
}

describe('SqlDbMigration', () => {
  test('ok', async () => {
    for (const f of await Fixtures()) {
      const res = await f.sqlDb.up()
      expect(isOk(res)).toBeTruthy()
    }
  })
})
