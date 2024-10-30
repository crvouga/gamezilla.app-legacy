import { describe, expect, test } from 'bun:test'
import { Ok } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { Logger } from '../logger'
import { PubSubTopicBased } from '../pub-sub-topic-based'
import { DbConnKv } from './impl'
import { withNamespace } from './with-namespace'

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
  const logger = Logger({ t: 'console' })

  const pubSub = await PubSubTopicBased({
    t: 'in-memory'
  })

  const source = await DbConnKv({
    t: 'hash-map',
    logger: Logger.prefix('source', logger)
  })

  const make = async (id: string) => {
    const loggerChild = Logger.prefix(id, logger)
    return withNamespace({
      namespace: ['my-event'],
      parser: MyEvent,
      dbConnKv: await DbConnKv({
        t: 'with-cache',
        source,
        logger: loggerChild,
        cache: await DbConnKv({
          t: 'with-distributed-invalidations',
          pubSub,
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
  // const instanceC = await make('C')

  return {
    pubSub,
    instanceA,
    instanceB
    // instanceC
  }
}

describe.only(import.meta.file, () => {
  test('invalidate set', async () => {
    const f = await Fixture()

    const myEvent: MyEvent = randomMyEvent()
    const myEventNew: MyEvent = { ...randomMyEvent(), id: myEvent.id }

    await f.instanceA.set(myEvent.id, myEvent)

    const beforeA = await f.instanceA.get(myEvent.id)
    const beforeB = await f.instanceB.get(myEvent.id)
    // const beforeC = await f.instanceC.get(myEvent.id)

    await f.instanceA.set(myEvent.id, myEventNew)

    const afterA = await f.instanceA.get(myEvent.id)
    const afterB = await f.instanceB.get(myEvent.id)
    // const afterC = await f.instanceC.get(myEvent.id)

    expect(beforeA).toEqual(Ok(myEvent))
    expect(beforeB).toEqual(Ok(myEvent))
    // expect(beforeC).toEqual(Ok(myEvent))
    expect(afterA).toEqual(Ok(myEventNew))
    expect(afterB).toEqual(Ok(myEventNew))
    // expect(afterC).toEqual(Ok(myEventNew))
  })
})
