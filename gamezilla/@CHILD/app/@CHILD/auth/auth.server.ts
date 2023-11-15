import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  AnonymousReqCtx,
  DbConnSql,
  sendToClient,
  ServerCmd,
  ServerCtx,
  ServerEvt,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, EmailAddress, ok, Result } from "gamezilla/@SHARED/core";
import { createAccountDb } from "./@SHARED/auth-server/account-db";
import * as AuthServerSMS from "./@CHILD/auth-sms/auth-sms.server";
import {
  Account,
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
  socialLoginStates: {},
  sms: AuthServerSMS.init,
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
      if (msg.result.t === "err") {
        console.error(msg.result.error);
        return { model };
      }

      return {
        model: {
          ...model,
          sessions: {
            ...model.sessions,
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
    case "started-social-login": {
      return {
        model: {
          ...model,
          socialLoginStates: {
            ...model.socialLoginStates,
            [ctx.sessionId]: {
              sessionId: ctx.sessionId,
              t: "in-progress",
            },
          },
        },
      };
    }

    case "got-social-login-result": {
      const socialLogin = model.socialLoginStates[ctx.sessionId];

      if (!socialLogin) {
        return { model };
      }

      const emailAddress = msg.result.t === "ok" ? msg.result.value : null;

      const socialLoginNew: SocialLoginState = {
        t: "done",
        sessionId: ctx.sessionId,
        emailAddress,
      };

      const socialLoginsNew = {
        ...model.socialLoginStates,
        [socialLoginNew.sessionId]: socialLoginNew,
      };

      if (emailAddress) {
        return {
          model: {
            ...model,
            socialLoginStates: socialLoginsNew,
          },
          eff: async (dispatch) => {
            const result = await findElseInsertAccount({
              emailAddress,
              dbConn: ctx.dbConn,
            });
            dispatch({
              t: "got-user-account",
              result,
              sessionId: ctx.sessionId,
              clientId: ctx.clientId,
            });
          },
        };
      }

      return {
        model: {
          ...model,
          socialLoginStates: socialLoginsNew,
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

const findElseInsertAccount = async ({
  dbConn,
  emailAddress,
}: {
  dbConn: DbConnSql;
  emailAddress: EmailAddress;
}): Promise<Result<string, Account>> => {
  const accountDb = createAccountDb({ dbConn });

  const found = await accountDb.findOneByEmail({ emailAddress });

  if (found.t === "err") {
    return found;
  }

  const maybeAccount = found.value;

  if (maybeAccount) {
    return ok(maybeAccount);
  }

  const accountNew: Account = {
    userId: UserId.generate(),
    emailAddress,
  };

  const inserted = await accountDb.insertOne({ account: accountNew });

  if (inserted.t === "err") {
    return inserted;
  }

  return ok(accountNew);
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
      const socialLoginState = model.socialLoginStates[evt.sessionId];

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
          evt: [
            {
              t: "client-unauthenticated",
              clientId: evt.clientId,
              sessionId: evt.sessionId,
            },
          ],
        };
      }

      const userId = session.userId;

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
            t: "client-authenticated",
            clientId: evt.clientId,
            sessionId: evt.sessionId,
            userId,
          },
        ],
      };
    }

    case "client-authenticated": {
      return {
        model: {
          ...model,
          sessions: {
            ...model.sessions,
            [evt.sessionId]: {
              sessionId: evt.sessionId,
              userId: evt.userId,
            },
          },
        },
        cmd: [sendToClient([evt.clientId], evt)],
      };
    }

    case "client-unauthenticated": {
      return { model, cmd: [sendToClient([evt.clientId], evt)] };
    }

    default: {
      return { model };
    }
  }
};
