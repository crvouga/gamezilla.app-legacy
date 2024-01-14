import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvent,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Posix, TimeSpan } from "gamezilla/@SHARED/core";
import { Sub } from "gamezilla/@SHARED/core/sub";
import { AppServerModule } from "../../@SHARED/architecture/app-server";
import { IServerTransport } from "./transport-server";
import {
  Client,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./wire.core";
import { CappedOrderedDict } from "gamezilla/@SHARED/data-structures/capped-ordered-dict";

//
//
//
//
//
//
//

export const init = async (): Promise<{ model: ServerModel }> => {
  return {
    model: {
      clientsBySessionId: {},
      serverStartedAt: null,
    },
  };
};

//
//
//
//
//
//

type Input<TToClient, TToServer> = {
  ctx: ServerCtx;
  model: ServerModel;
  //
  msg?: ServerMsg | null;
  fromClient?: ToServer | null;
  event?: ServerEvent | null;
  cmd?: ServerCmd<TToClient> | null;
  //
  transport: IServerTransport<{
    ToClient: TToClient;
    ToServer: TToServer;
  }>;
  toSessionIds: (
    userId: UserId
  ) => Promise<{ [sessionId: SessionId]: SessionId } | null>;
};

type Output = {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  event?: ServerEvent[];
  cmd?: ServerCmd<ToClient>[];
};

//
//
//
//

export const update = async <TToClient, TToServer>(
  input: Input<TToClient, TToServer>
): Promise<Output> => {
  return AppServerModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromClient({ ...input, model }),
    (model) => updateFromCmd({ ...input, model })
  );
};

const updateFromMsg: typeof update = async ({ msg, model, ctx }) => {
  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "client-connected": {
      return AppServerModule.chainUpdates(
        { model },
        async (model) => {
          const existing: Client = model.clientsBySessionId[msg.sessionId] ?? {
            clientIds: CappedOrderedDict.init({ maxSize: 10 }),
            sessionId: msg.sessionId,
          };

          const clientNew: Client = {
            sessionId: msg.sessionId,
            clientIds: CappedOrderedDict.add(
              existing.clientIds,
              msg.clientId,
              msg.clientId
            ),
          };

          const clientsBySessionIdNew: ServerModel["clientsBySessionId"] = {
            ...model.clientsBySessionId,
            [msg.sessionId]: clientNew,
          };

          return {
            model: {
              ...model,
              clientsBySessionId: clientsBySessionIdNew,
            },
            event: [
              {
                t: "wire/client-connected",
                clientId: msg.clientId,
                sessionId: msg.sessionId,
              },
            ],
          };
        },
        async (model) => {
          const didServerRestart =
            model.serverStartedAt &&
            TimeSpan.lte(
              Posix.diff(ctx.now, model.serverStartedAt),
              TimeSpan.fromSeconds(3)
            );

          if (didServerRestart) {
            return {
              model,
              cmd: [sendToClient([msg.clientId], { t: "server-restarted" })],
            };
          }

          return { model };
        }
      );
    }

    case "client-disconnected": {
      const client: Client = model.clientsBySessionId[msg.sessionId] ?? {
        clientIds: CappedOrderedDict.init({ maxSize: 10 }),
        sessionId: msg.sessionId,
      };

      const clientNew: Client = {
        sessionId: msg.sessionId,
        clientIds: CappedOrderedDict.remove(client.clientIds, msg.clientId),
      };

      const clientsBySessionIdNew: ServerModel["clientsBySessionId"] = {
        ...model.clientsBySessionId,
        [msg.sessionId]: clientNew,
      };

      return {
        model: {
          ...model,
          clientsBySessionId: clientsBySessionIdNew,
        },
        event: [
          {
            t: "wire/client-disconnected",
            clientId: msg.clientId,
            sessionId: msg.sessionId,
          },
        ],
      };
    }

    case "server-started": {
      return {
        model: {
          ...model,
          serverStartedAt: ctx.now,
        },
      };
    }

    case "got-bad-msgs": {
      ctx.logger.info(
        `Got bad msg from client. reason=${msg.reason}, clientId=${msg.clientId}, sessionId=${msg.sessionId}`
      );
      return {
        model,
      };
    }
  }
};

const updateFromClient: typeof update = async ({ model }) => {
  return { model };
};

const updateFromCmd = async <TToClient, TToServer>({
  cmd,
  model,
  transport,
  toSessionIds,
  ctx,
}: Input<TToClient, TToServer>): Promise<Output> => {
  if (!cmd) {
    return { model };
  }

  switch (cmd.t) {
    case "wire/broadcast": {
      return {
        model,
        eff: () => {
          transport.toClientBroadcast.publish([cmd.msg]);
        },
      };
    }

    case "wire/send-to-client": {
      return {
        model,
        eff: () => {
          const toClientPayload: {
            [clientId: ClientId]: {
              clientId: ClientId;
              msgs: TToClient[];
            };
          } = {};

          for (const clientId of cmd.clientIds) {
            toClientPayload[clientId] = {
              clientId,
              msgs: [cmd.msg],
            };
          }

          transport.toClient.publish(toClientPayload);
        },
      };
    }

    case "wire/send-to-user": {
      return {
        model,
        eff: async () => {
          const toClientPayload: {
            [clientId: ClientId]: {
              clientId: ClientId;
              msgs: TToClient[];
            };
          } = {};

          for (const userId of cmd.userIds) {
            const sessionIds = await toSessionIds(userId);

            if (!sessionIds) {
              ctx.logger.warn(
                `wire/send-to-user failed. no sessionIds for userId=${userId}`
              );
              continue;
            }

            for (const sessionId in sessionIds) {
              const client = model.clientsBySessionId[sessionId as SessionId];

              if (!client) {
                ctx.logger.warn(
                  `wire/send-to-user failed. no client for sessionId=${sessionId} and userId=${userId}`
                );
                continue;
              }

              for (const clientId of CappedOrderedDict.values(
                client.clientIds
              )) {
                toClientPayload[clientId] = {
                  clientId,
                  msgs: [...(toClientPayload[clientId]?.msgs ?? []), cmd.msg],
                };
              }
            }
          }

          transport.toClient.publish(toClientPayload);
        },
      };
    }

    case "wire/topic-publish": {
      return {
        model,
        eff: () => {},
      };
    }

    case "wire/topic-subscribe": {
      return { model };
    }

    default: {
      return { model };
    }
  }
};

export const subscriptions = <TToServer, TToClient>({
  transport,
}: {
  transport: IServerTransport<{ ToClient: TToClient; ToServer: TToServer }>;
}): Sub<ServerMsg> => {
  return transport.wire;
};
