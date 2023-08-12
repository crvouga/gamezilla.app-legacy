import { Cmd } from "gamezilla/@/core";
import { AnonymousReqCtx, ServerAppMsg } from "gamezilla/app/@/server";
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
  cmd?: Cmd<Msg>;
} => {
  return { model };
};

export const updateFromClient = ({
  ctx,
  model,
  msg,
  sendBack,
}: {
  sendBack: (m: ToClient) => Cmd;
  ctx: AnonymousReqCtx;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ServerAppMsg[];
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

      cmd: sendBack({ t: "acknowledged", msg: msg }),

      msgs: [
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

      cmd: sendBack({ t: "acknowledged", msg: msg }),
    };
  }

  return {
    model,
    cmd: sendBack({ t: "acknowledged", msg: msg }),
  };
};
