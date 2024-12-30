import { describe, expect, test } from 'bun:test'
import { AppServerTestEnv } from '../../server-test-env'
import { Config } from './impl'
import { ServerInstanceDb } from './impl-db-conn-kv'
import { ServerInstance } from '../server-instance'
import { Ok, unwrap } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'
import { Posix } from '~/@/time/posix'

const Fixture = (config: Config) => {
  const serverInstanceDb = ServerInstanceDb(config)
  return {
    serverInstanceDb
  }
}

const Fixtures = async () => {
  const f = await AppServerTestEnv()

  const configs: Config[] = [
    {
      t: 'db-conn-kv',
      dbConnKv: f.dbConnKv
    }
  ]

  return configs.map(Fixture)
}

describe(import.meta.file, () => {
  test('put and get', async () => {
    for (const f of await Fixtures()) {
      const serverInstance = ServerInstance.random()
      const before = await f.serverInstanceDb.get(serverInstance.serverInstanceId)
      const put = await f.serverInstanceDb.put(serverInstance)
      const after = await f.serverInstanceDb.get(serverInstance.serverInstanceId)
      expect(before).toEqual(Ok(null))
      expect(put).toEqual(Ok(null))
      expect(after).toEqual(Ok(serverInstance))
    }
  })

  test.todo('list', async () => {
    for (const f of await Fixtures()) {
      const before = await f.serverInstanceDb.list()
      const expected: ServerInstance[] = []
      for (let i = 0; i < 10; i++) {
        const serverInstance = ServerInstance.random()
        expected.push(serverInstance)
        await f.serverInstanceDb.put(serverInstance)
      }
      const after = await f.serverInstanceDb.list()
      expect(unwrap(before)).not.toContainAllValues(expected)
      expect(unwrap(after)).toContainAllValues(expected)
    }
  })

  test.todo('list alive', async () => {
    const MINIMAL_HEART_RATE = TimeSpan.minutes(1.5)
    for (const f of await Fixtures()) {
      const before = await f.serverInstanceDb.list()

      // Alive
      const expected: ServerInstance[] = []
      for (let i = 0; i < 10; i++) {
        const serverInstance = ServerInstance.random({
          startedAt: Posix.past(Posix.now(), TimeSpan.hours(1)),
          lastHeartbeatAt: Posix.past(Posix.now(), TimeSpan.minutes(1))
        })
        expected.push(serverInstance)
        await f.serverInstanceDb.put(serverInstance)
      }

      // Dead
      for (let i = 0; i < 10; i++) {
        await f.serverInstanceDb.put(
          ServerInstance.random({
            startedAt: Posix.past(Posix.now(), TimeSpan.hours(1)),
            lastHeartbeatAt: Posix.past(Posix.now(), TimeSpan.add(MINIMAL_HEART_RATE, TimeSpan.minutes(1)))
          })
        )
      }

      const after = await f.serverInstanceDb.listAlive({
        minimalHeartRate: MINIMAL_HEART_RATE
      })
      expect(unwrap(before)).not.toContainAllValues(expected)
      expect(unwrap(after)).toContainAllValues(expected)
    }
  })
})
