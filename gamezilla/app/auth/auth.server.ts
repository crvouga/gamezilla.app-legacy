import { Eff } from "gamezilla/@SHARED/core";
import {
  AnonymousReqCtx,
  ServerCmd,
  ServerEvent,
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
  eff?: Eff<Msg>;
} => {
  return { model };
};

export const updateFromClient = ({
  ctx,
  model,
  msg,
  sendBack,
}: {
  sendBack: (m: ToClient) => Eff;
  ctx: AnonymousReqCtx;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  events?: ServerEvent[];
} => {
  if (msg.t === "client-authenticated") {
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

      eff: sendBack({ t: "acknowledged", msg: msg }),

      events: [
        {
          t: "client-authenticated",
          clientId: ctx.clientId,
          userId: msg.userId,
        },
      ],
    };
  }

  if (msg.t === "client-unauthenticated") {
    const sessionsNew = { ...model.sessions };
    delete sessionsNew[ctx.sessionId];
    return {
      model: {
        ...model,
        sessions: sessionsNew,
      },

      eff: sendBack({ t: "acknowledged", msg: msg }),
    };
  }

  return {
    model,
    eff: sendBack({ t: "acknowledged", msg: msg }),
  };
};
