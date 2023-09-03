import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ClientCtx, ViewCtx } from "gamezilla/app/@SHARED/client";
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
  msg,
  model,
}: {
  ctx: ClientCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  switch (msg.t) {
    default: {
      const result = handle({ ctx, msg, model });

      if (result.t === "err") {
        return {
          model,
          eff: Eff.None,
        };
      }

      const merged = mergeWithServer({
        ctx,
        serverModel: result.value,
        clientModel: model,
      });

      return {
        model: merged,
        eff: Eff.None,
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
  eff?: Eff<Msg>;
} => {
  if (msg.result.t === "err") {
    return { model };
  }

  const merged = mergeWithServer({
    ctx,
    clientModel: model,
    serverModel: msg.result.value,
  });

  return { model: merged };
};

export const mergeWithServer = ({
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
