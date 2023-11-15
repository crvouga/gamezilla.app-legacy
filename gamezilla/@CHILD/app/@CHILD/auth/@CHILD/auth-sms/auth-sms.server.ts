import {
  AnonymousReqCtx,
  ServerCmd,
  sendToClient,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff } from "gamezilla/@SHARED/core";
import { VerifySMS } from "./auth-sms-server/verify-sms/verify-sms-impl";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./auth-sms.core";

export const init: ServerModel = {
  verifications: {},
};

export const update = ({
  msg,
  model,
}: {
  msg: ServerMsg;
  model: ServerModel;
}): {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
} => {
  switch (msg.t) {
    case "verified-code": {
      return {
        model,
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
  }
};
