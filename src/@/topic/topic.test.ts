import { describe, expect, it } from 'bun:test'
import { Topic } from '.'
import { HttpServerBun } from '../http-server/impl-bun'
import { Logger } from '../logger'
import { s } from '../schema'
import { ClientSessionId } from '../wire/client-session-id'
import { SessionId } from '../wire/session-id'

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

  Topic.initServer({
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
    sessionId: SessionId.generate(),
    contract,
    serverUrl,
    endpoint,
    logger,
  })
  const clientB = Topic.initClient({
    t: 'web-sockets',
    clientSessionId: ClientSessionId.generate(),
    sessionId: SessionId.generate(),
    contract,
    serverUrl,
    endpoint,
    logger,
  })
  const clientC = Topic.initClient({
    t: 'web-sockets',
    clientSessionId: ClientSessionId.generate(),
    sessionId: SessionId.generate(),
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
  }
}

describe.only('Topic', () => {
  it('should work', async () => {
    const f = await Fixture()
    const gotA: Msg[] = []
    const gotB: Msg[] = []
    const gotC: Msg[] = []
    //
    f.clientA.someTopic.subscribe({ id: '123' }).sub((msg) => gotA.push(msg))
    f.clientB.someTopic.subscribe({ id: '123' }).sub((msg) => gotB.push(msg))
    f.clientC.someTopic.subscribe({ id: '123' }).sub((msg) => gotC.push(msg))
    //
    f.clientC.someTopic.publish({ id: '123' }, { name: 'John' })

    await new Promise((resolve) => setTimeout(resolve, 2000))
    // expect(gotA).toEqual([{ name: 'John' }])
    // expect(gotB).toEqual([{ name: 'John' }])
    // expect(gotC).toEqual([{ name: 'John' }])
  })
})
