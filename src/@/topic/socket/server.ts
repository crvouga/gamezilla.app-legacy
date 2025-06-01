import { ServerWebSocket } from 'bun'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { ILogger } from '~/@/logger'
import { s } from '~/@/schema'
import { PubSub, Sub } from '~/@/sub'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { Client, ClientNode, ContractBase, MsgMeta } from '../types'
import { PUB, SUB, ToClientMsg, ToClientMsgMany, ToClientMsgOne, toTopicString, UNSUB } from './shared'

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
        publish(topicParams, msg) {
          const topicString = toTopicString(topicName, topicParams)
          serverCore.publish(topicString, [PUB, topicString, msg], null)
        },
        subscribe(topicParams, mapper) {
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
  let bunServer: Bun.Server
  const activeSubscriptions = new Map<string, PubSub<any>>()

  const send = (ws: ServerWebSocket<BackendWebSocketData>, msg: ToClientMsgOne) => {
    const msgString = JSON.stringify(msg)

    ws.send(msgString)
  }

  const publish = (topicString: string, msg: ToClientMsgMany, ws: ServerWebSocket<BackendWebSocketData> | null) => {
    const msgString = JSON.stringify(msg)

    bunServer.publish(topicString, msgString)

    const existingSub = activeSubscriptions.get(topicString)

    if (!existingSub) return

    const msgPayload = msg[2]

    if (!ws) {
      existingSub.pub(msgPayload)
      return
    }

    const msgPayloadWithMeta = {
      ...msgPayload,
      clientId: ws.data.clientId,
      sessionId: ws.data.sessionId,
      clientSessionId: ws.data.clientSessionId,
    }

    existingSub.pub(msgPayloadWithMeta)
  }

  config.httpServer._setWebSocketHandler({
    async message(ws: ServerWebSocket<BackendWebSocketData>, message: string) {
      const msg: ToClientMsg = JSON.parse(message)

      switch (msg[0]) {
        case SUB: {
          ws.subscribe(msg[1])
          send(ws, msg)
          return
        }
        case UNSUB: {
          ws.unsubscribe(msg[1])
          send(ws, msg)
          return
        }
        case PUB: {
          publish(msg[1], msg, ws)
          return
        }
      }
    },
  })

  config.httpServer.registerRespond((request, server) => {
    bunServer = server as Bun.Server

    const url = new URL(request.url)

    if (url.pathname !== config.endpoint) return null

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

    if (bunServer.upgrade(request, { headers, data })) return

    return new Response('Failed to upgrade to WebSocket', { status: 500 })
  })

  return {
    activeSubscriptions,
    publish,
  }
}
