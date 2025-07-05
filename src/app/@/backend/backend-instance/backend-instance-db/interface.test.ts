import { describe, expect, test } from '~/@/test-runner'
import { Ok, unwrap } from '~/@/result'
import { UnixMs } from '~/@/time/unix-ms'
import { TimeSpan } from '~/@/time/time-span'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { BackendInstance } from '../backend-instance'
import { Config } from './impl'
import { BackendInstanceDb } from './impl-key-value-db'

const Fixture = (config: Config) => {
  const backendInstanceDb = BackendInstanceDb(config)
  return {
    backendInstanceDb,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()

  const configs: Config[] = [
    {
      t: 'key-value-db',
      keyValueDb: f.keyValueDbHashMap,
    },
  ]

  return configs.map(Fixture)
}

describe('BackendInstanceDb', () => {
  test('put and get', async () => {
    for (const f of await Fixtures()) {
      const backendInstance = BackendInstance.random()
      const before = await f.backendInstanceDb.get(backendInstance.backendInstanceId)
      const put = await f.backendInstanceDb.put(backendInstance)
      const after = await f.backendInstanceDb.get(backendInstance.backendInstanceId)
      expect(before).toEqual(Ok(null))
      expect(put).toEqual(Ok(null))
      expect(after).toEqual(Ok(backendInstance))
    }
  })

  test.skip('list', async () => {
    for (const f of await Fixtures()) {
      const before = await f.backendInstanceDb.list()
      const expected: BackendInstance[] = []
      for (let i = 0; i < 10; i++) {
        const backendInstance = BackendInstance.random()
        expected.push(backendInstance)
        await f.backendInstanceDb.put(backendInstance)
      }
      const after = await f.backendInstanceDb.list()
      expect(unwrap(before).some((b) => expected.some((e) => b.backendInstanceId === e.backendInstanceId))).toEqual(
        false,
      )
      expect(unwrap(after).some((a) => expected.some((e) => a.backendInstanceId === e.backendInstanceId))).toEqual(true)
    }
  })

  test.skip('list alive', async () => {
    const MINIMAL_HEART_RATE = TimeSpan.minutes(1.5)
    for (const f of await Fixtures()) {
      const before = await f.backendInstanceDb.list()

      // Alive
      const expected: BackendInstance[] = []
      for (let i = 0; i < 10; i++) {
        const backendInstance = BackendInstance.random({
          startedAt: UnixMs.past(UnixMs.now(), TimeSpan.hours(1)),
          lastHeartbeatAt: UnixMs.past(UnixMs.now(), TimeSpan.minutes(1)),
        })
        expected.push(backendInstance)
        await f.backendInstanceDb.put(backendInstance)
      }

      // Dead
      for (let i = 0; i < 10; i++) {
        await f.backendInstanceDb.put(
          BackendInstance.random({
            startedAt: UnixMs.past(UnixMs.now(), TimeSpan.hours(1)),
            lastHeartbeatAt: UnixMs.past(UnixMs.now(), TimeSpan.add(MINIMAL_HEART_RATE, TimeSpan.minutes(1))),
          }),
        )
      }

      const after = await f.backendInstanceDb.listAlive({
        minimalHeartRate: MINIMAL_HEART_RATE,
      })
      expect(unwrap(before).some((b) => expected.some((e) => b.backendInstanceId === e.backendInstanceId))).toEqual(
        false,
      )
      expect(unwrap(after).some((a) => expected.some((e) => a.backendInstanceId === e.backendInstanceId))).toEqual(true)
    }
  })
})
