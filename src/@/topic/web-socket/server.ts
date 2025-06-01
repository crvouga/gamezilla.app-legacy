import { ServerWebSocket } from 'bun'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { ILogger, Logger } from '~/@/logger'
import { s } from '~/@/schema'
import { PubSub, Sub } from '~/@/sub'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { Client, ClientNode, ContractBase, MsgMeta } from '../types'
import { ToClientMsg, ToClientMsgMany, ToClientMsgOne, toTopicString } from './shared'

export type BackendWebSocketData = {
  clientId: ClientId
  sessionId: SessionId
  clientSessionId: ClientSessionId
}

type Config<TContract extends ContractBase> = {
  t: 'web-sockets'
  contract: TContract
  httpServer: HttpServerBun
  logger: ILogger
  isProd: boolean
  endpoint: string
}

export const initServer = <TContract extends ContractBase>(config: Config<TContract>): Client<TContract> => {
  const serverCore = initServerCore(config)

  const client = Object.entries(config.contract)
    .map(([topicName, topic]) => {
      const clientNode: ClientNode<TContract, typeof topicName> = {
        publish: (topicParams, msg) => {
          const topicString = toTopicString(topicName, topicParams)
          serverCore.publish(topicString, ['pub', topicString, msg], null)
        },
        subscribe: (topicParams, mapper) => {
          const topicString = toTopicString(topicName, topicParams)

          const existing = serverCore.activeSubscriptions.get(topicString)

          if (existing) return existing

          const pubSub = Sub.create<s.Infer<typeof topic.msg> & MsgMeta>()

          const pubSubMapped: PubSub<any> = {
            ...pubSub,
            sub: (subscriber) => {
              const unsub = pubSub.sub((msg) => subscriber(mapper(msg)))
              return () => {
                unsub()
              }
            },
          }

          serverCore.activeSubscriptions.set(topicString, pubSubMapped)

          return pubSubMapped
        },
      }
      return [topicName, clientNode] as const
    })
    .reduce((acc, [topicName, topic]) => {
      acc[topicName as keyof TContract] = topic
      return acc
    }, {} as Client<TContract>)

  return client
}

const initServerCore = <TContract extends ContractBase>(config: Config<TContract>) => {
  const logger = Logger.prefix('server', config.logger)

  let bunServer: Bun.Server
  const activeSubscriptions = new Map<string, PubSub<any>>()

  const send = (payload: ToClientMsgOne, ws: ServerWebSocket<BackendWebSocketData>) => {
    const payloadString = JSON.stringify(payload)

    ws.send(payloadString)
  }

  const publish = (topicString: string, payload: ToClientMsgMany, ws: ServerWebSocket<BackendWebSocketData> | null) => {
    const payloadString = JSON.stringify(payload)

    const subscriberCount = bunServer.subscriberCount(topicString)

    logger.debug(`publishing to topic=${topicString} subscriberCount=${subscriberCount}`)

    bunServer.publish(topicString, payloadString)

    const existingSub = activeSubscriptions.get(topicString)

    if (!existingSub) return

    if (!ws) {
      existingSub.pub(payload)
      return
    }

    const payloadWithMeta = {
      ...(payload as any),
      clientId: ws.data.clientId,
      sessionId: ws.data.sessionId,
      clientSessionId: ws.data.clientSessionId,
    }

    existingSub.pub(payloadWithMeta)
  }

  config.httpServer._setWebSocketHandler({
    async open(_ws: ServerWebSocket<BackendWebSocketData>) {},
    async close(_ws: ServerWebSocket<BackendWebSocketData>, _code, _message) {},
    async message(ws: ServerWebSocket<BackendWebSocketData>, message: string) {
      const msg: ToClientMsg = JSON.parse(message)

      switch (msg[0]) {
        case 'sub': {
          ws.subscribe(msg[1])
          const toClientMsg: ToClientMsgOne = ['sub', msg[1]]
          send(toClientMsg, ws)
          return
        }
        case 'pub': {
          const toClientMsg: ToClientMsgMany = ['pub', msg[1], msg[2]]
          publish(msg[1], toClientMsg, ws)
          return
        }
        case 'unsub': {
          ws.unsubscribe(msg[1])
          const toClientMsg: ToClientMsgOne = ['unsub', msg[1]]
          send(toClientMsg, ws)
          return
        }
      }
    },
  })

  config.httpServer.registerRespond((request, server) => {
    bunServer = server as Bun.Server
    const url = new URL(request.url)

    if (url.pathname === config.endpoint) {
      const maybeSessionId = SessionIdHttp.fromRequest(request)
      const sessionId = maybeSessionId ? maybeSessionId : SessionId.generate()

      const maybeClientSessionId = ClientSessionIdHttp.fromRequest(request)
      const clientSessionId = maybeClientSessionId ?? ClientSessionId.generate()

      const clientId = ClientId.generate()

      const data: BackendWebSocketData = {
        clientId,
        sessionId,
        clientSessionId,
      }

      const headers = new Headers()

      if (!maybeSessionId) {
        headers.append('Set-Cookie', SessionIdHttp.toSetCookieHeaderValue({ sessionId, isProd: config.isProd }))
      }

      logger.debug(`${config.endpoint} request received clientId=${clientId} sessionId=${sessionId} `)

      const didUpgrade = bunServer.upgrade(request, { headers, data })

      if (!didUpgrade) {
        return new Response('Failed to upgrade to WebSocket', { status: 500 })
      }

      return
    }

    return null
  })

  return {
    activeSubscriptions,
    publish,
  }
}
