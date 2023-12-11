import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Sub, chainAwait, isErr } from "gamezilla/@SHARED/core";
import { ServerModule } from "../../@SHARED/architecture/app-server";
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

type Module = ServerModule<{
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

export const init: Module["init"] = async ({ ctx }) => {
  return {
    model: {
      userIdBySessionId: StoreUserIdBySessionId.startingAt(ctx.now),
      sessionIdByUserId: StoreSessionIdByUserId.startingAt(ctx.now),
      sms: AuthServerSMS.init,
    },
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
  if (input.msg) {
    return updateFromMsg(input);
  }

  if (input.fromClient) {
    return updateFromClient(input);
  }

  return { model: input.model };
};

export const updateFromMsg: Module["update"] = async ({ ctx, model, msg }) => {
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
      const updated = AuthServerSMS.update({
        model: model.sms,
        msg: msg.c,
        ctx,
      });

      return {
        model: {
          ...model,
          sms: updated.model,
        },
        cmd: ServerCmd.tag("sms", updated.cmd),
        eff: Eff.t("sms", updated.eff),
        evt: updated.evt,
      };
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
      const updated = AuthServerSMS.updateFromClient({
        model: model.sms,
        msg: fromClient.c,
        ctx: {
          ...ctx,
          sessionId: fromClient.sessionId,
          clientId: fromClient.clientId,
        },
      });

      return {
        model: {
          ...model,
          sms: updated.model,
        },
        cmd: ServerCmd.tag("sms", updated.cmd),
        eff: Eff.t("sms", updated.eff),
      };
    }
  }
};

export const updateFromEvent = async ({
  msg: evt,
  model,
  ctx,
}: {
  ctx: ServerCtx;
  msg: ServerEvt;
  model: ServerModel;
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  evt?: ServerEvt[];
}> => {
  switch (evt.t) {
    case "wire/client-connected": {
      const userId = await StoreUserIdBySessionId.get(
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
      return chainAwait(
        { model },
        async (model) => {
          if (evt.loggedIn) {
            return {
              model: await addSession(ctx, model, evt.sessionId, evt.userId),
            };
          }
          return { model };
        },

        (model) => {
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
  const userIdBySessionIdNew = await StoreUserIdBySessionId.assoc(
    ctx.now,
    model.userIdBySessionId,
    sessionId,
    userId
  );

  const sessionIdByUserIdNew = await StoreSessionIdByUserId.assoc(
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
  const userIdBySessionIdNew = await StoreUserIdBySessionId.dissoc(
    ctx.now,
    model.userIdBySessionId,
    sessionId
  );

  const userId = await StoreUserIdBySessionId.get(
    model.userIdBySessionId,
    sessionId
  );

  if (!userId) {
    return {
      ...model,
      userIdBySessionId: userIdBySessionIdNew,
    };
  }

  const sessionIdByUserIdNew = await StoreSessionIdByUserId.dissoc(
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

export const subscriptions: Module["subscriptions"] = async () => {
  return Sub.None;
};
