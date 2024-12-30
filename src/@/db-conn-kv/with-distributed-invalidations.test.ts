import { describe, expect, test } from 'bun:test'
import { Ok } from '~/@/result'
import { p } from '~/@/parser'
import { Logger } from '../logger'
import { PubSubTopicBased } from '../pub-sub-topic-based'
import { DbConnKv } from './impl'
import { withNamespace } from './with-namespace'
import { PubSub } from '../pub-sub'
import { PubSubTopicBasedMap } from '../pub-sub-topic-based/impl-in-memory'

const MyEvent = p.obj({
  id: p.str,
  value: p.str
})

type MyEvent = p.Infer<typeof MyEvent>

let runningEventId = 0
const randomMyEvent = (): MyEvent => ({
  id: `event:${String(runningEventId++)}`,
  value: JSON.stringify({
    x: Math.random(),
    y: Math.random()
  })
})

const Fixture = async () => {
  const logger = Logger({ t: 'noop' })

  const pubSubMap: PubSubTopicBasedMap = new Map()
  const sourceMap = new Map<string, MyEvent>()

  const make = async (id: string) => {
    const loggerChild = Logger.prefix(id, logger)
    return withNamespace({
      namespace: ['my-event'],
      parser: MyEvent,
      dbConnKv: await DbConnKv({
        t: 'with-cache',
        source: await DbConnKv({
          t: 'hash-map',
          logger: Logger.prefix('source', logger),
          map: sourceMap
        }),
        logger: loggerChild,
        cache: await DbConnKv({
          t: 'with-distributed-invalidations',
          pubSub: await PubSub({
            t: 'pub-sub-topic-based',
            pubSubTopicBased: await PubSubTopicBased({
              t: 'in-memory',
              map: pubSubMap
            }),
            topic: 'my-event-cache-invalidation'
          }),
          logger: loggerChild,
          cache: await DbConnKv({
            t: 'hash-map',
            map: new Map(),
            logger: loggerChild
          })
        })
      })
    })
  }

  const instanceA = await make('A')
  const instanceB = await make('B')
  const instanceC = await make('C')

  return {
    logger: Logger.prefix('test', logger),
    instanceA,
    instanceB,
    instanceC
  }
}

describe(import.meta.file, () => {
  test('invalidate set', async () => {
    const f = await Fixture()

    const myEvent: MyEvent = randomMyEvent()
    const myEventNew: MyEvent = { id: myEvent.id, value: 'Some new value' }

    await f.instanceA.set(myEvent.id, myEvent)
    const beforeA = await f.instanceA.get(myEvent.id)
    const beforeB = await f.instanceB.get(myEvent.id)
    const beforeC = await f.instanceC.get(myEvent.id)

    expect(beforeA).toEqual(Ok(myEvent))
    expect(beforeB).toEqual(Ok(myEvent))
    expect(beforeC).toEqual(Ok(myEvent))

    await f.instanceA.set(myEvent.id, myEventNew)

    const afterA = await f.instanceA.get(myEvent.id)
    const afterB = await f.instanceB.get(myEvent.id)
    const afterC = await f.instanceC.get(myEvent.id)

    expect(afterA).toEqual(Ok(myEventNew))
    expect(afterB).toEqual(Ok(myEventNew))
    expect(afterC).toEqual(Ok(myEventNew))
  })

  test('invalidate zap', async () => {
    const f = await Fixture()

    const myEvent: MyEvent = randomMyEvent()

    await f.instanceA.set(myEvent.id, myEvent)
    const beforeA = await f.instanceA.get(myEvent.id)
    const beforeB = await f.instanceB.get(myEvent.id)
    const beforeC = await f.instanceC.get(myEvent.id)

    expect(beforeA).toEqual(Ok(myEvent))
    expect(beforeB).toEqual(Ok(myEvent))
    expect(beforeC).toEqual(Ok(myEvent))

    await f.instanceA.zap(myEvent.id)

    const afterA = await f.instanceA.get(myEvent.id)
    const afterB = await f.instanceB.get(myEvent.id)
    const afterC = await f.instanceC.get(myEvent.id)

    expect(afterA).toEqual(Ok(null))
    expect(afterB).toEqual(Ok(null))
    expect(afterC).toEqual(Ok(null))
  })

  test('invalidate setMany', async () => {
    const f = await Fixture()

    const myEvent1: MyEvent = randomMyEvent()
    const myEvent2: MyEvent = randomMyEvent()

    await f.instanceA.set(myEvent1.id, myEvent1)
    await f.instanceA.set(myEvent2.id, myEvent2)

    const beforeA1 = await f.instanceA.get(myEvent1.id)
    const beforeA2 = await f.instanceA.get(myEvent2.id)

    const beforeB1 = await f.instanceB.get(myEvent1.id)
    const beforeB2 = await f.instanceB.get(myEvent2.id)

    const beforeC1 = await f.instanceC.get(myEvent1.id)
    const beforeC2 = await f.instanceC.get(myEvent2.id)

    expect(beforeA1).toEqual(Ok(myEvent1))
    expect(beforeA2).toEqual(Ok(myEvent2))

    expect(beforeB1).toEqual(Ok(myEvent1))
    expect(beforeB2).toEqual(Ok(myEvent2))

    expect(beforeC1).toEqual(Ok(myEvent1))
    expect(beforeC2).toEqual(Ok(myEvent2))

    const myEvent1New: MyEvent = { id: myEvent1.id, value: 'Some new value' }
    const myEvent2New: MyEvent = { id: myEvent2.id, value: 'Some new value' }

    await f.instanceA.setMany([
      [myEvent1.id, myEvent1New],
      [myEvent2.id, myEvent2New]
    ])

    const afterA1 = await f.instanceA.get(myEvent1.id)
    const afterA2 = await f.instanceA.get(myEvent2.id)

    const afterB1 = await f.instanceB.get(myEvent1.id)
    const afterB2 = await f.instanceB.get(myEvent2.id)

    const afterC1 = await f.instanceC.get(myEvent1.id)
    const afterC2 = await f.instanceC.get(myEvent2.id)

    expect(afterA1).toEqual(Ok(myEvent1New))
    expect(afterA2).toEqual(Ok(myEvent2New))

    expect(afterB1).toEqual(Ok(myEvent1New))
    expect(afterB2).toEqual(Ok(myEvent2New))

    expect(afterC1).toEqual(Ok(myEvent1New))
    expect(afterC2).toEqual(Ok(myEvent2New))
  })
})
