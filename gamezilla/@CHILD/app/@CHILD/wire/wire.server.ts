import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Posix, TimeSpan } from "gamezilla/@SHARED/core";
import { Sub } from "gamezilla/@SHARED/core/sub";
import { ServerModule } from "../../@SHARED/architecture/app-server";
import { IServerTransport } from "./transport-server";
import {
  Client,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./wire.core";

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
  evt?: ServerEvt | null;
  cmd?: ServerCmd<TToClient> | null;
  //
  transport: IServerTransport<{
    ToClient: TToClient;
    ToServer: TToServer;
  }>;
  toSessionId: (userId: UserId) => Promise<SessionId | null>;
};

type Output = {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  evt?: ServerEvt[];
  cmd?: ServerCmd<ToClient>[];
};

//
//
//
//

export const update = async <TToClient, TToServer>(
  input: Input<TToClient, TToServer>
): Promise<Output> => {
  return ServerModule.chainUpdates(
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
      return ServerModule.chainUpdates(
        { model },
        async (model) => {
          const clientNew: Client = {
            sessionId: msg.sessionId,
            clientId: msg.clientId,
            status: "connected",
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
            evt: [
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
      const clientNew: Client = {
        sessionId: msg.sessionId,
        clientId: msg.clientId,
        status: "disconnected",
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
        evt: [
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
  }
};

const updateFromClient: typeof update = async ({ model }) => {
  return { model };
};

const updateFromCmd = async <TToClient, TToServer>({
  cmd,
  model,
  transport,
  toSessionId,
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
            const sessionId = await toSessionId(userId);

            if (!sessionId) {
              continue;
            }

            const client = model.clientsBySessionId[sessionId];

            if (!client) {
              continue;
            }

            toClientPayload[client.clientId] = {
              clientId: client.clientId,
              msgs: [cmd.msg],
            };
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
