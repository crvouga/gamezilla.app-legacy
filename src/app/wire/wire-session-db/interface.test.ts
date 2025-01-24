import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { Config, WireSessionDb } from './impl'
import { Logger } from '~/@/logger'
import { describe, expect, test } from 'bun:test'
import { WireSession } from '../wire-session'
import { Ok } from '~/@/result'

const Fixture = async (config: Config) => {
  const wireSessionDb = await WireSessionDb(config)
  return { wireSessionDb }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()
  const logger = Logger({ t: 'noop' })
  const configs: Config[] = [
    {
      t: 'key-value-db',
      keyValueDb: f.keyValueDbHashMap,
      logger,
    },
    {
      t: 'cached-key-value-db',
      keyValueDb: f.keyValueDbHashMap,
      logger,
      pubSubTopicBased: f.pubSubTopicBased,
    },
  ]

  return Promise.all(configs.map(Fixture))
}

describe(import.meta.url, () => {
  test('get by session id', async () => {
    for (const f of await Fixtures()) {
      const wireSession = WireSession.random()
      const before = await f.wireSessionDb.findBySessionIds([wireSession.sessionId])
      const put = await f.wireSessionDb.put([wireSession])
      const after = await f.wireSessionDb.findBySessionIds([wireSession.sessionId])
      expect(before).toEqual(Ok([]))
      expect(put).toEqual(Ok(null))
      expect(after).toEqual(Ok([wireSession]))
    }
  })

  test('get by user id', async () => {
    for (const f of await Fixtures()) {
      const wireSession = WireSession.random()
      const userIds = wireSession.userId ? [wireSession.userId] : []
      const before = await f.wireSessionDb.findByUserIds(userIds)
      const put = await f.wireSessionDb.put([wireSession])
      const after = await f.wireSessionDb.findByUserIds(userIds)
      expect(userIds.length).toBeGreaterThan(0)
      expect(before).toEqual(Ok([]))
      expect(put).toEqual(Ok(null))
      expect(after).toEqual(Ok([wireSession]))
    }
  })
})
