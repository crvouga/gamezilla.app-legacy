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
import { rpcContract, type MsgBackend, type MsgToFrontend, type MsgToBackend, type BackendCtx } from './types'
import { WireSession } from './wire-session'
import { WireSessionDb } from './wire-session-db'

//
//
//
//
//
//

export const initCtx = async <TMsgToFrontend, TMsgToBackend>(input: {
  ctx: AppBackendCtx
  transport: IBackendTransport<{
    MsgToFrontend: TMsgToFrontend
    MsgToBackend: TMsgToBackend
  }>
}): Promise<BackendCtx<TMsgToFrontend, TMsgToBackend>> => {
  const logger = Logger.prefix('wire', input.ctx.logger)
  return {
    ...input.ctx,
    transport: input.transport,
    backendInstance: await BackendInstanceBackend.initCtx({ ctx: input.ctx }),
    wireSessionDb: await WireSessionDb({
      t: 'cached-db-conn-kv',
      keyValueDb: input.ctx.keyValueDb,
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

type Input<TMsgToFrontend, TMsgToBackend> = {
  ctx: BackendCtx<TMsgToFrontend, TMsgToBackend>
  msg?: MsgBackend | null
  msgFrontend?: MsgToBackend | null
  msgEvt?: BackendEvt | null
  msgCmd?: WireCmd<TMsgToFrontend> | null
}

type Output = {
  msgEvt?: BackendEvt[]
  msgCmd?: BackendCmd<MsgToFrontend>[]
}

export const update = async <TMsgToFrontend, TMsgToBackend>(
  input: Input<TMsgToFrontend, TMsgToBackend>,
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
    msgFrontend: null,
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
    case 'frontend-connected': {
      const got = await input.ctx.wireSessionDb.findBySessionIds([input.msg.sessionId])

      const maybeSession: WireSession | null = got.t === 'ok' ? (got.value[0] ?? null) : null

      const session: WireSession = maybeSession ?? WireSession.init(input.msg.sessionId)

      const sessionNew = WireSession.addClientId(session, input.msg.clientId)

      await input.ctx.wireSessionDb.put([sessionNew])

      return {
        msgEvt: [
          {
            t: 'wire-evt.frontend-connected',
            clientId: input.msg.clientId,
            sessionId: input.msg.sessionId,
          },
        ],
      }
    }

    case 'frontend-disconnected': {
      return {
        msgEvt: [
          {
            t: 'wire-evt.frontend-disconnected',
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
        `Got bad msg from frontend. reason=${input.msg.reason}, frontend's clientId=${input.msg.clientId}, frontend's sessionId=${input.msg.sessionId}`,
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

const updateFromCmd = async <TMsgToFrontend, TMsgToBackend>(
  input: Input<TMsgToFrontend, TMsgToBackend>,
): Promise<Output> => {
  if (!input.msgCmd) {
    return {}
  }

  const msgCmdChild = input.msgCmd.c

  switch (msgCmdChild.t) {
    case 'broadcast': {
      input.ctx.transport.toFrontendBroadcast.pub([msgCmdChild.msg])
      return {}
    }

    case 'send-to-frontend': {
      const toFrontendPayload: {
        [clientId: ClientId]: {
          clientId: ClientId
          msgs: TMsgToFrontend[]
        }
      } = {}

      if (msgCmdChild.clientIds.length === 0) {
        input.ctx.logger.warn(`${msgCmdChild.t} failed. No frontend ids provided`)
        return {}
      }

      for (const clientId of msgCmdChild.clientIds) {
        toFrontendPayload[clientId] = {
          clientId,
          msgs: [msgCmdChild.msg],
        }
      }

      input.ctx.transport.toFrontend.pub(toFrontendPayload)
      return {}
    }

    case 'send-to-user': {
      const wireSessions = unwrapOr(await input.ctx.wireSessionDb.findByUserIds(msgCmdChild.userIds), [])

      if (wireSessions.length === 0) {
        input.ctx.logger.warn(`send to user error. no wire sessions for userIds=${msgCmdChild.userIds}`)
        return {}
      }

      const toFrontendPayload: {
        [clientId: ClientId]: {
          clientId: ClientId
          msgs: TMsgToFrontend[]
        }
      } = {}

      for (const wireSession of wireSessions) {
        const clientIds = CappedOrderedDict.valuesNewestFirst(wireSession.clientIds)

        if (clientIds.length === 0) {
          input.ctx.logger.warn(`send to user error. no frontend ids for sessionId=${wireSession.sessionId}`)
          continue
        }

        for (const clientId of clientIds) {
          toFrontendPayload[clientId] = toFrontendPayload[clientId] ?? { clientId, msgs: [] }
          toFrontendPayload[clientId].msgs.push(msgCmdChild.msg)
        }
      }
      input.ctx.transport.toFrontend.pub(toFrontendPayload)
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

export const subscriptions = <TMsgToBackend, TMsgToFrontend>(input: {
  ctx: BackendCtx<TMsgToFrontend, TMsgToBackend>
}): Sub<MsgBackend> => {
  return input.ctx.transport.wire
}

export const rpc = <TMsgToFrontend, TMsgToBackend>(input: { ctx: BackendCtx<TMsgToFrontend, TMsgToBackend> }) => {
  return RPC.initBackend(rpcContract, {
    backendInstance: BackendInstanceBackend.rpc({ ctx: input.ctx.backendInstance }),
  })
}
