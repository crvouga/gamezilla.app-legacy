import { CappedOrderedDict } from 'gamezilla-app/@/capped-ordered-dict/capped-ordered-dict'
import { unwrapOr } from 'gamezilla-app/@/core'
import type { Sub } from 'gamezilla-app/@/core/sub'
import type { ClientId } from 'gamezilla-app/app/@/data'
import type { AppServerCtx, ServerCmd, ServerEvt, WireCmd } from 'gamezilla-app/app/@/server'
import { AppServerModule } from '../@/architecture/app-server'
import { Logger } from '../@/server/logger'
import type { IServerTransport } from './transport/server'
import type { MsgServer, MsgToClient, MsgToServer, ServerCtx } from './types'
import { WireSession } from './wire-session'
import { WireSessionDb } from './wire-session-db'

//
//
//
//
//
//

export const initCtx = async <TMsgToClient, TMsgToServer>(input: {
  ctx: AppServerCtx
  transport: IServerTransport<{
    MsgToClient: TMsgToClient
    MsgToServer: TMsgToServer
  }>
}): Promise<ServerCtx<TMsgToClient, TMsgToServer>> => {
  const logger = Logger.prefix('wire', input.ctx.logger)
  return {
    ...input.ctx,
    transport: input.transport,
    wireSessionDb: await WireSessionDb({
      t: 'cached-db-conn-kv',
      dbConnKv: input.ctx.dbConnKv,
      pubSubTopicBased: input.ctx.pubSub,
      logger
    })
  }
}

//
//
//
//
//
//

type Input<TMsgToClient, TMsgToServer> = {
  ctx: ServerCtx<TMsgToClient, TMsgToServer>
  msg?: MsgServer | null
  msgClient?: MsgToServer | null
  msgEvt?: ServerEvt | null
  msgCmd?: WireCmd<TMsgToClient> | null
}

type Output = {
  msgEvt?: ServerEvt[]
  msgCmd?: ServerCmd<MsgToClient>[]
}

export const update = async <TMsgToClient, TMsgToServer>(input: Input<TMsgToClient, TMsgToServer>): Promise<Output> => {
  return AppServerModule.andThen(
    {},
    () => updateFromMsg(input),
    () => updateFromCmd(input),
    () => updateFromEvent(input)
  )
}

const updateFromMsg: typeof update = async (input) => {
  if (!input.msg) {
    return {}
  }

  switch (input.msg.t) {
    case 'client-connected': {
      const got = await input.ctx.wireSessionDb.findBySessionIds([input.msg.sessionId])

      const maybeSession: WireSession | null = got.t === 'ok' ? got.value[0] ?? null : null

      const session: WireSession = maybeSession ?? WireSession.init(input.msg.sessionId)

      const sessionNew = WireSession.addClientId(session, input.msg.clientId)

      await input.ctx.wireSessionDb.put([sessionNew])

      return {
        msgEvt: [
          {
            t: 'wire/client-connected',
            clientId: input.msg.clientId,
            sessionId: input.msg.sessionId
          }
        ]
      }
    }

    case 'client-disconnected': {
      return {
        msgEvt: [
          {
            t: 'wire/client-disconnected',
            clientId: input.msg.clientId,
            sessionId: input.msg.sessionId
          }
        ]
      }
    }

    case 'server-started': {
      return {}
    }

    case 'got-bad-msgs': {
      input.ctx.logger.warn(
        `Got bad msg from client. reason=${input.msg.reason}, client's clientId=${input.msg.clientId}, client's sessionId=${input.msg.sessionId}`
      )
      return {}
    }
  }
}

const updateFromEvent: typeof update = async (input) => {
  switch (input.msgEvt?.t) {
    case 'auth/client-authenticated': {
      const wireSessions = unwrapOr(await input.ctx.wireSessionDb.findBySessionIds([input.msgEvt.sessionId]), [])
      const userId = input.msgEvt.user.userId
      const wireSessionsNew = wireSessions.map((wireSession) => WireSession.addUserId(wireSession, userId))

      await input.ctx.wireSessionDb.put(wireSessionsNew)
      return {}
    }
    default: {
      return {}
    }
  }
}

const updateFromCmd = async <TMsgToClient, TMsgToServer>(input: Input<TMsgToClient, TMsgToServer>): Promise<Output> => {
  if (!input.msgCmd) {
    return {}
  }

  const msgCmdChild = input.msgCmd.c

  switch (msgCmdChild.t) {
    case 'broadcast': {
      input.ctx.transport.toClientBroadcast.pub([msgCmdChild.msg])
      return {}
    }

    case 'send-to-client': {
      const toClientPayload: {
        [clientId: ClientId]: {
          clientId: ClientId
          msgs: TMsgToClient[]
        }
      } = {}

      if (msgCmdChild.clientIds.length === 0) {
        input.ctx.logger.warn(`${msgCmdChild.t} failed. No client ids provided`)
        return {}
      }

      for (const clientId of msgCmdChild.clientIds) {
        toClientPayload[clientId] = {
          clientId,
          msgs: [msgCmdChild.msg]
        }
      }

      input.ctx.transport.toClient.pub(toClientPayload)
      return {}
    }

    case 'send-to-user': {
      const wireSessions = unwrapOr(await input.ctx.wireSessionDb.findByUserIds(msgCmdChild.userIds), [])

      if (wireSessions.length === 0) {
        input.ctx.logger.warn(`send to user error. no wire sessions for userIds=${msgCmdChild.userIds}`)
        return {}
      }

      const toClientPayload: {
        [clientId: ClientId]: {
          clientId: ClientId
          msgs: TMsgToClient[]
        }
      } = {}

      for (const wireSession of wireSessions) {
        console.log('wireSession', wireSession)
        const clientIds = CappedOrderedDict.valuesNewestFirst(wireSession.clientIds)

        if (clientIds.length === 0) {
          input.ctx.logger.warn(`send to user error. no client ids for sessionId=${wireSession.sessionId}`)
          continue
        }

        for (const clientId of clientIds) {
          toClientPayload[clientId] = toClientPayload[clientId] ?? { clientId, msgs: [] }
          toClientPayload[clientId].msgs.push(msgCmdChild.msg)
        }
      }
      console.log('toClientPayload', toClientPayload)
      input.ctx.transport.toClient.pub(toClientPayload)
      return {}
    }

    case 'topic-publish': {
      return {}
    }

    case 'topic-subscribe': {
      return {}
    }
  }
}

export const subscriptions = <TMsgToServer, TMsgToClient>(input: {
  ctx: ServerCtx<TMsgToClient, TMsgToServer>
}): Sub<MsgServer> => {
  return input.ctx.transport.wire
}
