import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Posix, TimeSpan, chain } from "gamezilla/@SHARED/core";
import { Sub } from "gamezilla/@SHARED/core/sub";
import { IServerTransport } from "./transport-server";
import {
  Client,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./wire.core";
import { Store, StoreModule } from "gamezilla/@SHARED/immutable-store";

//
//
//
//
//
//
//

export const init = (): { model: ServerModel } => {
  return {
    model: {
      clientsBySessionId: {},
      serverStartedAt: null,
    },
  };
};

export const update = ({
  msg,
  model,
  ctx,
}: {
  ctx: ServerCtx;
  model: ServerModel;
  msg: ServerMsg;
}): {
  model: ServerModel;
  evt?: ServerEvt[];
  cmd?: ServerCmd<ToClient>[];
} => {
  switch (msg.t) {
    case "client-connected": {
      return chain(
        { model },
        (model) => {
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
        (model) => {
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

export const updateFromClient = ({
  model,
  msg,
}: {
  model: ServerModel;
  msg: ToServer;
}): {
  model: ServerModel;
} => {
  return { model };
};

export const updateFromCmd = <TToServer, TToClient>({
  cmd,
  model,
  transport,
  toSessionId,
}: {
  cmd: ServerCmd<TToClient>;
  model: ServerModel;
  transport: IServerTransport<{ ToClient: TToClient; ToServer: TToServer }>;
  //
  toSessionId: (userId: UserId) => Promise<SessionId | null>;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
} => {
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
