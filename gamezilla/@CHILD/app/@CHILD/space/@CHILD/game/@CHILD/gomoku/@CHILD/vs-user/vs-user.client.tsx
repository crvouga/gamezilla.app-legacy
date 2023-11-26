import { ViewCtx } from "gamezilla/@CHILD/app/@SHARED/client";
import { Eff, Sub } from "gamezilla/@SHARED/core";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  initShared,
} from "./vs-user.core";

//
//
//
// model
//
//
//

export type Model = ClientModel;

export const init = initShared;

//
//
//
// update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  if (msg.t === "clicked-cancel") {
    return { model: { ...model, confirming: undefined } };
  }

  if (msg.t === "resign") {
    if (model.confirming === "resign") {
      return { model, eff: Eff.None };
    }

    return { model: { ...model, confirming: "resign" } };
  }

  return { model, eff: Eff.None };
};

export const updateFromServer = ({
  msg,
  model,
}: {
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  if (msg.t === "input-move") {
    if (msg.result.t === "err") {
      return { model };
    }
    const merged = mergeWithServer({
      serverModel: msg.result.value,
      clientModel: model,
    });

    return { model: merged };
  }

  if (msg.result.t === "err") {
    return { model };
  }

  const merged = mergeWithServer({
    serverModel: msg.result.value,
    clientModel: model,
  });

  return { model: merged };
};

export const mergeWithServer = ({
  serverModel,
}: {
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  return serverModel;
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
//
// view
//
//
//

export const View = (_props: {
  dispatch: (m: Msg) => void;
  ctx: ViewCtx;
  model: Model;
  onCancel: () => void;
}) => {
  return <div></div>;
};
