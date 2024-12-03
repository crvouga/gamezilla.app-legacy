import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { unwrapOr } from '~/@/core'
import type { Sub } from '~/@/core/sub'
import type { ClientId } from '~/app/@/data'
import { AppServerCtx, ServerCmd, ServerEvt, WireCmd } from '~/app/@/server'
import { AppServerModule } from '../@/architecture/app-server'
import { Logger } from '../@/server/logger'
import { ServerInstanceServer } from './server-instance/server'
import type { IServerTransport } from './transport/server'
import { rpcContract, type MsgServer, type MsgToClient, type MsgToServer, type ServerCtx } from './types'
import { WireSession } from './wire-session'
import { WireSessionDb } from './wire-session-db'
import { RPC } from '~/@/rpc'

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
    serverInstance: await ServerInstanceServer.initCtx({ ctx: input.ctx }),
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
    () => updateFromEvent(input),
    () => updateChild(input)
  )
}

const updateChild: typeof update = async (input) => {
  const updated = await ServerInstanceServer.update({
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    ctx: input.ctx.serverInstance,
    msg: input.msg?.t === 'got-server-instance-msg' ? input.msg.c : null,
    msgClient: null,
    deps: {}
  })

  return {
    msgEvt: [],
    msgCmd: ServerCmd.tag('got-server-instance-msg', updated.msgCmd)
  }
}

const updateFromMsg: typeof update = async (input) => {
  if (!input.msg) {
    return {}
  }

  switch (input.msg.t) {
    case 'got-server-instance-msg': {
      return {}
    }
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

export const rpc = <TMsgToClient, TMsgToServer>(input: { ctx: ServerCtx<TMsgToClient, TMsgToServer> }) => {
  return RPC.initServer(rpcContract, {
    serverInstance: ServerInstanceServer.rpc({ ctx: input.ctx.serverInstance })
  })
}
