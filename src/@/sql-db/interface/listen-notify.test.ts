import { describe, expect, test } from 'vitest'
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
