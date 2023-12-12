import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server";
import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Sub, isErr } from "gamezilla/@SHARED/core";
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
  InCmd: {};
  InEvt: ServerEvt;
  Model: ServerModel;
  Msg: ServerMsg;
  OutCmd: ServerCmd<ToClient>;
  OutEvt: ServerEvt;
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
      sessionIdByUserId: StoreSessionIdByUserId(input.ctx).startingAt(ctx.now),
      sms: sms.model,
    },
    eff: Eff.t("sms", sms.eff),
    cmd: ServerCmd.tag("sms", sms.cmd),
    evt: sms.evt,
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
    (model) => updateFromEvt({ ...input, model }),
    (model) => updateChild({ ...input, model })
  );
};

const updateChild: Module["update"] = async (input) => {
  const sms = await AuthServerSMS.update({
    ctx: input.ctx,
    model: input.model.sms,
    cmd: input.cmd,
    evt: input.evt,
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
    eff: Eff.t("sms", sms.eff),
    cmd: ServerCmd.tag("sms", sms.cmd),
    evt: sms.evt,
  };
};

const updateFromMsg: Module["update"] = async ({ ctx, model, msg }) => {
  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "got-user-account": {
      if (isErr(msg.result)) {
        console.error(msg.result.error);
        return {
          model,
        };
      }

      const modelNew = await addSession(
        ctx,
        model,
        msg.sessionId,
        msg.result.value.userId
      );

      return {
        model: modelNew,
        evt: [
          {
            t: "auth/connected-client-authenticated",
            clientId: msg.clientId,
            sessionId: msg.sessionId,
            userId: msg.result.value.userId,
            loggedIn: true,
          },
        ],
      };
    }

    case "sms": {
      return { model };
    }
  }
};

const updateFromClient: Module["update"] = async ({
  ctx,
  model,
  fromClient,
}) => {
  if (!fromClient) {
    return { model };
  }

  switch (fromClient.t) {
    case "logout": {
      const modelNew = await removeSession(ctx, model, fromClient.sessionId);

      return {
        model: modelNew,
        evt: [
          {
            t: "auth/connected-client-unauthenticated",
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

const updateFromEvt: typeof update = async ({ evt, model, ctx }) => {
  if (!evt) {
    return { model };
  }

  switch (evt.t) {
    case "wire/client-connected": {
      const userId = await StoreUserIdBySessionId(ctx).get(
        model.userIdBySessionId,
        evt.sessionId
      );

      if (!userId) {
        return {
          model: model,
          evt: [
            {
              t: "auth/connected-client-unauthenticated",
              clientId: evt.clientId,
              sessionId: evt.sessionId,
            },
          ],
        };
      }

      return {
        model: model,
        evt: [
          {
            ...evt,
            t: "auth/connected-client-authenticated",
            userId,
          },
        ],
      };
    }

    case "auth/connected-client-authenticated": {
      return AppServerModule.chainUpdates(
        { model },
        async (model) => {
          if (evt.loggedIn) {
            return {
              model: await addSession(ctx, model, evt.sessionId, evt.userId),
            };
          }
          return { model };
        },
        async (model) => {
          return {
            model,
            cmd: [
              sendToClient([evt.clientId], {
                t: "auth/client-authenticated",
                userId: evt.userId,
                sessionId: evt.sessionId,
                loggedIn: true,
              }),
            ],
          };
        }
      );
    }

    case "auth/connected-client-unauthenticated": {
      return {
        model: model,
        cmd: [
          sendToClient([evt.clientId], {
            t: "auth/client-unauthenticated",
            sessionId: evt.sessionId,
          }),
        ],
      };
    }

    default: {
      return { model };
    }
  }
};

export const updateFromCmd = ({
  cmd,
  model,
}: {
  cmd: ServerCmd<ToClient>;
  model: ServerModel;
}): {
  model: ServerModel;
  evt?: ServerEvt[];
} => {
  switch (cmd.t) {
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

async function addSession(
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

  const sessionIdByUserIdNew = await StoreSessionIdByUserId(ctx).assoc(
    ctx.now,
    model.sessionIdByUserId,
    userId,
    sessionId
  );

  return {
    ...model,
    sessionIdByUserId: sessionIdByUserIdNew,
    userIdBySessionId: userIdBySessionIdNew,
  };
}

async function removeSession(
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
    model.sessionIdByUserId,
    userId
  );

  return {
    ...model,
    sessionIdByUserId: sessionIdByUserIdNew,
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
