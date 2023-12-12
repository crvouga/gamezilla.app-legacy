import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  DbConnSql,
  ServerCmd,
  ServerCtx,
  ServerEvt,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { PhoneNumber, Result, Sub, isErr, ok } from "gamezilla/@SHARED/core";
import { AccountDb } from "../../@SHARED/server/account-db/account-db-impl";
import { Account } from "../../auth.core";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./auth-sms.core";
import { VerifySMS } from "./server/verify-sms/verify-sms-impl";

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
//
//
//

export const init: Module["init"] = async () => {
  return {
    model: null,
  };
};

//
//
//
//
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

const updateFromMsg: Module["update"] = async ({ msg, model, ctx }) => {
  if (!msg) {
    return { model };
  }

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
            t: "auth/connected-client-authenticated",
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

export const updateFromClient: Module["update"] = async ({
  fromClient,
  model,
  ctx,
}) => {
  if (!fromClient) {
    return { model };
  }

  const verifySMS = VerifySMS({
    logger: ctx.logger,
    impl: "test",
  });
  switch (fromClient.t) {
    case "send-code": {
      return {
        model,
        eff: async (dispatch) => {
          dispatch({
            t: "sent-code",
            phoneNumber: fromClient.phoneNumber,
            result: await verifySMS.sendCode(fromClient),
            clientId: fromClient.clientId,
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
            phoneNumber: fromClient.phoneNumber,
            clientId: fromClient.clientId,
            result: await verifySMS.verifyCode(fromClient),
            sessionId: fromClient.sessionId,
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

export const subscriptions: Module["subscriptions"] = async () => {
  return Sub.None;
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
    userId: UserId.generate$(),
    phoneNumber,
  };

  const inserted = await accountDb.insertOne({ account: accountNew });

  if (isErr(inserted)) {
    return inserted;
  }

  return ok(accountNew);
};
