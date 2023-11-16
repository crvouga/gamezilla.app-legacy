import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  AnonymousReqCtx,
  DbConnSql,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, PhoneNumber, Result, ok } from "gamezilla/@SHARED/core";
import { createAccountDb } from "../../@SHARED/auth-server/account-db";
import { Account } from "../../auth.core";
import { VerifySMS } from "./auth-sms-server/verify-sms/verify-sms-impl";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./auth-sms.core";

export const init: ServerModel = {
  verifications: {},
};

export const update = ({
  msg,
  model,
  ctx,
}: {
  ctx: ServerCtx;
  msg: ServerMsg;
  model: ServerModel;
}): {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
  evt?: ServerEvt[];
} => {
  switch (msg.t) {
    case "verified-code": {
      if (msg.result.t === "err") {
        return {
          model,
          cmd: [sendToClient([msg.clientId], msg)],
        };
      }

      return {
        model,
        cmd: [sendToClient([msg.clientId], msg)],
        eff: async (dispatch) => {
          const found = await findElseInsertAccount({
            dbConn: ctx.dbConn,
            phoneNumber: msg.phoneNumber,
          });

          dispatch({
            t: "got-user-account",
            result: found,
            clientId: msg.clientId,
            sessionId: msg.sessionId,
          });
        },
      };
    }

    case "got-user-account": {
      if (msg.result.t === "err") {
        console.log(msg.result);
        return {
          model,
        };
      }
      return {
        model,
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

    case "sent-code": {
      return {
        model,
        cmd: [sendToClient([msg.clientId], msg)],
      };
    }
  }
};

const findElseInsertAccount = async ({
  dbConn,
  phoneNumber,
}: {
  dbConn: DbConnSql;
  phoneNumber: PhoneNumber;
}): Promise<Result<string, Account>> => {
  const accountDb = createAccountDb({ dbConn });

  const found = await accountDb.findOneByPhoneNumber({ phoneNumber });

  if (found.t === "err") {
    console.error(found);
    return found;
  }

  const maybeAccount = found.value;

  if (maybeAccount) {
    return ok(maybeAccount);
  }

  const accountNew: Account = {
    userId: UserId.generate(),
    phoneNumber,
  };

  const inserted = await accountDb.insertOne({ account: accountNew });

  if (inserted.t === "err") {
    return inserted;
  }

  return ok(accountNew);
};

export const updateFromClient = ({
  msg,
  model,
  ctx,
}: {
  msg: ToServer;
  model: ServerModel;
  ctx: AnonymousReqCtx;
}): {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
} => {
  switch (msg.t) {
    case "send-code": {
      return {
        model,
        eff: async (dispatch) => {
          const sent = await VerifySMS("test").sendCode({
            phoneNumber: msg.phoneNumber,
          });

          dispatch({
            t: "sent-code",
            phoneNumber: msg.phoneNumber,
            result: sent,
            clientId: ctx.clientId,
          });
        },
      };
    }

    case "verify-code": {
      return {
        model,
        eff: async (dispatch) => {
          const verified = await VerifySMS("test").verifyCode({
            phoneNumber: msg.phoneNumber,
            code: msg.code,
          });

          dispatch({
            t: "verified-code",
            phoneNumber: msg.phoneNumber,
            clientId: ctx.clientId,
            result: verified,
            sessionId: ctx.sessionId,
          });
        },
      };
    }
  }
};
