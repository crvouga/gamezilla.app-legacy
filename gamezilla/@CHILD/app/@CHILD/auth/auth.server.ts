import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server";
import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvent,
  sendMsgToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Sub } from "gamezilla/@SHARED/core";
import * as AuthServerSMS from "./@CHILD/auth-sms/auth-sms.server";
import {
  StoreSessionIdByUserId,
  StoreUserIdBySessionId,
} from "./@SHARED/server/auth-session-store";
import { ServerModel, ServerMsg, MsgToClient, MsgToServer } from "./auth.core";

//
//
//
//
//
//
//
//

type Module = AppServerModule<{
  Ctx: ServerCtx;
  MsgInCmd: null;
  MsgInEvent: ServerEvent;
  Model: ServerModel;
  Msg: ServerMsg;
  MsgOutCmd: ServerCmd<MsgToClient>;
  MsgOutEvent: ServerEvent;
  MsgToClient: MsgToClient;
  MsgToServer: MsgToServer;
}>;

//
//
//
// Model
//
//
//

export const init: Module["init"] = async (input) => {
  const { ctx } = input;
  const sms = await AuthServerSMS.init({ ...input, stored: null });

  return {
    model: {
      userIdBySessionId: StoreUserIdBySessionId(input.ctx).startingAt(ctx.now),
      sessionIdsByUserId: StoreSessionIdByUserId(input.ctx).startingAt(ctx.now),
      sms: sms.model,
    },
    eff: Eff.tag("sms", sms.eff),
    msgCmd: ServerCmd.tag("sms", sms.msgCmd),
    msgEvt: sms.msgEvt,
  };
};

//
//
//
// Update
//
//
//

export const update: Module["update"] = async (input) => {
  return AppServerModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromClient({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateChild({ ...input, model })
  );
};

export const toUserIdFromSessionId = async (
  ctx: ServerCtx,
  model: ServerModel,
  sessionId: SessionId
): Promise<UserId | null> => {
  return StoreUserIdBySessionId(ctx).get(model.userIdBySessionId, sessionId);
};

const updateChild: Module["update"] = async (input) => {
  const sms = await AuthServerSMS.update({
    ctx: input.ctx,
    model: input.model.sms,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgFromClient:
      input.msgFromClient?.t === "sms"
        ? { ...input.msgFromClient, ...input.msgFromClient.c }
        : null,
    msg: input.msg?.t === "sms" ? input.msg.c : null,
  });

  return {
    model: {
      ...input.model,
      sms: sms.model,
    },
    eff: Eff.tag("sms", sms.eff),
    msgCmd: ServerCmd.tag("sms", sms.msgCmd),
    msgEvt: sms.msgEvt,
  };
};

const updateFromMsg: Module["update"] = async ({ model, msg }) => {
  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "sms": {
      return { model };
    }
  }
};

const updateFromClient: Module["update"] = async ({ model, msgFromClient }) => {
  if (!msgFromClient) {
    return { model };
  }

  switch (msgFromClient.t) {
    case "logout": {
      return {
        model,
        msgEvt: [
          {
            t: "auth/client-unauthenticated",
            clientId: msgFromClient.clientId,
            sessionId: msgFromClient.sessionId,
          },
        ],
      };
    }

    case "sms": {
      return { model };
    }
  }
};

const updateFromEvent: typeof update = async ({ msgEvt, model, ctx }) => {
  if (!msgEvt) {
    return { model };
  }

  switch (msgEvt.t) {
    case "wire/client-connected": {
      const userId = await StoreUserIdBySessionId(ctx).get(
        model.userIdBySessionId,
        msgEvt.sessionId
      );

      if (!userId) {
        return {
          model: model,
          msgEvt: [
            {
              t: "auth/client-unauthenticated",
              clientId: msgEvt.clientId,
              sessionId: msgEvt.sessionId,
            },
          ],
        };
      }

      return {
        model: model,
        msgEvt: [
          {
            clientId: msgEvt.clientId,
            sessionId: msgEvt.sessionId,
            userId,
            t: "auth/client-authenticated",
          },
        ],
      };
    }

    case "auth/client-unauthenticated": {
      return {
        model: await dissocSession(ctx, model, msgEvt.sessionId),
        msgCmd: [
          sendMsgToClient([msgEvt.clientId], {
            t: "client-unauthenticated",
            sessionId: msgEvt.sessionId,
          }),
        ],
      };
    }

    case "auth/client-authenticated": {
      return {
        model: await assocSession(ctx, model, msgEvt.sessionId, msgEvt.userId),
        msgCmd: [
          sendMsgToClient([msgEvt.clientId], {
            t: "client-authenticated",
            userId: msgEvt.userId,
            sessionId: msgEvt.sessionId,
            loggedIn: true,
          }),
        ],
      };
    }

    default: {
      return { model };
    }
  }
};

//
//
//
//
//
//
//
//

async function assocSession(
  ctx: ServerCtx,
  model: ServerModel,
  sessionId: SessionId,
  userId: UserId
): Promise<ServerModel> {
  const userIdBySessionIdNew = await StoreUserIdBySessionId(ctx).assoc(
    ctx.now,
    model.userIdBySessionId,
    sessionId,
    userId
  );

  const sessionIds = await StoreSessionIdByUserId(ctx).get(
    model.sessionIdsByUserId,
    userId
  );

  const sessionIdsNew = {
    ...sessionIds,
    [sessionId]: sessionId,
  };

  const sessionIdByUserIdNew = await StoreSessionIdByUserId(ctx).assoc(
    ctx.now,
    model.sessionIdsByUserId,
    userId,
    sessionIdsNew
  );

  return {
    ...model,
    sessionIdsByUserId: sessionIdByUserIdNew,
    userIdBySessionId: userIdBySessionIdNew,
  };
}

async function dissocSession(
  ctx: ServerCtx,
  model: ServerModel,
  sessionId: SessionId
): Promise<ServerModel> {
  const userIdBySessionIdNew = await StoreUserIdBySessionId(ctx).dissoc(
    ctx.now,
    model.userIdBySessionId,
    sessionId
  );

  const userId = await StoreUserIdBySessionId(ctx).get(
    model.userIdBySessionId,
    sessionId
  );

  if (!userId) {
    return {
      ...model,
      userIdBySessionId: userIdBySessionIdNew,
    };
  }

  const sessionIdByUserIdNew = await StoreSessionIdByUserId(ctx).dissoc(
    ctx.now,
    model.sessionIdsByUserId,
    userId
  );

  return {
    ...model,
    sessionIdsByUserId: sessionIdByUserIdNew,
    userIdBySessionId: userIdBySessionIdNew,
  };
}

//
//
//
//
//
//
//
//

export const subscriptions: Module["subscriptions"] = async (input) => {
  return Sub.batch([
    Sub.tag(
      "sms",
      await AuthServerSMS.subscriptions({ ...input, model: input.model.sms })
    ),
  ]);
};
