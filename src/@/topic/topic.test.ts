import { HttpServer } from '~/@/http-server'
import { ILogger, Logger } from '~/@/logger'
import { s } from '~/@/schema'
import { describe, expect, test } from '~/@/test-runner'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { TopicBasedPubSub } from '../pub-sub-topic-based'
import { randomServerPort } from '../test/random-server-port'
import { Url } from '../url/url'
import { TopicClient } from './topic-client/topic-client'
import { TopicContract } from './topic-contract'
import { TopicMsgCodecJson } from './topic-msg-codec'
import { TopicServer } from './topic-server'

const Msg = s.obj({
  name: s.str(),
})
type Msg = s.Infer<typeof Msg>

const contract = TopicContract.init({
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
  const port = randomServerPort()
  let logger: ILogger
  logger ??= Logger.init({ t: 'noop' })
  logger ??= Logger.init({ t: 'console', newLinePerMsg: false, namespace: ['test'], maxLogLevel: 'info' })
  const httpServer = HttpServer.init({ t: 'node', logger })

  const endpoint = '/topic'
  const serverUrl = Url.derive(`http://localhost:${port}`)

  const codec = TopicMsgCodecJson

  const pubSub = TopicBasedPubSub.init({ t: 'in-memory' })

  const server = TopicServer.init({
    t: 'web-sockets',
    httpServer,
    logger: logger.child(['server']),
    contract,
    endpoint,
    codec,
    pubSub,
  })

  const reconnectionRate = TimeSpan.milliseconds(0)
  const syncSubscriptionRate = TimeSpan.milliseconds(0)

  const clientSessionIdA = ClientSessionId.generate()
  const clientSessionIdB = ClientSessionId.generate()
  const clientSessionIdC = ClientSessionId.generate()

  const clientA = TopicClient.init({
    t: 'web-sockets',
    clientSessionId: clientSessionIdA,
    contract,
    serverUrl,
    endpoint,
    logger: logger.child(['clientA']),
    reconnectionRate,
    syncSubscriptionRate,
    codec,
  })

  const clientB = TopicClient.init({
    t: 'web-sockets',
    clientSessionId: clientSessionIdB,
    contract,
    serverUrl,
    endpoint,
    logger: logger.child(['clientB']),
    reconnectionRate,
    syncSubscriptionRate,
    codec,
  })

  const clientC = TopicClient.init({
    t: 'web-sockets',
    clientSessionId: clientSessionIdC,
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
    server,
    clientA,
    clientB,
    clientC,

    async [Symbol.asyncDispose]() {
      await httpServer.stop()
    },
  }
}

const sleep = () => new Promise((resolve) => setTimeout(resolve, 200))

describe('Topic', () => {
  test('should work', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []
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
    await using f = await Fixture()
    const gotA: Msg[] = []

    const unsub = f.clientA.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    unsub()
    await sleep()
    f.clientA.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([])
  })

  test('should not receive messages for different topic params', async () => {
    await using f = await Fixture()
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
    await using f = await Fixture()
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
    await sleep()
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
    await using f = await Fixture()
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
    await using f = await Fixture()
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
    await using f = await Fixture()
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
    await using f = await Fixture()
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
    await using f = await Fixture()
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
    await using f = await Fixture()
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
    await using f = await Fixture()
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
    await using f = await Fixture()
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
