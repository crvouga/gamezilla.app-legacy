import {
  AnonymousReqCtx,
  ServerCmd,
  ServerEvt,
  sendToClient,
} from "gamezilla/app/@SHARED/server";
import {
  ServerModel,
  ServerMsg,
  SocialLoginState,
  ToClient,
  ToServer,
} from "./auth.core";

//
//
//
// Model
//
//
//

export const init: ServerModel = {
  sessions: {},
  socialLogin: {},
  verifications: {},
};

//
//
//
// Update
//
//
//

export const update = ({
  model,
}: {
  msg: ServerMsg;
  model: ServerModel;
}): {
  model: ServerModel;
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
  model: ServerModel;
}): {
  model: ServerModel;
  evt?: ServerEvt[];
  cmd?: ServerCmd<ToClient>[];
} => {
  switch (msg.t) {
    case "started-social-login": {
      return {
        model: {
          ...model,
          socialLogin: {
            ...model.socialLogin,
            [ctx.sessionId]: {
              sessionId: ctx.sessionId,
              t: "in-progress",
            },
          },
        },
      };
    }

    case "got-social-login-result": {
      const socialLogin = model.socialLogin[ctx.sessionId];
      if (!socialLogin) {
        return { model };
      }

      const userId = msg.result.t === "ok" ? msg.result.value : null;

      const socialLoginNew: SocialLoginState = {
        t: "done",
        sessionId: ctx.sessionId,
        userId: userId,
      };
      const socialLoginsNew = {
        ...model.socialLogin,
        [socialLoginNew.sessionId]: socialLoginNew,
      };

      if (userId) {
        const sessionsNew = {
          ...model.sessions,
          [ctx.sessionId]: {
            sessionId: ctx.sessionId,
            userId,
          },
        };
        return {
          model: {
            ...model,
            socialLogin: socialLoginsNew,
            sessions: sessionsNew,
          },
          evt: [
            {
              t: "client-authenticated",
              clientId: ctx.clientId,
              sessionId: ctx.sessionId,
              userId,
              loggedIn: true,
            },
          ],
        };
      }

      return {
        model: {
          ...model,
          socialLogin: socialLoginsNew,
        },
        evt: [
          {
            t: "client-unauthenticated",
            clientId: ctx.clientId,
            sessionId: ctx.sessionId,
          },
        ],
      };
    }

    case "logout": {
      const sessionsNew = { ...model.sessions };
      delete sessionsNew[ctx.sessionId];
      return {
        model: {
          ...model,
          sessions: sessionsNew,
        },
        evt: [
          {
            t: "client-unauthenticated",
            clientId: ctx.clientId,
            sessionId: ctx.sessionId,
          },
        ],
      };
    }
  }
};

export const updateFromEvt = ({
  msg: evt,
  model,
}: {
  msg: ServerEvt;
  model: ServerModel;
}): {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
} => {
  switch (evt.t) {
    case "client-connected": {
      const socialLoginState = model.socialLogin[evt.sessionId];

      if (socialLoginState?.t === "in-progress") {
        return {
          model,
          cmd: [sendToClient([evt.clientId], { t: "get-social-login-result" })],
        };
      }

      const session = model.sessions[evt.sessionId];
      if (!session) {
        return {
          model,
          cmd: [sendToClient([evt.clientId], { t: "client-unauthenticated" })],
        };
      }

      const userId = session.userId;

      if (!userId) {
        return {
          model,
          cmd: [sendToClient([evt.clientId], { t: "client-unauthenticated" })],
        };
      }

      return {
        model,
        cmd: [
          sendToClient([evt.clientId], { t: "client-authenticated", userId }),
        ],
      };
    }

    case "client-authenticated": {
      return { model, cmd: [sendToClient([evt.clientId], evt)] };
    }

    case "client-unauthenticated": {
      return { model, cmd: [sendToClient([evt.clientId], evt)] };
    }

    default: {
      return { model };
    }
  }
};
