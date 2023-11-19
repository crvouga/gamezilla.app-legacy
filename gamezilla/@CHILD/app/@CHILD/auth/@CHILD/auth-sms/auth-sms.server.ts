import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  AnonymousReqCtx,
  DbConnSql,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, PhoneNumber, Result, isErr, ok } from "gamezilla/@SHARED/core";
import { AccountDb } from "../../@SHARED/server/account-db/account-db-impl";
import { Account } from "../../auth.core";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./auth-sms.core";
import { VerifySMS } from "./server/verify-sms/verify-sms-impl";

export const init: ServerModel = null;

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
      if (isErr(msg.result)) {
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
      if (isErr(msg.result)) {
        return {
          model,
          eff: () => {
            console.log(msg.result);
          },
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
  const verifySMS = VerifySMS({
    logger: ctx.logger,
    impl: "test",
  });
  switch (msg.t) {
    case "send-code": {
      return {
        model,
        eff: async (dispatch) => {
          dispatch({
            t: "sent-code",
            phoneNumber: msg.phoneNumber,
            result: await verifySMS.sendCode(msg),
            clientId: ctx.clientId,
          });
        },
      };
    }

    case "verify-code": {
      return {
        model,
        eff: async (dispatch) => {
          dispatch({
            t: "verified-code",
            phoneNumber: msg.phoneNumber,
            clientId: ctx.clientId,
            result: await verifySMS.verifyCode(msg),
            sessionId: ctx.sessionId,
          });
        },
      };
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
//

const findElseInsertAccount = async ({
  dbConn,
  phoneNumber,
}: {
  dbConn: DbConnSql;
  phoneNumber: PhoneNumber;
}): Promise<Result<string, Account>> => {
  const accountDb = AccountDb({ dbConn });

  const found = await accountDb.findOneByPhoneNumber({ phoneNumber });

  if (isErr(found)) {
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

  if (isErr(inserted)) {
    return inserted;
  }

  return ok(accountNew);
};
