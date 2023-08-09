import { ClientCtx, ViewCtx } from "src/app/@/client";
import { Cmd, Sub } from "src/core";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
  handle,
  initShared,
} from "./vs-bot.core";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = initShared;

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  ctx,
  sendToServer,
  msg,
  model,
}: {
  ctx: ClientCtx;
  sendToServer: (m: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    default: {
      const result = handle({ ctx, msg, model });

      if (result.t === "err") {
        return {
          model,
          cmd: sendToServer(msg),
        };
      }

      const merged = syncWithServer({
        ctx,
        serverModel: result.value,
        clientModel: model,
      });

      return {
        model: merged,
        cmd: sendToServer(msg),
      };
    }
  }
};

export const updateFromServer = ({
  msg,
  model,
  ctx,
}: {
  ctx: ClientCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.result.t === "err") {
    return { model };
  }

  const merged = syncWithServer({
    ctx,
    clientModel: model,
    serverModel: msg.result.value,
  });

  return { model: merged };
};

export const syncWithServer = ({
  serverModel,
  clientModel,
}: {
  ctx: ClientCtx;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  return { ...clientModel, ...serverModel };
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_ctx: ClientCtx, model: Model): Sub<Msg> => {
  switch (model.type) {
    case "game": {
      return Sub.None;
    }

    case "setup": {
      return Sub.None;
    }
  }
};

//
//
//
// view
//
//
//

export const View = (_props: {
  model: Model;
  ctx: ViewCtx;
  dispatch: (m: Msg) => void;
  onBack: () => void;
}) => {
  return <div></div>;
};
