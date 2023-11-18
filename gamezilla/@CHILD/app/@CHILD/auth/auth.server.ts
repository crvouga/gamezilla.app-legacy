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

//
//
//
// Model
//
//
//

export const init = (): { model: ServerModel } => {
  return {
    model: {
      userIdBySessionId: {},
      sessionIdByUserId: {},
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

export const update = ({
  ctx,
  model,
  msg,
}: {
  msg: ServerMsg;
  model: ServerModel;
  ctx: ServerCtx;
}): {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  evt?: ServerEvt[];
  eff?: Eff<ServerMsg>;
} => {
  switch (msg.t) {
    case "got-user-account": {
      if (isErr(msg.result)) {
        console.error(msg.result.error);
        return {
          model,
        };
      }

      return {
        model: {
          ...model,
          userIdBySessionId: {
            ...model.userIdBySessionId,
            [msg.sessionId]: {
              sessionId: msg.sessionId,
              userId: msg.result.value.userId,
            },
          },
        },
        evt: [
          {
            t: "client-authenticated",
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

export const updateFromClient = ({
  ctx,
  model,
  msg,
}: {
  ctx: AnonymousReqCtx;
  msg: ToServer;
  model: ServerModel;
}): {
  model: ServerModel;
  evt?: ServerEvt[];
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
} => {
  switch (msg.t) {
    case "logout": {
      const modelNew = removeSession(model, ctx.sessionId);

      return {
        model: modelNew,
        evt: [
          {
            t: "client-unauthenticated",
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

export const updateFromEvent = ({
  msg: evt,
  model,
}: {
  msg: ServerEvt;
  model: ServerModel;
}): {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  evt?: ServerEvt[];
} => {
  switch (evt.t) {
    case "client-connected": {
      const userId = model.userIdBySessionId[evt.sessionId];

      if (!userId) {
        return {
          model,
          evt: [
            {
              t: "client-unauthenticated",
              clientId: evt.clientId,
              sessionId: evt.sessionId,
            },
          ],
        };
      }

      return {
        model,
        evt: [
          {
            ...evt,
            t: "client-authenticated",
            userId,
          },
        ],
      };
    }

    case "client-authenticated": {
      const modelNew = addSession(model, evt);

      return {
        model: modelNew,
        cmd: [sendToClient([evt.clientId], evt)],
      };
    }

    case "client-unauthenticated": {
      const modelNew = removeSession(model, evt.sessionId);
      return {
        model: modelNew,
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

function addSession(
  model: ServerModel,
  { sessionId, userId }: { sessionId: SessionId; userId: UserId }
): ServerModel {
  const userIdBySessionIdNew: ServerModel["userIdBySessionId"] = {
    ...model.userIdBySessionId,
    [sessionId]: userId,
  };
  const sessionIdByUserIdNew: ServerModel["sessionIdByUserId"] = {
    ...model.sessionIdByUserId,
    [userId]: sessionId,
  };

  return {
    ...model,
    sessionIdByUserId: sessionIdByUserIdNew,
    userIdBySessionId: userIdBySessionIdNew,
  };
}

function removeSession(model: ServerModel, sessionId: SessionId): ServerModel {
  const userIdBySessionIdNew = { ...model.userIdBySessionId };
  delete userIdBySessionIdNew[sessionId];

  const sessionIdByUserIdNew = { ...model.sessionIdByUserId };
  const userId = model.userIdBySessionId[sessionId];
  if (userId) {
    delete sessionIdByUserIdNew[userId];
  }

  return {
    ...model,
    sessionIdByUserId: sessionIdByUserIdNew,
    userIdBySessionId: userIdBySessionIdNew,
  };
}
