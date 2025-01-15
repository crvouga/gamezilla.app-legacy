import { describe, expect, mock, test } from 'bun:test'
import { p } from '~/@/parser'
import { CONFIG_BACKEND } from '~/config/backend'
import { AppBackendTestEnv } from '../../app/@/backend/fixture'
import { Logger } from '../logger'
import { Config, PubSubTopicBased } from './impl'

const Fixture = async (config: Config) => {
  const pubSub = await PubSubTopicBased(config)
  return {
    ...config,
    pubSub,
  }
}

const MyEvent = p.obj({
  id: p.str,
  value: p.str,
})

type MyEvent = p.Infer<typeof MyEvent>

const randomMyEvent = (): MyEvent => ({
  id: Math.random().toString(),
  value: JSON.stringify({
    x: Math.random(),
    y: Math.random(),
  }),
})

const encode = (myEvent: MyEvent) => JSON.stringify(myEvent)

const Fixtures = async () => {
  const testEnv = await AppBackendTestEnv()
  const configs: Config[] = [{ t: 'in-memory', map: new Map() }]

  if (testEnv.t === 'integration') {
    configs.push({ t: 'postgres', dbConnSql: testEnv.dbConnSql, logger: Logger({ t: 'noop' }) })
    configs.push({ t: 'redis', redisUrl: CONFIG_BACKEND.REDIS_URL, logger: Logger({ t: 'noop' }) })
  }

  return Promise.all(configs.map(Fixture))
}

describe(import.meta.file, () => {
  test('it works', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const topic = Math.random().toString()
      const sub = mock(() => {})
      await f.pubSub.sub(topic, sub)
      await f.pubSub.pub(topic, encode(myEvent))
      expect(sub).toHaveBeenCalledTimes(1)
    }
  })

  test('not called if not subbed', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const topic = Math.random().toString()
      const sub = mock(() => {})
      await f.pubSub.pub(topic, encode(myEvent))
      await f.pubSub.sub(topic, sub)
      expect(sub).toHaveBeenCalledTimes(0)
    }
  })

  test('unsub', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const topic = Math.random().toString()
      const sub = mock(() => {})
      const unsub = await f.pubSub.sub(topic, sub)
      expect(sub).toHaveBeenCalledTimes(0)
      await f.pubSub.pub(topic, encode(myEvent))
      expect(sub).toHaveBeenCalledTimes(1)
      await unsub()
      await f.pubSub.pub(topic, encode(myEvent))
      await f.pubSub.pub(topic, encode(myEvent))
      await f.pubSub.pub(topic, encode(myEvent))
      expect(sub).toHaveBeenCalledTimes(1)
    }
  })

  test('unsub by topic', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const topic = Math.random().toString()

      const sub1 = mock(() => {})
      await f.pubSub.sub(topic, sub1)

      const sub2 = mock(() => {})
      await f.pubSub.sub(topic, sub2)

      const sub3 = mock(() => {})
      await f.pubSub.sub(topic, sub3)

      await f.pubSub.unsub(topic)

      await f.pubSub.pub(topic, encode(myEvent))

      expect(sub1).toHaveBeenCalledTimes(0)
      expect(sub2).toHaveBeenCalledTimes(0)
      expect(sub3).toHaveBeenCalledTimes(0)
    }
  })

  test('sub should not be called is pub to other topic', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const topic = Math.random().toString()
      const sub = mock(() => {})
      for (let i = 0; i < 10; i++) {
        const topic = Math.random().toString()
        await f.pubSub.sub(topic, () => {})
        await f.pubSub.pub(topic, encode(myEvent))
      }
      expect(sub).toHaveBeenCalledTimes(0)
      await f.pubSub.sub(topic, sub)
      await f.pubSub.pub(topic, encode(myEvent))
      expect(sub).toHaveBeenCalledTimes(1)
    }
  })
})
