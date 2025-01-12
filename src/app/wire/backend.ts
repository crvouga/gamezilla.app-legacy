import { CappedOrderedDict } from '~/@/capped-ordered-dict/capped-ordered-dict'
import { unwrapOr } from '~/@/result'
import { RPC } from '~/@/rpc'
import type { Sub } from '~/@/sub'
import type { ClientId } from '~/app/@/data/client-id'
import { Logger } from '../../@/logger'
import { AppBackendModule } from '../@/architecture/app-backend'
import { BackendCmd, WireCmd } from '../@/backend/cmd'
import { AppBackendCtx } from '../@/backend/ctx'
import { BackendEvt } from '../@/backend/evt'
import { BackendInstanceBackend } from './backend-instance/backend'
import type { IBackendTransport } from './transport/backend'
import { rpcContract, type MsgBackend, type MsgToClient, type MsgToBackend, type BackendCtx } from './types'
import { WireSession } from './wire-session'
import { WireSessionDb } from './wire-session-db'

//
//
//
//
//
//

export const initCtx = async <TMsgToClient, TMsgToBackend>(input: {
  ctx: AppBackendCtx
  transport: IBackendTransport<{
    MsgToClient: TMsgToClient
    MsgToBackend: TMsgToBackend
  }>
}): Promise<BackendCtx<TMsgToClient, TMsgToBackend>> => {
  const logger = Logger.prefix('wire', input.ctx.logger)
  return {
    ...input.ctx,
    transport: input.transport,
    backendInstance: await BackendInstanceBackend.initCtx({ ctx: input.ctx }),
    wireSessionDb: await WireSessionDb({
      t: 'cached-db-conn-kv',
      dbConnKv: input.ctx.dbConnKv,
      pubSubTopicBased: input.ctx.pubSub,
      logger,
    }),
  }
}

//
//
//
//
//
//

type Input<TMsgToClient, TMsgToBackend> = {
  ctx: BackendCtx<TMsgToClient, TMsgToBackend>
  msg?: MsgBackend | null
  msgClient?: MsgToBackend | null
  msgEvt?: BackendEvt | null
  msgCmd?: WireCmd<TMsgToClient> | null
}

type Output = {
  msgEvt?: BackendEvt[]
  msgCmd?: BackendCmd<MsgToClient>[]
}

export const update = async <TMsgToClient, TMsgToBackend>(
  input: Input<TMsgToClient, TMsgToBackend>,
): Promise<Output> => {
  return AppBackendModule.andThen(
    {},
    () => updateFromMsg(input),
    () => updateFromCmd(input),
    () => updateFromEvent(input),
    () => updateChild(input),
  )
}

const updateChild: typeof update = async (input) => {
  const updated = await BackendInstanceBackend.update({
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    ctx: input.ctx.backendInstance,
    msg: input.msg?.t === 'got-backend-instance-msg' ? input.msg.c : null,
    msgClient: null,
    deps: {},
  })

  return {
    msgEvt: [],
    msgCmd: BackendCmd.tag('got-backend-instance-msg', updated.msgCmd),
  }
}

const updateFromMsg: typeof update = async (input) => {
  if (!input.msg) {
    return {}
  }

  switch (input.msg.t) {
    case 'got-backend-instance-msg': {
      return {}
    }
    case 'client-connected': {
      const got = await input.ctx.wireSessionDb.findBySessionIds([input.msg.sessionId])

      const maybeSession: WireSession | null = got.t === 'ok' ? (got.value[0] ?? null) : null

      const session: WireSession = maybeSession ?? WireSession.init(input.msg.sessionId)

      const sessionNew = WireSession.addClientId(session, input.msg.clientId)

      await input.ctx.wireSessionDb.put([sessionNew])

      return {
        msgEvt: [
          {
            t: 'wire-evt.client-connected',
            clientId: input.msg.clientId,
            sessionId: input.msg.sessionId,
          },
        ],
      }
    }

    case 'client-disconnected': {
      return {
        msgEvt: [
          {
            t: 'wire-evt.client-disconnected',
            clientId: input.msg.clientId,
            sessionId: input.msg.sessionId,
          },
        ],
      }
    }

    case 'backend-started': {
      return {}
    }

    case 'got-bad-msgs': {
      input.ctx.logger.warn(
        `Got bad msg from client. reason=${input.msg.reason}, client's clientId=${input.msg.clientId}, client's sessionId=${input.msg.sessionId}`,
      )
      return {}
    }
  }
}

const updateFromEvent: typeof update = async (input) => {
  switch (input.msgEvt?.t) {
    case 'auth-evt.client-authenticated': {
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

const updateFromCmd = async <TMsgToClient, TMsgToBackend>(
  input: Input<TMsgToClient, TMsgToBackend>,
): Promise<Output> => {
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
          msgs: [msgCmdChild.msg],
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

export const subscriptions = <TMsgToBackend, TMsgToClient>(input: {
  ctx: BackendCtx<TMsgToClient, TMsgToBackend>
}): Sub<MsgBackend> => {
  return input.ctx.transport.wire
}

export const rpc = <TMsgToClient, TMsgToBackend>(input: { ctx: BackendCtx<TMsgToClient, TMsgToBackend> }) => {
  return RPC.initBackend(rpcContract, {
    backendInstance: BackendInstanceBackend.rpc({ ctx: input.ctx.backendInstance }),
  })
}
