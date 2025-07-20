import { s } from '~/@/schema'
import { describe, expect, test } from '~/@/test-runner'
import { TopicBasedPubSub } from './impl'

const Fixture = async (config: TopicBasedPubSub) => {
  const pubSub = TopicBasedPubSub.init(config)
  return {
    ...config,
    pubSub,
  }
}

const MyEvent = s.obj({
  id: s.str(),
  value: s.str(),
})

type MyEvent = s.Infer<typeof MyEvent>

const randomMyEvent = (): MyEvent => ({
  id: Math.random().toString(),
  value: JSON.stringify({
    x: Math.random(),
    y: Math.random(),
  }),
})

const encode = (myEvent: MyEvent) => JSON.stringify(myEvent)

const Fixtures = async () => {
  // const f = await FixtureAppBackend()
  const configs: TopicBasedPubSub[] = [{ t: 'in-memory' }]

  // if (f.t === 'integration') {
  //   configs.push({ t: 'sql-db', sqlDb: f.sqlDbPostgres, logger: Logger.init({ t: 'noop' }) })
  // }

  return Promise.all(configs.map(Fixture))
}

describe('TopicBasedPubSub', () => {
  test('it works', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const topic = Math.random().toString()
      let called = 0
      const sub = async () => {
        called++
      }
      await f.pubSub.sub(topic, sub)
      await f.pubSub.pub(topic, encode(myEvent))
      expect(called).toEqual(1)
    }
  })

  test('not called if not subbed', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const topic = Math.random().toString()
      let called = 0
      const sub = () => {
        called++
      }
      await f.pubSub.pub(topic, encode(myEvent))
      await f.pubSub.sub(topic, sub)
      expect(called).toEqual(0)
    }
  })

  test('unsub', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const topic = Math.random().toString()
      let called = 0
      const unsub = await f.pubSub.sub(topic, () => {
        called++
      })
      expect(called).toEqual(0)
      await f.pubSub.pub(topic, encode(myEvent))
      expect(called).toEqual(1)
      await unsub()
      await f.pubSub.pub(topic, encode(myEvent))
      await f.pubSub.pub(topic, encode(myEvent))
      await f.pubSub.pub(topic, encode(myEvent))
      expect(called).toEqual(1)
    }
  })

  test('unsub by topic', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const topic = Math.random().toString()
      let called1 = 0
      const sub1 = () => {
        called1++
      }
      await f.pubSub.sub(topic, sub1)

      let called2 = 0
      const sub2 = () => {
        called2++
      }
      await f.pubSub.sub(topic, sub2)

      let called3 = 0
      const sub3 = () => {
        called3++
      }
      await f.pubSub.sub(topic, sub3)

      await f.pubSub.unsub(topic)

      await f.pubSub.pub(topic, encode(myEvent))

      expect(called1).toEqual(0)
      expect(called2).toEqual(0)
      expect(called3).toEqual(0)
    }
  })

  test('sub should not be called is pub to other topic', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const topic = Math.random().toString()
      let called = 0
      const sub = () => {
        called++
      }
      for (let i = 0; i < 10; i++) {
        const topic = Math.random().toString()
        await f.pubSub.sub(topic, () => {})
        await f.pubSub.pub(topic, encode(myEvent))
      }
      expect(called).toEqual(0)
      await f.pubSub.sub(topic, sub)
      await f.pubSub.pub(topic, encode(myEvent))
      expect(called).toEqual(1)
    }
  })
})
