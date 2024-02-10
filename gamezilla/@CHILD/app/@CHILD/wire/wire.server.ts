import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  ServerCmd,
  ServerCtx,
  ServerEvent,
  WireCmd,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server"
import { Eff, Posix, TimeSpan } from "gamezilla/@SHARED/core"
import { Sub } from "gamezilla/@SHARED/core/sub"
import { CappedOrderedDict } from "gamezilla/@SHARED/data-structures/capped-ordered-dict"
import { AppServerModule } from "../../@SHARED/architecture/app-server"
import { IServerTransport } from "./transport-server"
import {
  Client,
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "./wire.core"

//
//
//
//
//
//
//

export const init = async (): Promise<{ model: ModelServer }> => {
  return {
    model: {
      clientsBySessionId: {},
      sessionIdsByUserId: {},
      serverStartedAt: null,
    },
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
  msgEvt?: ServerEvent | null
  msgCmd?: WireCmd<TMsgToClient> | null
  //
  transport: IServerTransport<{
    MsgToClient: TMsgToClient
    MsgToServer: TMsgToServer
  }>
}

type Output = {
  model: ModelServer
  eff?: Eff<MsgServer>
  msgEvt?: ServerEvent[]
  msgCmd?: ServerCmd<MsgToClient>[]
}

//
//
//
//

export const update = async <TMsgToClient, TMsgToServer>(
  input: Input<TMsgToClient, TMsgToServer>,
): Promise<Output> => {
  return AppServerModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromClient({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
  )
}

const updateFromMsg: typeof update = async ({ msg, model, ctx }) => {
  if (!msg) {
    return { model }
  }

  switch (msg.t) {
    case "client-connected": {
      return AppServerModule.chainUpdates(
        { model },
        async (model) => {
          const existing: Client = model.clientsBySessionId[msg.sessionId] ?? {
            clientIds: CappedOrderedDict.init({ maxSize: 10 }),
            sessionId: msg.sessionId,
          }

          const clientNew: Client = {
            sessionId: msg.sessionId,
            clientIds: CappedOrderedDict.add(
              existing.clientIds,
              msg.clientId,
              msg.clientId,
            ),
          }

          const clientsBySessionIdNew: ModelServer["clientsBySessionId"] = {
            ...model.clientsBySessionId,
            [msg.sessionId]: clientNew,
          }

          const msgEvt: ServerEvent[] = [
            {
              t: "wire/client-connected",
              clientId: msg.clientId,
              sessionId: msg.sessionId,
            },
          ]

          return {
            model: {
              ...model,
              clientsBySessionId: clientsBySessionIdNew,
            },
            msgEvt,
          }
        },
        async (model) => {
          const didServerRestart =
            model.serverStartedAt &&
            TimeSpan.lte(
              Posix.diff(ctx.now, model.serverStartedAt),
              TimeSpan.fromSeconds(3),
            )

          if (didServerRestart) {
            return {
              model,
              msgCmd: [
                sendToClient([msg.clientId], {
                  t: "server-restarted",
                }),
              ],
            }
          }

          return { model }
        },
      )
    }

    case "client-disconnected": {
      // remove the client from the clientsBySessionId might be causing bugs

      // const client: Client = model.clientsBySessionId[msg.sessionId] ?? {
      //   clientIds: CappedOrderedDict.init({ maxSize: 10 }),
      //   sessionId: msg.sessionId,
      // };

      // const clientNew: Client = {
      //   sessionId: msg.sessionId,
      //   clientIds: CappedOrderedDict.remove(client.clientIds, msg.clientId),
      // };

      // const clientsBySessionIdNew: ModelServer["clientsBySessionId"] = {
      //   ...model.clientsBySessionId,
      //   [msg.sessionId]: clientNew,
      // };

      const msgEvt: ServerEvent[] = [
        {
          t: "wire/client-disconnected",
          clientId: msg.clientId,
          sessionId: msg.sessionId,
        },
      ]
      return {
        model: {
          ...model,
          // clientsBySessionId: clientsBySessionIdNew,
        },
        msgEvt: msgEvt,
      }
    }

    case "server-started": {
      return {
        model: {
          ...model,
          serverStartedAt: ctx.now,
        },
      }
    }

    case "got-bad-msgs": {
      ctx.logger.warn(
        `Got bad msg from client. reason=${msg.reason}, client's clientId=${msg.clientId}, client's sessionId=${msg.sessionId}`,
      )
      return {
        model,
      }
    }
  }
}

const updateFromEvent: typeof update = async ({ msgEvt, model }) => {
  if (!msgEvt) {
    return { model }
  }
  switch (msgEvt.t) {
    case "auth/client-authenticated": {
      const sessionIds = model.sessionIdsByUserId[msgEvt.userId] ?? []

      const sessionIdsNew = [...new Set([...sessionIds, msgEvt.sessionId])]

      const sessionIdByUserIdNew: ModelServer["sessionIdsByUserId"] = {
        ...model.sessionIdsByUserId,
        [msgEvt.userId]: sessionIdsNew,
      }

      return {
        model: {
          ...model,
          sessionIdsByUserId: sessionIdByUserIdNew,
        },
      }
    }
    default: {
      return { model }
    }
  }
}

const updateFromClient: typeof update = async ({ model }) => {
  return { model }
}

const updateFromCmd = async <TMsgToClient, TMsgToServer>({
  msgCmd,
  model,
  transport,
  ctx,
}: Input<TMsgToClient, TMsgToServer>): Promise<Output> => {
  if (!msgCmd) {
    return { model }
  }

  const msgCmdChild = msgCmd.c

  switch (msgCmdChild.t) {
    case "broadcast": {
      return {
        model,
        eff: () => {
          transport.toClientBroadcast.publish([msgCmdChild.msg])
        },
      }
    }

    case "send-to-client": {
      return {
        model,
        eff: () => {
          const toClientPayload: {
            [clientId: ClientId]: {
              clientId: ClientId
              msgs: TMsgToClient[]
            }
          } = {}

          if (msgCmdChild.clientIds.length === 0) {
            ctx.logger.warn(`${msgCmdChild.t} failed. No client ids provided`)
            return
          }

          for (const clientId of msgCmdChild.clientIds) {
            ctx.logger.debug(
              `sending to client. clientId=${clientId} msg=${msgCmdChild.msg}`,
            )
            toClientPayload[clientId] = {
              clientId,
              msgs: [msgCmdChild.msg],
            }
          }

          transport.toClient.publish(toClientPayload)
        },
      }
    }

    case "send-to-user": {
      const sessionIds: SessionId[] = msgCmdChild.userIds.flatMap(
        (userId) => model.sessionIdsByUserId[userId] ?? [],
      )

      return {
        model,
        eff: () => {
          sendToSession({
            ctx,
            sessionIds,
            model,
            msg: msgCmdChild.msg,
            transport,
          })
        },
      }
    }

    case "send-to-session": {
      return {
        model,
        eff: () => {
          sendToSession({
            ctx,
            sessionIds: msgCmdChild.sessionIds,
            model,
            msg: msgCmdChild.msg,
            transport,
          })
        },
      }
    }

    case "topic-publish": {
      return {
        model,
        eff: () => {},
      }
    }

    case "topic-subscribe": {
      return { model }
    }
  }
}

const sendToSession = async <TMsgToClient, TMsgToServer>({
  ctx,
  sessionIds,
  transport,
  model,
  msg,
}: {
  ctx: ServerCtx
  model: ModelServer
  msg: TMsgToClient
  sessionIds: SessionId[]
  transport: IServerTransport<{
    MsgToClient: TMsgToClient
    MsgToServer: TMsgToServer
  }>
}) => {
  const toClientPayload: {
    [clientId: ClientId]: {
      clientId: ClientId
      msgs: TMsgToClient[]
    }
  } = {}

  if (sessionIds.length === 0) {
    ctx.logger.warn(`send to session failed. no sessionIds provided`)
    return
  }

  for (const sessionId of sessionIds) {
    const client = model.clientsBySessionId[sessionId]

    if (!client) {
      ctx.logger.warn(
        `send to session failed. no client associated with sessionId=${sessionId}`,
      )
      continue
    }

    const clientIds = CappedOrderedDict.values(client.clientIds)

    if (clientIds.length === 0) {
      ctx.logger.warn(
        `send to session failed. no client ids for sessionId=${sessionId}`,
      )
      continue
    }

    for (const clientId of clientIds) {
      toClientPayload[clientId] = {
        clientId,
        msgs: [...(toClientPayload[clientId]?.msgs ?? []), msg],
      }
    }
  }

  transport.toClient.publish(toClientPayload)
}

export const subscriptions = <TMsgToServer, TMsgToClient>({
  transport,
}: {
  transport: IServerTransport<{
    MsgToClient: TMsgToClient
    MsgToServer: TMsgToServer
  }>
}): Sub<MsgServer> => {
  return transport.wire
}
