import { CappedOrderedDict } from 'gamezilla-app/@/capped-ordered-dict/capped-ordered-dict'
import { isErr, Result, unwrapOr } from 'gamezilla-app/@/core'
import type { Sub } from 'gamezilla-app/@/core/sub'
import type { ClientId, SessionId } from 'gamezilla-app/app/@/data'
import type { AppServerCtx, ServerCmd, ServerEvt, WireCmd } from 'gamezilla-app/app/@/server'
import { AppServerModule } from '../@/architecture/app-server'
import { Logger } from '../@/server/logger'
import type { IServerTransport } from './transport-server'
import { WireSessionDb } from './wire-session-db'
import type { Client, MsgServer, MsgToClient, MsgToServer, ServerCtx } from './wire.types'

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
      t: 'db-conn-kv-with-cache',
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

//
//
//
//

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
      const gotExisting = await input.ctx.wireSessionDb.clients.findBySessionIds([input.msg.sessionId])

      const maybeExisting: Client | null = gotExisting.t === 'ok' ? gotExisting.value[0] ?? null : null

      const existing: Client = maybeExisting ?? {
        clientIds: CappedOrderedDict.init({
          maxSize: 10
        }),
        sessionId: input.msg.sessionId
      }

      const clientNew: Client = {
        sessionId: input.msg.sessionId,
        clientIds: CappedOrderedDict.add(existing.clientIds, input.msg.clientId, input.msg.clientId)
      }

      const set = await input.ctx.wireSessionDb.clients.set(input.msg.sessionId, clientNew)

      if (isErr(set)) {
        return {}
      }

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
  if (!input.msgEvt) {
    return {}
  }
  switch (input.msgEvt.t) {
    case 'auth/client-authenticated': {
      const sessionIds = unwrapOr(
        await input.ctx.wireSessionDb.sessionIds.findByUserIds([input.msgEvt.account.userId]),
        []
      )

      const sessionIdsNew = Array.from(new Set([...sessionIds, input.msgEvt.sessionId]))

      await input.ctx.wireSessionDb.sessionIds.set(input.msgEvt.account.userId, sessionIdsNew)

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
      const gotSessionIds = await input.ctx.wireSessionDb.sessionIds.findByUserIds(msgCmdChild.userIds)

      const sessionIds = gotSessionIds.t === 'ok' ? gotSessionIds.value : []

      sendToSession({
        ctx: input.ctx,
        sessionIds,
        msg: msgCmdChild.msg
      })
      return {}
    }

    case 'send-to-session': {
      sendToSession({
        ctx: input.ctx,
        sessionIds: msgCmdChild.sessionIds,
        msg: msgCmdChild.msg
      })
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

const sendToSession = async <TMsgToClient, TMsgToServer>({
  ctx,
  sessionIds,
  msg
}: {
  ctx: ServerCtx<TMsgToClient, TMsgToServer>
  msg: TMsgToClient
  sessionIds: SessionId[]
}) => {
  const toClientPayload: {
    [clientId: ClientId]: {
      clientId: ClientId
      msgs: TMsgToClient[]
    }
  } = {}

  if (sessionIds.length === 0) {
    ctx.logger.warn('send to session failed. no sessionIds provided')
    return
  }

  const gotClients = await ctx.wireSessionDb.clients.findBySessionIds(sessionIds)

  const clients = Result.unwrapOr(gotClients, [])

  for (const client of clients) {
    const clientIds = CappedOrderedDict.valuesNewestFirst(client.clientIds)

    if (clientIds.length === 0) {
      ctx.logger.warn(`send to session failed. no client ids for sessionId=${client.sessionId}`)
      continue
    }

    for (const clientId of clientIds) {
      toClientPayload[clientId] = {
        clientId,
        msgs: [...(toClientPayload[clientId]?.msgs ?? []), msg]
      }
    }
  }

  ctx.transport.toClient.pub(toClientPayload)
}

export const subscriptions = <TMsgToServer, TMsgToClient>({
  transport
}: {
  transport: IServerTransport<{
    MsgToClient: TMsgToClient
    MsgToServer: TMsgToServer
  }>
}): Sub<MsgServer> => {
  return transport.wire
}
