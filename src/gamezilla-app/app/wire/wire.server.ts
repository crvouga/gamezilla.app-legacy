import type { ClientId, SessionId } from 'gamezilla-app/app/@/data'
import type { ServerCmd, ServerCtx, ServerEvt, WireCmd } from 'gamezilla-app/app/@/server'
import { Eff, isErr, Result } from 'gamezilla-app/@/core'
import type { Sub } from 'gamezilla-app/@/core/sub'
import { CappedOrderedDict } from 'gamezilla-app/@/capped-ordered-dict/capped-ordered-dict'
import { AppServerModule } from '../@/architecture/app-server'
import type { IDbConnKv } from '../@/server/db-conn-kv'
import type { IServerTransport } from './transport-server'
import { type IWireSessionDb, WireSessionDb } from './wire-session-db'
import type { Client, ModelServer, MsgServer, MsgToClient, MsgToServer } from './wire.types'

//
//
//
//
//
//

export type Deps<TMsgToClient, TMsgToServer> = {
  WireSessionDb: IWireSessionDb
  transport: IServerTransport<{
    MsgToClient: TMsgToClient
    MsgToServer: TMsgToServer
  }>
}

export const initDeps = async <TMsgToClient, TMsgToServer>(input: {
  transport: IServerTransport<{
    MsgToClient: TMsgToClient
    MsgToServer: TMsgToServer
  }>
  dbConnKv: IDbConnKv
}): Promise<Deps<TMsgToClient, TMsgToServer>> => {
  return {
    transport: input.transport,
    WireSessionDb: await WireSessionDb({
      t: 'db-conn-kv',
      dbConnKv: input.dbConnKv
    })
  }
}

//
//
//
//
//
//
//

export const init = async (): Promise<{
  model: ModelServer
  eff: Eff<MsgServer>
}> => {
  return {
    model: null,
    eff: Eff.None
  }
}

//
//
//
//
//
//

type Input<TMsgToClient, TMsgToServer> = {
  ctx: ServerCtx
  model: ModelServer
  //
  msg?: MsgServer | null
  msgClient?: MsgToServer | null
  msgEvt?: ServerEvt | null
  msgCmd?: WireCmd<TMsgToClient> | null
  //
  deps: Deps<TMsgToClient, TMsgToServer>
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
    () => updateFromClient(input),
    () => updateFromCmd(input),
    () => updateFromEvent(input)
  )
}

const updateFromMsg: typeof update = async ({ msg, ctx, deps }) => {
  if (!msg) {
    return {}
  }

  switch (msg.t) {
    case 'client-connected': {
      return AppServerModule.andThen({}, async () => {
        const gotExisting = await deps.WireSessionDb.clients.findBySessionIds([msg.sessionId])

        const maybeExisting: Client | null = gotExisting.t === 'ok' ? gotExisting.value[0] ?? null : null

        const existing: Client = maybeExisting ?? {
          clientIds: CappedOrderedDict.init({
            maxSize: 10
          }),
          sessionId: msg.sessionId
        }

        const clientNew: Client = {
          sessionId: msg.sessionId,
          clientIds: CappedOrderedDict.add(existing.clientIds, msg.clientId, msg.clientId)
        }

        const set = await deps.WireSessionDb.clients.set(msg.sessionId, clientNew)

        if (isErr(set)) {
          return {}
        }

        const msgEvt: ServerEvt[] = [
          {
            t: 'wire/client-connected',
            clientId: msg.clientId,
            sessionId: msg.sessionId
          }
        ]

        return {
          msgEvt
        }
      })
    }

    case 'client-disconnected': {
      const msgEvt: ServerEvt[] = [
        {
          t: 'wire/client-disconnected',
          clientId: msg.clientId,
          sessionId: msg.sessionId
        }
      ]
      return {
        msgEvt: msgEvt
      }
    }

    case 'server-started': {
      return {}
    }

    case 'got-bad-msgs': {
      ctx.logger.warn(
        `Got bad msg from client. reason=${msg.reason}, client's clientId=${msg.clientId}, client's sessionId=${msg.sessionId}`
      )
      return {}
    }
  }
}

const updateFromEvent: typeof update = async ({ deps, msgEvt }) => {
  if (!msgEvt) {
    return {}
  }
  switch (msgEvt.t) {
    case 'auth/client-authenticated': {
      const foundSessionIds = await deps.WireSessionDb.sessionIds.findByUserIds([msgEvt.account.userId])
      const sessionIds = foundSessionIds.t === 'ok' ? foundSessionIds.value : []

      const sessionIdsNew = [...new Set([...sessionIds, msgEvt.sessionId])]

      await deps.WireSessionDb.sessionIds.set(msgEvt.account.userId, sessionIdsNew)

      return {}
    }
    default: {
      return {}
    }
  }
}

const updateFromClient: typeof update = async () => {
  return {}
}

const updateFromCmd = async <TMsgToClient, TMsgToServer>({
  msgCmd,
  deps,
  ctx
}: Input<TMsgToClient, TMsgToServer>): Promise<Output> => {
  if (!msgCmd) {
    return {}
  }

  const msgCmdChild = msgCmd.c

  switch (msgCmdChild.t) {
    case 'broadcast': {
      deps.transport.toClientBroadcast.pub([msgCmdChild.msg])
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
        ctx.logger.warn(`${msgCmdChild.t} failed. No client ids provided`)
        return {}
      }

      for (const clientId of msgCmdChild.clientIds) {
        toClientPayload[clientId] = {
          clientId,
          msgs: [msgCmdChild.msg]
        }
      }

      deps.transport.toClient.pub(toClientPayload)
      return {}
    }

    case 'send-to-user': {
      const gotSessionIds = await deps.WireSessionDb.sessionIds.findByUserIds(msgCmdChild.userIds)

      const sessionIds = gotSessionIds.t === 'ok' ? gotSessionIds.value : []

      sendToSession({
        ctx,
        sessionIds,
        msg: msgCmdChild.msg,
        deps
      })
      return {}
    }

    case 'send-to-session': {
      sendToSession({
        ctx,
        sessionIds: msgCmdChild.sessionIds,
        msg: msgCmdChild.msg,
        deps
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
  deps,
  msg
}: {
  ctx: ServerCtx
  msg: TMsgToClient
  sessionIds: SessionId[]
  deps: Deps<TMsgToClient, TMsgToServer>
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

  const gotClients = await deps.WireSessionDb.clients.findBySessionIds(sessionIds)

  const clients = Result.withDefault(gotClients, [])

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

  deps.transport.toClient.pub(toClientPayload)
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
