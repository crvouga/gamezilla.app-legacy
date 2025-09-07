import 'fake-indexeddb/auto'
import { Pglite } from '~/@/pglite/impl'
import { sleep } from '~/@/promise/sleep'
import { SecretString } from '~/@/secrets/secret-string'
import { describe, expect, test } from '~/@/test-runner'
import { TimeSpan } from '~/@/time/time-span'
import { IS_INTEGRATION_TEST } from '~/@/test/is-integration-test'
import { Logger } from '../../logger'
import { BackendSqlDb } from '../backend-impl'
import { SqlDbNotification } from '../interface'

const Fixture = async (config: BackendSqlDb) => {
  const sqlDb = BackendSqlDb.init(config)
  return {
    sqlDb,
  }
}

const Fixtures = async () => {
  const configs: BackendSqlDb[] = []

  const SHOULD_TEST_PGLITE = false
  if (SHOULD_TEST_PGLITE) {
    configs.push({
      t: 'pglite',
      logger: Logger.init({ t: 'console', newLinePerMsg: false, namespace: ['sql-db'], maxLogLevel: 'debug' }),
      pglite: Pglite.init({ t: 'main-thread', config: { t: 'in-memory' } }),
    })
  }

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

describe('sql-db', () => {
  test('listen, notify', async () => {
    for (const f of await Fixtures()) {
      const channel = 'foo'
      const notifications: SqlDbNotification[] = []
      const unlisten = await f.sqlDb.listen(channel, (n) => {
        notifications.push(n)
      })
      await f.sqlDb.notify(channel, 'bar')
      await sleep(TimeSpan.milliseconds(100))
      expect(notifications).toEqual([{ channel, payload: 'bar' }])
      await unlisten()
    }
  })
})
