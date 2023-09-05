import { Eff, dissoc } from "gamezilla/@SHARED/core";
import {
  AnonymousReqCtx,
  ServerCmd,
  ServerEvt,
  sendBack,
  sendToClient,
} from "gamezilla/app/@SHARED/server";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./auth.core";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init: Model = { sessions: {}, verifications: {} };

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = ({
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
} => {
  return { model };
};

export const updateFromClient = ({
  ctx,
  model,
  msg,
}: {
  ctx: AnonymousReqCtx;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  evt?: ServerEvt[];
  cmd?: ServerCmd<ToClient>[];
} => {
  switch (msg.t) {
    case "logged-in-client-side": {
      return {
        model: {
          ...model,
          sessions: {
            ...model.sessions,
            [ctx.sessionId]: {
              sessionId: ctx.sessionId,
              userId: msg.userId,
            },
          },
        },
        evt: [
          {
            t: "client-authenticated",
            clientId: ctx.clientId,
            userId: msg.userId,
            sessionId: ctx.sessionId,
          },
        ],
      };
    }

    case "logged-out-client-side": {
      const sessionsNew = { ...model.sessions };
      delete sessionsNew[ctx.sessionId];
      return {
        model: {
          ...model,
          sessions: sessionsNew,
        },
        evt: [
          {
            t: "client-unauthenticated",
            clientId: ctx.clientId,
            sessionId: ctx.sessionId,
          },
        ],
      };
    }
    default: {
      return { model };
    }
  }
};

export const updateFromEvt = ({
  msg: evt,
  model,
}: {
  msg: ServerEvt;
  model: Model;
}): {
  model: Model;
  cmd?: ServerCmd<ToClient>[];
} => {
  switch (evt.t) {
    case "client-authenticated":
    case "client-connected": {
      const session = model.sessions[evt.sessionId];
      if (!session) {
        return {
          model,
          cmd: [sendToClient([evt.clientId], { t: "client-unauthenticated" })],
        };
      }

      const userId = session.userId;

      if (!userId) {
        return {
          model,
          cmd: [sendToClient([evt.clientId], { t: "client-unauthenticated" })],
        };
      }

      return {
        model,
        cmd: [
          sendToClient([evt.clientId], { t: "client-authenticated", userId }),
        ],
      };
    }

    case "client-unauthenticated": {
      return {
        model,
        cmd: [sendToClient([evt.clientId], { t: "client-unauthenticated" })],
      };
    }

    default: {
      return { model };
    }
  }
};
