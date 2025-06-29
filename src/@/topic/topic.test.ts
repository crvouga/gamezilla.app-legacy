import { HttpServer } from '~/@/http-server'
import { Logger } from '~/@/logger'
import { s } from '~/@/schema'
import { describe, expect, test } from '~/@/test-runner'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { Topic } from './index'
import { TopicMsgCodecJson, TopicMsgCodecMsgPack } from './socket/topic-msg-codec'

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
  nestedSomeTopic: {
    params: s.obj({
      id: s.str(),
    }),
    msg: Msg,
  },
})

const Fixture = async () => {
  const port = 1234
  // const logger = Logger({ t: 'console' })
  const logger = Logger({ t: 'noop' })
  const httpServer = HttpServer({ t: 'node', logger })

  const endpoint = '/topic'
  const serverUrl = `http://localhost:${port}`

  const USE_MSG_PACK = true
  const codec = USE_MSG_PACK ? TopicMsgCodecMsgPack : TopicMsgCodecJson

  const server = Topic.initServer({
    t: 'web-sockets',
    httpServer,
    logger: logger.child(['server']),
    contract,
    isProd: false,
    endpoint,
    codec,
  })

  const reconnectionRate = TimeSpan.milliseconds(0)
  const syncSubscriptionRate = TimeSpan.milliseconds(0)

  const clientA = Topic.initClient({
    t: 'web-sockets',
    clientSessionId: ClientSessionId.generate(),
    contract,
    serverUrl,
    endpoint,
    logger: logger.child(['clientA']),
    reconnectionRate,
    syncSubscriptionRate,
    codec,
  })
  const clientB = Topic.initClient({
    t: 'web-sockets',
    clientSessionId: ClientSessionId.generate(),
    contract,
    serverUrl,
    endpoint,
    logger: logger.child(['clientB']),
    reconnectionRate,
    syncSubscriptionRate,
    codec,
  })
  const clientC = Topic.initClient({
    t: 'web-sockets',
    clientSessionId: ClientSessionId.generate(),
    contract,
    serverUrl,
    endpoint,
    logger: logger.child(['clientC']),
    reconnectionRate,
    syncSubscriptionRate,
    codec,
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

const sleep = () => new Promise((resolve) => setTimeout(resolve, 50))

describe('Topic', () => {
  test('should work', async () => {
    using f = await Fixture()
    const gotServer: Msg[] = []
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []

    f.server.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotServer.push(msg))
    await sleep()
    f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientC.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotC.push(msg))
    await sleep()
    f.clientC.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    expect(gotC).toEqual([{ name: 'John' }, { name: 'John' }])
  })

  test('should not receive messages after unsubscribing', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    await sleep()
    const unsub = f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    unsub()
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([])
  })

  test('should not receive messages for different topic params', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    await sleep()
    f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.sub({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([])
  })

  test('should handle multiple messages in sequence', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    await sleep()
    f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'Jane' })
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'Bob' })
    await sleep()
    expect(gotA).toEqual([
      { name: 'John' },
      { name: 'John' },
      { name: 'Jane' },
      { name: 'Jane' },
      { name: 'Bob' },
      { name: 'Bob' },
    ])
  })

  test('should handle multiple subscribers with different topic params', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []

    await sleep()
    f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.sub({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientC.someTopic.sub({ id: '789' }, (x) => x).sub((msg) => gotC.push(msg))
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientB.someTopic.pub({ id: '456' }, { name: 'Jane' })
    await sleep()
    f.clientC.someTopic.pub({ id: '789' }, { name: 'Bob' })
    await sleep()

    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'Jane' }, { name: 'Jane' }])
    expect(gotC).toEqual([{ name: 'Bob' }, { name: 'Bob' }])
  })

  test('should handle unsubscribe correctly', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    const unsubA = f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    await sleep()
    unsubA()
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'Jane' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }, { name: 'Jane' }])
  })

  test('should handle multiple messages on the same topic', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'Jane' })
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'Bob' })
    await sleep()

    expect(gotA).toEqual([
      { name: 'John' },
      { name: 'John' },
      { name: 'Jane' },
      { name: 'Jane' },
      { name: 'Bob' },
      { name: 'Bob' },
    ])
    expect(gotB).toEqual([{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }])
  })

  test('should handle nested topics correctly', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.nestedSomeTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.nestedSomeTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.nestedSomeTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()

    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
  })

  test('should handle multiple unsubscribes correctly', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []

    await sleep()
    const unsubA = f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    const unsubB = f.clientB.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientC.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotC.push(msg))
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    expect(gotC).toEqual([{ name: 'John' }])
    await sleep()
    unsubA()
    await sleep()
    unsubB()
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'Jane' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    expect(gotC).toEqual([{ name: 'John' }, { name: 'Jane' }])
  })

  test('should handle multiple subscriptions to the same topic correctly', async () => {
    using f = await Fixture()
    const gotA1: Msg[] = []
    const gotA2: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA1.push(msg))
    await sleep()
    f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA2.push(msg))
    await sleep()
    f.clientB.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()

    expect(gotA1).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotA2).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
  })

  test('should handle different topic parameters correctly', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.sub({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientA.someTopic.pub({ id: '456' }, { name: 'Jane' })
    await sleep()

    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'Jane' }])
  })

  test('should handle reconnection correctly', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    await sleep()
    await f.httpServer.stop()
    await sleep()
    await f.httpServer.start(f.port)
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'Jane' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }, { name: 'Jane' }, { name: 'Jane' }])
    expect(gotB).toEqual([{ name: 'John' }, { name: 'Jane' }])
  })
})
