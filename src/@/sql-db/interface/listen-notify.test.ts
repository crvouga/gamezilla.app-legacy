import { describe, expect, test } from 'bun:test'
import 'fake-indexeddb/auto'
import { sleep } from '~/@/promise/sleep'
import { TimeSpan } from '~/@/time/time-span'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { SqlDbNotification } from '.'
import { Logger } from '../../logger'
import { Config, SqlDb } from '../backend/impl'

const Fixture = async (config: Config) => {
  const sqlDb = await SqlDb(config)
  return {
    sqlDb,
  }
}

const Fixtures = async () => {
  const configs: Config[] = []

  const SHOULD_TEST_PGLITE = false
  if (SHOULD_TEST_PGLITE) {
    configs.push({
      t: 'pglite',
      fileSystem: { t: 'in-memory' },
      logger: Logger({ t: 'noop' }),
    })

    configs.push({
      t: 'pglite',
      fileSystem: { t: 'indexed-db', dbName: 'test-gamezilla-app' },
      logger: Logger({ t: 'noop' }),
    })

    const SHOULD_TEST_LOCAL_PG = false
    if (SHOULD_TEST_LOCAL_PG) {
      configs.push({
        t: 'pglite',
        fileSystem: { t: 'file-system', dataDir: './postgres-data' },
        logger: Logger({ t: 'noop' }),
      })
    }
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
