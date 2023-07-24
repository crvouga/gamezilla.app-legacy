import { Cmd } from "@gamezilla/core";
import { ServerModel, ServerMsg, ToServer } from "./auth.core";
import {
  ServerAppMsg,
  ServerUnauthenticatedReqCtx,
} from "@gamezilla/shared/server";

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
}: {
  ctx: ServerUnauthenticatedReqCtx;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ServerAppMsg[];
} => {
  if (msg.t === "user-authenticated") {
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
      msgs: [
        {
          t: "client-authenticated",
          clientId: ctx.clientId,
          userId: msg.userId,
        },
      ],
    };
  }

  if (msg.t === "user-unauthenticated") {
    const sessionsNew = { ...model.sessions };
    delete sessionsNew[ctx.sessionId];
    return {
      model: {
        ...model,
        sessions: sessionsNew,
      },
    };
  }

  return { model };
};
