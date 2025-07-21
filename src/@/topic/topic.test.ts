import { HttpServer } from '~/@/http-server'
import { ILogger, Logger } from '~/@/logger'
import { s } from '~/@/schema'
import { describe, expect, test } from '~/@/test-runner'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { TopicBasedPubSub } from '../pub-sub-topic-based'
import { eventually } from '../test/eventually'
import { randomServerPort } from '../test/random-server-port'
import { Url } from '../url/url'
import { TopicClient } from './topic-client/topic-client'
import { TopicContract } from './topic-contract'
import { TopicMsgCodec } from './topic-msg-codec'
import { TopicServer } from './topic-server/topic-server'

const Msg = s.obj({
  name: s.str(),
})
type Msg = s.Infer<typeof Msg>

const topicContract = TopicContract.init({
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

const RECONNECTION_RATE = TimeSpan.milliseconds(0)
const SYNC_SUBSCRIPTION_RATE = TimeSpan.milliseconds(0)

const Fixture = async () => {
  const port = randomServerPort()
  let logger: ILogger
  logger ??= Logger.init({ t: 'noop' })
  logger ??= Logger.init({ t: 'console', newLinePerMsg: false, namespace: ['test'], maxLogLevel: 'info' })
  const httpServer = HttpServer.init({ t: 'node', logger })

  const endpoint = '/topic'
  const serverUrl = Url.derive(`http://localhost:${port}`, 'http')

  const codec = TopicMsgCodec.init({ t: 'json' })

  const pubSub = TopicBasedPubSub.init({ t: 'in-memory' })

  const topicServer = TopicServer.init({
    t: 'web-sockets',
    httpServer,
    logger: logger.child(['server']),
    contract: topicContract,
    endpoint,
    codec,
    pubSub,
  })

  const initClient = () => {
    const clientSessionId = ClientSessionId.generate()
    const topic = TopicClient.init({
      t: 'web-sockets',
      clientSessionId,
      contract: topicContract,
      serverUrl,
      endpoint,
      logger: logger.child(['clientA']),
      reconnectionRate: RECONNECTION_RATE,
      syncSubscriptionRate: SYNC_SUBSCRIPTION_RATE,
      codec,
    })
    return { topic, clientSessionId }
  }

  const clientA = initClient()
  const clientB = initClient()
  const clientC = initClient()

  await httpServer.start(port)

  return {
    port,
    httpServer,
    topicContract,
    topicServer,
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
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    f.clientC.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotC.push(msg))
    await eventually(() =>
      expect(
        f.topicServer.isSubscribed('someTopic', { id: '123' }, (c) => c.clientSessionId === f.clientA.clientSessionId),
      ).toEqual(true),
    )
    await eventually(() =>
      expect(
        f.topicServer.isSubscribed('someTopic', { id: '123' }, (c) => c.clientSessionId === f.clientB.clientSessionId),
      ).toEqual(true),
    )
    await eventually(() =>
      expect(
        f.topicServer.isSubscribed('someTopic', { id: '123' }, (c) => c.clientSessionId === f.clientC.clientSessionId),
      ).toEqual(true),
    )
    f.clientC.topic.someTopic.pub({ id: '123' }, { name: 'John' })
    await eventually(() => {
      expect(gotA).toEqual([{ name: 'John' }])
      expect(gotB).toEqual([{ name: 'John' }])
      expect(gotC).toEqual([{ name: 'John' }, { name: 'John' }])
    })
  })

  test('should not receive messages after unsubscribing', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const unsub = f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await eventually(() =>
      expect(
        f.topicServer.isSubscribed('someTopic', { id: '123' }, (c) => c.clientSessionId === f.clientA.clientSessionId),
      ).toEqual(true),
    )
    unsub()
    await eventually(() =>
      expect(
        f.topicServer.isSubscribed('someTopic', { id: '123' }, (c) => c.clientSessionId === f.clientA.clientSessionId),
      ).toEqual(false),
    )
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'John' })
    await eventually(() => {
      expect(gotA).toEqual([])
    })
  })

  test('should not receive messages for different topic params', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() =>
      expect(
        f.topicServer.isSubscribed('someTopic', { id: '123' }, (c) => c.clientSessionId === f.clientA.clientSessionId),
      ).toEqual(true),
    )
    await eventually(() =>
      expect(
        f.topicServer.isSubscribed('someTopic', { id: '456' }, (c) => c.clientSessionId === f.clientB.clientSessionId),
      ).toEqual(true),
    )
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'John' })
    await eventually(() => {
      expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
      expect(gotB).toEqual([])
    })
  })

  test('should handle multiple messages in sequence', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    await sleep()
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'Jane' })
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'Bob' })
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
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.topic.someTopic.sub({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientC.topic.someTopic.sub({ id: '789' }, (x) => x).sub((msg) => gotC.push(msg))
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientB.topic.someTopic.pub({ id: '456' }, { name: 'Jane' })
    await sleep()
    f.clientC.topic.someTopic.pub({ id: '789' }, { name: 'Bob' })
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
    const unsubA = f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    await sleep()
    unsubA()
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'Jane' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }, { name: 'Jane' }])
  })

  test('should handle multiple messages on the same topic', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'Jane' })
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'Bob' })
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
    f.clientA.topic.nestedSomeTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.topic.nestedSomeTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.topic.nestedSomeTopic.pub({ id: '123' }, { name: 'John' })
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
    const unsubA = f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    const unsubB = f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientC.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotC.push(msg))
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    expect(gotC).toEqual([{ name: 'John' }])
    await sleep()
    unsubA()
    await sleep()
    unsubB()
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'Jane' })
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
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA1.push(msg))
    await sleep()
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA2.push(msg))
    await sleep()
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'John' })
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
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.topic.someTopic.sub({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '456' }, { name: 'Jane' })
    await sleep()

    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'Jane' }])
  })

  test('should handle reconnection correctly', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    await sleep()
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await sleep()
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])
    await sleep()
    await f.httpServer.stop()
    await sleep()
    await f.httpServer.start(f.port)
    await sleep()
    f.clientA.topic.someTopic.pub({ id: '123' }, { name: 'Jane' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }, { name: 'John' }, { name: 'Jane' }, { name: 'Jane' }])
    expect(gotB).toEqual([{ name: 'John' }, { name: 'Jane' }])
  })
})
