import { describe, expect, test } from 'bun:test'
import { Config, Stream } from './impl'
import { DbConnKv } from '../db-conn-kv'
import { p } from 'gamezilla-app/@/core/parser'
import { Ok } from 'gamezilla-app/@/core'

const Fixture = async <T>(config: Config<T>) => {
  const stream = await Stream(config)
  return {
    stream
  }
}

const MyEvent = p.obj({
  id: p.str,
  value: p.str
})

type MyEvent = p.Infer<typeof MyEvent>

const randomMyEvent = (): MyEvent => ({
  id: Math.random().toString(),
  value: JSON.stringify({
    x: Math.random(),
    y: Math.random()
  })
})

const Fixtures = async () => {
  const configs: Config<MyEvent>[] = [
    {
      t: 'db-conn-kv',
      dbConnKv: await DbConnKv({
        t: 'hash-map',
        map: new Map()
      }),
      parser: MyEvent
    },
    {
      t: 'in-memory',
      parser: MyEvent
    }
  ]
  return Promise.all(configs.map(Fixture))
}

describe(import.meta.file, () => {
  test('it works', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const streamId = Math.random().toString()
      const before = await f.stream.startingFrom(streamId, null)
      const appended = await f.stream.append(streamId, myEvent)
      const after = await f.stream.startingFrom(streamId, null)
      expect(before).toEqual(Ok([]))
      expect(appended).toEqual(Ok(null))
      expect(after).toEqual(Ok([myEvent]))
    }
  })

  test('starting from', async () => {
    for (const f of await Fixtures()) {
      const myEvent1 = randomMyEvent()
      const myEvent2 = randomMyEvent()
      const streamId = Math.random().toString()
      const appended1 = await f.stream.append(streamId, myEvent1)
      const appended2 = await f.stream.append(streamId, myEvent2)
      const startingFrom1 = await f.stream.startingFrom(streamId, null)
      const startingFrom2 = await f.stream.startingFrom(streamId, myEvent1.id)
      expect(appended1).toEqual(Ok(null))
      expect(appended2).toEqual(Ok(null))
      expect(startingFrom1).toEqual(Ok([myEvent1, myEvent2]))
      expect(startingFrom2).toEqual(Ok([myEvent2]))
    }
  })

  test('starting from non-existent', async () => {
    for (const f of await Fixtures()) {
      const myEvent = randomMyEvent()
      const streamId = Math.random().toString()
      const startingFrom = await f.stream.startingFrom(streamId, myEvent.id)
      expect(startingFrom).toEqual(Ok([]))
    }
  })

  test('streams are independent', async () => {
    for (const f of await Fixtures()) {
      const myEvent1 = randomMyEvent()
      const myEvent2 = randomMyEvent()
      const streamId1 = Math.random().toString()
      const streamId2 = Math.random().toString()
      const appended1 = await f.stream.append(streamId1, myEvent1)
      const appended2 = await f.stream.append(streamId2, myEvent2)
      const startingFrom1 = await f.stream.startingFrom(streamId1, null)
      const startingFrom2 = await f.stream.startingFrom(streamId2, null)
      expect(appended1).toEqual(Ok(null))
      expect(appended2).toEqual(Ok(null))
      expect(startingFrom1).toEqual(Ok([myEvent1]))
      expect(startingFrom2).toEqual(Ok([myEvent2]))
    }
  })

  test('many events', async () => {
    for (const f of await Fixtures()) {
      const myEvents = Array.from({ length: 1000 }, randomMyEvent)
      const streamId = Math.random().toString()
      for (const myEvent of myEvents) {
        await f.stream.append(streamId, myEvent)
      }
      const startingFrom = await f.stream.startingFrom(streamId, null)
      expect(startingFrom).toEqual(Ok(myEvents))
    }
  })
})
