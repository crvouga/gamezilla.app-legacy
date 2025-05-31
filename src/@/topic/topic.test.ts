import { describe, expect, it } from 'bun:test'
import { Topic } from '.'
import { HttpServerBun } from '../http-server/impl-bun'
import { Logger } from '../logger'
import { s } from '../schema'
import { ClientSessionId } from '../wire/client-session-id'

const Msg = s.obj({
  name: s.str,
})
type Msg = s.Infer<typeof Msg>

const childContract = Topic.initContract({
  someTopic: {
    params: s.obj({
      id: s.str,
    }),
    msg: Msg,
  },
})

const contract = Topic.initContract({
  someTopic: {
    params: s.obj({
      id: s.str,
    }),
    msg: Msg,
  },
  child: childContract,
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
    logger,
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
    logger,
  })
  const clientB = Topic.initClient({
    t: 'web-sockets',
    clientSessionId: ClientSessionId.generate(),
    contract,
    serverUrl,
    endpoint,
    logger,
  })
  const clientC = Topic.initClient({
    t: 'web-sockets',
    clientSessionId: ClientSessionId.generate(),
    contract,
    serverUrl,
    endpoint,
    logger,
  })

  await httpServer.start(port)

  return {
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

const sleep = () => new Promise((resolve) => setTimeout(resolve, 5))

describe('Topic', () => {
  it('should work', async () => {
    using f = await Fixture()
    const gotServer: Msg[] = []
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []

    f.server.someTopic.subscribe({ id: '123' }).sub((msg) => gotServer.push(msg))
    f.clientA.someTopic.subscribe({ id: '123' }).sub((msg) => gotA.push(msg))
    f.clientB.someTopic.subscribe({ id: '123' }).sub((msg) => gotB.push(msg))
    f.clientC.someTopic.subscribe({ id: '123' }).sub((msg) => gotC.push(msg))
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
    const unsub = f.clientA.someTopic.subscribe({ id: '123' }).sub((msg) => gotA.push(msg))
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
    f.clientA.someTopic.subscribe({ id: '123' }).sub((msg) => gotA.push(msg))
    f.clientB.someTopic.subscribe({ id: '456' }).sub((msg) => gotB.push(msg))
    await sleep()
    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([])
  })

  it('should handle multiple messages in sequence', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    f.clientA.someTopic.subscribe({ id: '123' }).sub((msg) => gotA.push(msg))
    await sleep()

    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    f.clientA.someTopic.publish({ id: '123' }, { name: 'Jane' })
    f.clientA.someTopic.publish({ id: '123' }, { name: 'Bob' })
    await sleep()

    expect(gotA).toEqual([{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }])
  })

  it('should handle multiple subscribers with different topic params', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []

    f.clientA.someTopic.subscribe({ id: '123' }).sub((msg) => gotA.push(msg))
    f.clientB.someTopic.subscribe({ id: '456' }).sub((msg) => gotB.push(msg))
    f.clientC.someTopic.subscribe({ id: '789' }).sub((msg) => gotC.push(msg))

    await sleep()

    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    f.clientB.someTopic.publish({ id: '456' }, { name: 'Jane' })
    f.clientC.someTopic.publish({ id: '789' }, { name: 'Bob' })

    await sleep()

    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'Jane' }])
    expect(gotC).toEqual([{ name: 'Bob' }])
  })

  it.skip('should handle unsubscribe correctly', async () => {
    using f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []

    const unsubA = f.clientA.someTopic.subscribe({ id: '123' }).sub((msg) => gotA.push(msg))
    f.clientB.someTopic.subscribe({ id: '123' }).sub((msg) => gotB.push(msg))
    await sleep()

    f.clientA.someTopic.publish({ id: '123' }, { name: 'John' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }])

    unsubA()
    await sleep()

    f.clientA.someTopic.publish({ id: '123' }, { name: 'Jane' })
    await sleep()
    expect(gotA).toEqual([{ name: 'John' }])
    expect(gotB).toEqual([{ name: 'John' }, { name: 'Jane' }])
  })
})
