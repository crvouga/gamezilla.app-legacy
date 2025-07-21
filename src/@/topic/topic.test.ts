import { HttpServer } from '~/@/http-server'
import { ILogger, Logger } from '~/@/logger'
import { s } from '~/@/schema'
import { describe, expect, test } from '~/@/test-runner'
import { TimeSpan } from '~/@/time/time-span'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ascend } from '../array/sorting'
import { TopicBasedPubSub } from '../pub-sub-topic-based'
import { eventually } from '../test/eventually'
import { randomServerPort } from '../test/random-server-port'
import { Url } from '../url/url'
import { TopicClient } from './topic-client/topic-client'
import { TopicContract } from './topic-contract'
import { TopicMsgCodec } from './topic-msg-codec'
import { TopicServer } from './topic-server/topic-server'

const Msg = s.obj({
  id: s.num(),
})
type Msg = s.Infer<typeof Msg>

const sortMsgs = (msgs: Msg[]) => msgs.toSorted(ascend((x) => x.id))

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

  const isSubscribedClientA = <TopicName extends keyof typeof topicContract>(
    topicName: TopicName,
    params: s.Infer<(typeof topicContract)[TopicName]['params']>,
  ) => {
    return topicServer.isSubscribed(topicName, params, (c) => c.clientSessionId === clientA.clientSessionId)
  }

  const isSubscribedClientB = <TopicName extends keyof typeof topicContract>(
    topicName: TopicName,
    params: s.Infer<(typeof topicContract)[TopicName]['params']>,
  ) => {
    return topicServer.isSubscribed(topicName, params, (c) => c.clientSessionId === clientB.clientSessionId)
  }

  const isSubscribedClientC = <TopicName extends keyof typeof topicContract>(
    topicName: TopicName,
    params: s.Infer<(typeof topicContract)[TopicName]['params']>,
  ) => {
    return topicServer.isSubscribed(topicName, params, (c) => c.clientSessionId === clientC.clientSessionId)
  }

  return {
    port,
    httpServer,
    topicContract,
    topicServer,
    clientA,
    clientB,
    clientC,
    isSubscribedClientA,
    isSubscribedClientB,
    isSubscribedClientC,
    async [Symbol.asyncDispose]() {
      await httpServer.stop()
    },
  }
}

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
    f.clientC.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
      expect(gotC).toEqual([{ id: 1 }, { id: 1 }])
    })
  })

  test('should not receive messages after unsubscribing', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const unsub = f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await eventually(() => expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true))
    unsub()
    await eventually(() => expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(false))
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
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
    await eventually(() => expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true))
    await eventually(() => expect(f.isSubscribedClientB('someTopic', { id: '456' })).toEqual(true))
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([])
    })
  })

  test('should handle multiple messages in sequence', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    await eventually(() => expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true))
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 2 })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 3 })
    await eventually(() => {
      expect(sortMsgs(gotA)).toEqual(sortMsgs([{ id: 1 }, { id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }, { id: 3 }]))
    })
  })

  test('should handle multiple subscribers with different topic params', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []

    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    f.clientC.topic.someTopic.sub({ id: '789' }, (x) => x).sub((msg) => gotC.push(msg))

    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '456' })).toEqual(true)
      expect(f.isSubscribedClientC('someTopic', { id: '789' })).toEqual(true)
    })

    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    f.clientB.topic.someTopic.pub({ id: '456' }, { id: 2 })
    f.clientC.topic.someTopic.pub({ id: '789' }, { id: 3 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 2 }, { id: 2 }])
      expect(gotC).toEqual([{ id: 3 }, { id: 3 }])
    })
  })

  test('should handle unsubscribe correctly', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    const unsubA = f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))

    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(true)
    })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
    })
    unsubA()
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(false)
    })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 2 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }, { id: 2 }])
    })
  })

  test('should handle multiple messages on the same topic', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(true)
    })

    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 2 })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 3 })
    await eventually(() => {
      expect(sortMsgs(gotA)).toEqual(sortMsgs([{ id: 1 }, { id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }, { id: 3 }]))
      expect(sortMsgs(gotB)).toEqual(sortMsgs([{ id: 1 }, { id: 2 }, { id: 3 }]))
    })
  })

  test('should handle nested topics correctly', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    f.clientA.topic.nestedSomeTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.nestedSomeTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('nestedSomeTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('nestedSomeTopic', { id: '123' })).toEqual(true)
    })
    f.clientA.topic.nestedSomeTopic.pub({ id: '123' }, { id: 1 })

    await eventually(() => {
      expect(sortMsgs(gotA)).toEqual(sortMsgs([{ id: 1 }, { id: 1 }]))
      expect(sortMsgs(gotB)).toEqual(sortMsgs([{ id: 1 }]))
    })
  })

  test('should handle multiple unsubscribes correctly', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []

    const unsubA = f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    const unsubB = f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    f.clientC.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotC.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientC('someTopic', { id: '123' })).toEqual(true)
    })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
      expect(gotC).toEqual([{ id: 1 }])
    })
    unsubA()
    unsubB()
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(false)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(false)
    })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 2 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
      expect(gotC).toEqual([{ id: 1 }, { id: 2 }])
    })
  })

  test('should handle multiple subscriptions to the same topic correctly', async () => {
    await using f = await Fixture()
    const gotA1: Msg[] = []
    const gotA2: Msg[] = []
    const gotB: Msg[] = []

    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA1.push(msg))
    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA2.push(msg))
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(true)
    })
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA1).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotA2).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
    })
  })

  test('should handle different topic parameters correctly', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '456' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '456' })).toEqual(true)
    })

    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    f.clientA.topic.someTopic.pub({ id: '456' }, { id: 2 })

    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 2 }])
    })
  })

  test('should handle reconnection correctly', async () => {
    await using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    f.clientA.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotA.push(msg))
    f.clientB.topic.someTopic.sub({ id: '123' }, (x) => x).sub((msg) => gotB.push(msg))
    await eventually(() => {
      expect(f.isSubscribedClientA('someTopic', { id: '123' })).toEqual(true)
      expect(f.isSubscribedClientB('someTopic', { id: '123' })).toEqual(true)
    })

    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 1 })
    await eventually(() => {
      expect(gotA).toEqual([{ id: 1 }, { id: 1 }])
      expect(gotB).toEqual([{ id: 1 }])
    })

    await f.httpServer.stop()
    await f.httpServer.start(f.port)
    f.clientA.topic.someTopic.pub({ id: '123' }, { id: 2 })
    await eventually(() => {
      expect(sortMsgs(gotA)).toEqual(sortMsgs([{ id: 1 }, { id: 1 }, { id: 2 }, { id: 2 }]))
      expect(sortMsgs(gotB)).toEqual(sortMsgs([{ id: 1 }, { id: 2 }]))
    })
  })
})
