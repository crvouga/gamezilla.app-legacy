import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server";
import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvent,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Sub } from "gamezilla/@SHARED/core";
import * as AuthServerSMS from "./@CHILD/auth-sms/auth-sms.server";
import {
  StoreSessionIdByUserId,
  StoreUserIdBySessionId,
} from "./@SHARED/server/auth-session-store";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./auth.core";

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
  InCmd: null;
  InEvent: ServerEvent;
  Model: ServerModel;
  Msg: ServerMsg;
  OutCmd: ServerCmd<ToClient>;
  OutEvent: ServerEvent;
  ToClient: ToClient;
  ToServer: ToServer;
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
    cmd: ServerCmd.tag("sms", sms.cmd),
    msgEvent: sms.msgEvent,
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
    cmd: input.cmd,
    msgEvent: input.msgEvent,
    fromClient:
      input.fromClient?.t === "sms"
        ? { ...input.fromClient, ...input.fromClient.c }
        : null,
    msg: input.msg?.t === "sms" ? input.msg.c : null,
  });

  return {
    model: {
      ...input.model,
      sms: sms.model,
    },
    eff: Eff.tag("sms", sms.eff),
    cmd: ServerCmd.tag("sms", sms.cmd),
    msgEvent: sms.msgEvent,
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

const updateFromClient: Module["update"] = async ({ model, fromClient }) => {
  if (!fromClient) {
    return { model };
  }

  switch (fromClient.t) {
    case "logout": {
      return {
        model,
        msgEvent: [
          {
            t: "auth/client-unauthenticated",
            clientId: fromClient.clientId,
            sessionId: fromClient.sessionId,
          },
        ],
      };
    }

    case "sms": {
      return { model };
    }
  }
};

const updateFromEvent: typeof update = async ({ msgEvent, model, ctx }) => {
  if (!msgEvent) {
    return { model };
  }

  switch (msgEvent.t) {
    case "wire/client-connected": {
      const userId = await StoreUserIdBySessionId(ctx).get(
        model.userIdBySessionId,
        msgEvent.sessionId
      );

      if (!userId) {
        return {
          model: model,
          msgEvent: [
            {
              t: "auth/client-unauthenticated",
              clientId: msgEvent.clientId,
              sessionId: msgEvent.sessionId,
            },
          ],
        };
      }

      return {
        model: model,
        msgEvent: [
          {
            clientId: msgEvent.clientId,
            sessionId: msgEvent.sessionId,
            userId,
            t: "auth/client-authenticated",
          },
        ],
      };
    }

    case "auth/client-unauthenticated": {
      return {
        model: await dissocSession(ctx, model, msgEvent.sessionId),
        cmd: [
          sendToClient([msgEvent.clientId], {
            t: "client-unauthenticated",
            sessionId: msgEvent.sessionId,
          }),
        ],
      };
    }

    case "auth/client-authenticated": {
      return {
        model: await assocSession(
          ctx,
          model,
          msgEvent.sessionId,
          msgEvent.userId
        ),
        cmd: [
          sendToClient([msgEvent.clientId], {
            t: "client-authenticated",
            userId: msgEvent.userId,
            sessionId: msgEvent.sessionId,
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
