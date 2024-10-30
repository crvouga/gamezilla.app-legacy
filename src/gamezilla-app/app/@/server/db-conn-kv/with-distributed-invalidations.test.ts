import { describe, it } from 'bun:test'
import { PubSubTopicBased } from '../pub-sub-topic-based'
import { DbConnKv } from './impl'
import { Logger } from '../logger'
import { p } from 'gamezilla-app/@/core/parser'

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

const Fixture = async () => {
  const logger = Logger({ t: 'noop' })

  const pubSub = await PubSubTopicBased({
    t: 'in-memory'
  })

  const source = await DbConnKv({ t: 'hash-map' })

  const make = async () => {
    return DbConnKv({
      t: 'with-distributed-invalidations',
      pubSub,
      logger,
      cache: await DbConnKv({
        t: 'with-cache',
        cache: await DbConnKv({ t: 'hash-map' }),
        source,
        logger
      })
    })
  }

  const cacheB = await make()
  const cacheA = await make()
  const cacheC = await make()

  return {
    pubSub,
    cacheA,
    cacheB,
    cacheC
  }
}

const encode = (myEvent: MyEvent) => JSON.stringify(myEvent)

describe(import.meta.file, () => {
  it('works', async () => {
    //
    const f = await Fixture()
  })
})
