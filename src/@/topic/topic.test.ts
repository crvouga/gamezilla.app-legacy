import { describe, expect, it } from 'bun:test'
import { Topic } from '.'
import { HttpServerBun } from '../http-server/impl-bun'
import { Logger } from '../logger'
import { s } from '../schema'
import { ClientSessionId } from '../wire/client-session-id'

const Msg = s.obj({
  name: s.str(),
})
type Msg = s.Infer<typeof Msg>

const contract = Topic.initContract({
  someTopic: {
    params: s.obj({
      id: s.str(),
    }),
    msg: Msg,
  },
  nested: Topic.initContract({
    someTopic: {
      params: s.obj({
        id: s.str(),
      }),
      msg: Msg,
    },
  }),
})

const Fixture = async () => {
  const port = 1234
  const logger = Logger({ t: 'console' })
  const httpServer = HttpServerBun({ t: 'bun', logger })

  const endpoint = '/topic'
  const serverUrl = `http://localhost:${port}`

  const server = Topic.initServer({
    t: 'web-sockets',
    httpServer,
    logger: Logger.prefix('server', logger),
    contract,
    isProd: false,
    endpoint,
  })

  const clientA = Topic.initClient({
    t: 'web-sockets',
    clientSessionId: ClientSessionId.generate(),
    contract,
    serverUrl,
    endpoint,
    logger: Logger.prefix('clientA', logger),
  })
  const clientB = Topic.initClient({
    t: 'web-sockets',
    clientSessionId: ClientSessionId.generate(),
    contract,
    serverUrl,
    endpoint,
    logger: Logger.prefix('clientB', logger),
  })
  const clientC = Topic.initClient({
    t: 'web-sockets',
    clientSessionId: ClientSessionId.generate(),
    contract,
    serverUrl,
    endpoint,
    logger: Logger.prefix('clientC', logger),
  })

  await httpServer.start(port)

  return {
    port,
    httpServer,
    contract,
    clientA,
    clientB,
    clientC,
    server,
    [Symbol.dispose]: async () => {
      await httpServer.stop()
    },
  }
}

const sleep = () => new Promise((resolve) => setTimeout(resolve, 100))

describe.only('Topic', () => {
  it('should work', async () => {
    using f = await Fixture()
    const gotServer: Msg[] = []
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []

    f.server.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotServer.push(msg))
    await sleep()
    f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientC.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotC.push(msg))
    await sleep()
    f.clientC.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    expect(gotC).toEqual([{ name: 'John' }])
  })

  it('should not receive messages after unsubscribing', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    await sleep()
    const unsub = f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    unsub()
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([])
  })

  it('should not receive messages for different topic params', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    await sleep()
    f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.subscribe({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([])
  })

  it('should handle multiple messages in sequence', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    await sleep()
    f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'Jane' })
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'Bob' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }])
  })

  it('should handle multiple subscribers with different topic params', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []

    await sleep()
    f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.subscribe({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientC.someTopic.subscribe({ id: '789' }, (x) => x).sub((msg) => gotC.push(msg))
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientB.someTopic.publish({ id: '456' }, { name: 'Jane' })
    await sleep()
    f.clientC.someTopic.publish({ id: '789' }, { name: 'Bob' })
    await sleep()

    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'Jane' }])
    expect(gotC).toEqual([{ name: 'Bob' }])
  })

  it('should handle unsubscribe correctly', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    const unsubA = f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    await sleep()
    unsubA()
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'Jane' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }, { name: 'Jane' }])
  })

  it('should handle multiple messages on the same topic', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'Jane' })
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'Bob' })
    await sleep()

    expect(gotA).toEqual([{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }])
    expect(gotB).toEqual([{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }])
  })

  it('should handle nested topics correctly', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.nested.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.nested.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.nested.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()

    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
  })

  it('should handle multiple unsubscribes correctly', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []

    await sleep()
    const unsubA = f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    const unsubB = f.clientB.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientC.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotC.push(msg))
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    expect(gotC).toEqual([{ name: 'John' }])
    await sleep()
    unsubA()
    await sleep()
    unsubB()
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'Jane' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    expect(gotC).toEqual([{ name: 'John' }, { name: 'Jane' }])
  })

  it('should handle multiple subscriptions to the same topic correctly', async () => {
    using f = await Fixture()
    const gotA1: Msg[] = []
    const gotA2: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA1.push(msg))
    await sleep()
    f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA2.push(msg))
    await sleep()
    f.clientB.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()

    expect(gotA1).toEqual([{ name: 'John' }])
    expect(gotA2).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
  })

  it('should handle different topic parameters correctly', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.subscribe({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientA.someTopic.publish({ id: '456' }, { name: 'Jane' })
    await sleep()

    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'Jane' }])
  })

  it('should handle reconnection correctly', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.subscribe({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    await sleep()
    await f.httpServer.stop()
    await sleep()
    await f.httpServer.start(f.port)
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'Jane' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'Jane' }])
    expect(gotB).toEqual([{ name: 'John' }, { name: 'Jane' }])
  })
})
