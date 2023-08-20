import { Eff, dissoc } from "gamezilla/@SHARED/core";
import {
  AnonymousReqCtx,
  ServerCmd,
  ServerEvt,
  sendBack,
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
    case "client-authenticated": {
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
        cmd: [sendBack(ctx, { t: "acknowledged", msg })],
        evt: [
          {
            t: "client-authenticated",
            clientId: ctx.clientId,
            userId: msg.userId,
          },
        ],
      };
    }

    case "client-unauthenticated": {
      const sessionsNew = dissoc(model.sessions, ctx.sessionId);
      return {
        model: {
          ...model,
          sessions: sessionsNew,
        },
      };
    }
    default: {
      return { model, cmd: [sendBack(ctx, { t: "acknowledged", msg })] };
    }
  }
};
