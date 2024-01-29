import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  DbConnSql,
  ServerCmd,
  ServerCtx,
  ServerEvent,
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
  return AppServerModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromClient({ ...input, model })
  );
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
          msgCmd: [sendToClient([msg.clientId], msg)],
        };
      }

      const found = await findElseInsertAccount({
        dbConn: ctx.dbConn,
        phoneNumber: msg.phoneNumber,
      });

      if (found.t === "err") {
        return {
          model,
          msgCmd: [sendToClient([msg.clientId], msg)],
        };
      }

      return {
        model,
        msgCmd: [sendToClient([msg.clientId], msg)],
        msgEvent: [
          {
            t: "auth/client-authenticated",
            clientId: msg.clientId,
            sessionId: msg.sessionId,
            userId: found.value.userId,
            loggedIn: true,
          },
        ],
      };
    }

    case "sent-code": {
      return {
        model,
        msgCmd: [sendToClient([msg.clientId], msg)],
      };
    }
  }
};

export const updateFromClient: Module["update"] = async ({
  msgFromClient,
  model,
  ctx,
}) => {
  if (!msgFromClient) {
    return { model };
  }

  const verifySMS = VerifySMS({
    logger: ctx.logger,
    impl: "test",
  });

  switch (msgFromClient.t) {
    case "send-code": {
      return {
        model,
        eff: async (emit) => {
          emit({
            t: "sent-code",
            phoneNumber: msgFromClient.phoneNumber,
            result: await verifySMS.sendCode(msgFromClient),
            clientId: msgFromClient.clientId,
          });
        },
      };
    }

    case "verify-code": {
      return {
        model,
        eff: async (emit) => {
          emit({
            t: "verified-code",
            phoneNumber: msgFromClient.phoneNumber,
            clientId: msgFromClient.clientId,
            result: await verifySMS.verifyCode(msgFromClient),
            sessionId: msgFromClient.sessionId,
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
