import { toCookies } from '@/web-server/cookies'
import type { WebServerNode } from '@/web-server/impl-node'
import { SessionId, type ClientId } from 'app/@/data'
import type { ILogger } from 'app/@/server/logger'
import { Server } from 'socket.io'
import { type MsgClientToMsgServer, type MsgServerToMsgClient } from '../types'
import { initServerTransport, type IServerTransport } from './interface'
import { ORIGINS, SESSION_ID_COOKIE_NAME, toSetSessionCookie } from '../session-id-cookie'

export type Config = {
  t: 'socket-io'
  logger: ILogger
  codebaseVersionId: string
  webServer: WebServerNode
}

export const ServerTransport = async <MsgToServer, MsgToClient>(
  config: Config
): Promise<
  IServerTransport<{
    MsgToClient: MsgToClient
    MsgToServer: MsgToServer
  }>
> => {
  const transport = initServerTransport<MsgToServer, MsgToClient>()

  const io = new Server(config.webServer.httpServer, {
    cors: {
      origin: '*',
      credentials: true
    },
    transports: ['websocket'],
    allowUpgrades: true
  })

  config.webServer.registerHandler(async (request) => {
    const url = new URL(request.url)
    if (url.pathname !== '/set-session-cookie') {
      return null
    }
    const origin = Array.isArray(ORIGINS) ? ORIGINS.join(', ') : request.headers.get('Origin') ?? '*'
    const cookies = toCookies(request)
    const maybeSessionId = cookies[SESSION_ID_COOKIE_NAME]
    const sessionId = SessionId.is(maybeSessionId) ? maybeSessionId : SessionId.generate()

    const headersBase = [
      ['Access-Control-Allow-Origin', origin],
      ['Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'],
      ['Access-Control-Allow-Headers', 'Content-Type'],
      ['Access-Control-Allow-Credentials', 'true'],
      ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload'],
      ['Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';"]
    ] as const

    const res = new Response('Ok', {
      status: 200
    })

    for (const [key, value] of headersBase) {
      res.headers.append(key, value)
    }

    if (sessionId !== maybeSessionId) {
      res.headers.append('Set-Cookie', toSetSessionCookie(sessionId))
    }

    return res
  })

  io.on('connection', (socket) => {
    const cookies = (socket.handshake.headers.cookie ?? '').split(';').reduce<Record<string, string>>((acc, cookie) => {
      const [name, value] = cookie.trim().split('=')
      if (!name || !value) return acc
      acc[name] = value
      return acc
    }, {})

    const maybeSessionId = cookies[SESSION_ID_COOKIE_NAME]

    const sessionId = SessionId.is(maybeSessionId) ? maybeSessionId : SessionId.generate()

    const clientId = socket.id as ClientId

    transport.wire.pub({
      t: 'client-connected',
      clientId,
      sessionId
    })

    socket.on('to-server', (msg: MsgClientToMsgServer<MsgToServer>, acknowledge: () => void) => {
      if (msg.v !== config.codebaseVersionId) {
        transport.wire.pub({
          t: 'got-bad-msgs',
          clientId,
          msgs: msg.m,
          reason: 'codebase-version-id-mismatch',
          sessionId
        })
      }
      transport.fromClient.pub({
        msgs: msg.m,
        clientId: clientId,
        sessionId: sessionId
      })
      acknowledge()
    })

    const unsubscribe = transport.toClient.sub((msgsByClientId) => {
      const msgs = msgsByClientId[clientId]

      if (!msgs) {
        return
      }

      const toClient: MsgServerToMsgClient<MsgToClient> = {
        v: config.codebaseVersionId,
        m: msgs.msgs
      }

      socket.emit('to-client', toClient)
    })

    socket.on('disconnect', () => {
      unsubscribe()

      transport.wire.pub({
        t: 'client-disconnected',
        clientId,
        sessionId
      })
    })
  })

  transport.toClientBroadcast.sub((msgs) => {
    const toClient: MsgServerToMsgClient<MsgToClient> = {
      v: config.codebaseVersionId,
      m: msgs
    }

    io.emit('to-client', toClient)
  })

  return transport
}
