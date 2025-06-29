import { describe, expect, test } from '~/@/test-runner'
import { Ok, unwrapOr } from '~/@/result'
import { s } from '~/@/schema'
import { NonEmpty } from '../array/non-empty'
import { KeyValueDb } from '../key-value-db'
import { EventId } from './event-id'
import { Config, Stream } from './impl'

const Fixture = async <T>(config: Config<T>) => {
  const stream = await Stream(config)
  return {
    stream,
  }
}

const MyEvent = s.obj({
  id: EventId.schema,
  value: s.str(),
})

type MyEvent = s.Infer<typeof MyEvent>

const randomMyEvent = (prevEvent: MyEvent | null): MyEvent => ({
  id: prevEvent ? EventId.increment(prevEvent.id) : EventId.init(),
  value: JSON.stringify({
    x: Math.floor(Math.random() * 1_000_000),
    y: Math.floor(Math.random() * 1_000_000),
  }),
})

const Fixtures = async () => {
  const configs: Config<MyEvent>[] = [
    {
      t: 'key-value-db',
      keyValueDb: await KeyValueDb({
        t: 'hash-map',
        map: new Map(),
      }),
      schema: MyEvent,
    },
    {
      t: 'in-memory',
      schema: MyEvent,
    },
  ]

  return Promise.all(configs.map(Fixture))
}

const randomStreamId = () => Math.floor(Math.random() * 1_000_000).toString()

describe('Stream', () => {
  test('it works', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent(null)
      const streamId = randomStreamId()
      const before = await f.stream.startingFrom(streamId, EventId.init())
      const appended = await f.stream.append(streamId, myEvent.id, myEvent)
      const after = await f.stream.startingFrom(streamId, EventId.init())
      expect(before).toEqual(Ok([]))
      expect(appended).toEqual(Ok(null))
      expect(after).toEqual(Ok([myEvent]))
    }
  })

  test('starting from', async () => {
    for (const f of await Fixtures()) {
      const myEvent1 = randomMyEvent(null)
      const myEvent2 = randomMyEvent(myEvent1)
      const streamId = randomStreamId()
      const appended1 = await f.stream.append(streamId, myEvent1.id, myEvent1)
      const appended2 = await f.stream.append(streamId, myEvent2.id, myEvent2)
      const startingFrom1 = await f.stream.startingFrom(streamId, EventId.init())
      const startingFrom2 = await f.stream.startingFrom(streamId, myEvent2.id)
      expect(appended1).toEqual(Ok(null))
      expect(appended2).toEqual(Ok(null))
      expect(startingFrom1).toEqual(Ok([myEvent1, myEvent2]))
      expect(startingFrom2).toEqual(Ok([myEvent2]))
    }
  })

  test('starting from non-existent', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent(null)
      const streamId = randomStreamId()
      const startingFrom = await f.stream.startingFrom(streamId, myEvent.id)
      expect(startingFrom).toEqual(Ok([]))
    }
  })

  test('streams are independent', async () => {
    for (const f of await Fixtures()) {
      const myEvent1 = randomMyEvent(null)
      const myEvent2 = randomMyEvent(myEvent1)
      const streamId1 = Math.floor(Math.random() * 1_000_000).toString()
      const streamId2 = Math.floor(Math.random() * 1_000_000).toString()
      const appended1 = await f.stream.append(streamId1, myEvent1.id, myEvent1)
      const appended2 = await f.stream.append(streamId2, myEvent2.id, myEvent2)
      const startingFrom1 = await f.stream.startingFrom(streamId1, EventId.init())
      const startingFrom2 = await f.stream.startingFrom(streamId2, EventId.init())
      expect(appended1).toEqual(Ok(null))
      expect(appended2).toEqual(Ok(null))
      expect(startingFrom1).toEqual(Ok([myEvent1]))
      expect(startingFrom2).toEqual(Ok([myEvent2]))
    }
  })

  test('many events', async () => {
    for (const f of await Fixtures()) {
      const myEvents: NonEmpty<MyEvent> = [randomMyEvent(null)]
      for (let i = 0; i < 10; i++) {
        myEvents.push(randomMyEvent(NonEmpty.last(myEvents)))
      }
      const streamId = randomStreamId()
      for (const myEvent of myEvents) {
        await f.stream.append(streamId, myEvent.id, myEvent)
      }
      const startingFrom = await f.stream.startingFrom(streamId, EventId.init())
      expect(startingFrom).toEqual(Ok(myEvents))
    }
  })

  test('error if duplicate events', async () => {
    for (const f of await Fixtures()) {
      const myEvent1 = randomMyEvent(null)
      const duplicateEvent: MyEvent = { ...myEvent1, value: 'duplicate value' }
      const streamId = randomStreamId()

      const appended1 = await f.stream.append(streamId, myEvent1.id, myEvent1)
      const appendedDuplicate = await f.stream.append(streamId, duplicateEvent.id, duplicateEvent)

      const eventsAfterDuplicate = await f.stream.startingFrom(streamId, EventId.init())

      expect(appended1).toEqual(Ok(null))
      expect(appendedDuplicate.t).toEqual('err')
      expect(unwrapOr(eventsAfterDuplicate, []).length).toEqual(1)
      expect(eventsAfterDuplicate).toEqual(Ok([myEvent1]))
    }
  })

  test('has event', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent(null)
      const streamId = randomStreamId()
      const appended = await f.stream.append(streamId, myEvent.id, myEvent)
      const hasEvent = await f.stream.has(streamId, myEvent.id)
      expect(appended).toEqual(Ok(null))
      expect(hasEvent).toEqual(Ok(true))
    }
  })
})
