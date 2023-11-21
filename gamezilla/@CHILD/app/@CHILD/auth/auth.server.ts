import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  AnonymousReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, isErr } from "gamezilla/@SHARED/core";
import * as AuthServerSMS from "./@CHILD/auth-sms/auth-sms.server";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./auth.core";
import {
  StoreSessionIdByUserId,
  StoreUserIdBySessionId,
} from "./@SHARED/server/auth-session-store";

//
//
//
// Model
//
//
//

export const init = ({ ctx }: { ctx: ServerCtx }): { model: ServerModel } => {
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

export const update = async ({
  ctx,
  model,
  msg,
}: {
  msg: ServerMsg;
  model: ServerModel;
  ctx: ServerCtx;
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  evt?: ServerEvt[];
  eff?: Eff<ServerMsg>;
}> => {
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
            t: "auth/client-authenticated",
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

export const updateFromClient = async ({
  ctx,
  model,
  msg,
}: {
  ctx: AnonymousReqCtx;
  msg: ToServer;
  model: ServerModel;
}): Promise<{
  model: ServerModel;
  evt?: ServerEvt[];
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
}> => {
  switch (msg.t) {
    case "logout": {
      const modelNew = await removeSession(ctx, model, ctx.sessionId);

      return {
        model: modelNew,
        evt: [
          {
            t: "auth/client-unauthenticated",
            clientId: ctx.clientId,
            sessionId: ctx.sessionId,
          },
        ],
      };
    }

    case "sms": {
      const updated = AuthServerSMS.updateFromClient({
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
      const userId = await StoreUserIdBySessionId.latest(
        model.userIdBySessionId,
        evt.sessionId
      );

      if (!userId) {
        return {
          model: model,
          evt: [
            {
              t: "auth/client-unauthenticated",
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
            t: "auth/client-authenticated",
            userId,
          },
        ],
      };
    }

    case "auth/client-authenticated": {
      if (evt.loggedIn) {
        return {
          model: await addSession(ctx, model, evt.sessionId, evt.userId),
          cmd: [sendToClient([evt.clientId], evt)],
        };
      }
      return {
        model: model,
        cmd: [sendToClient([evt.clientId], evt)],
      };
    }

    case "auth/client-unauthenticated": {
      return {
        model: model,
        cmd: [sendToClient([evt.clientId], evt)],
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

  const userId = await StoreUserIdBySessionId.latest(
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
