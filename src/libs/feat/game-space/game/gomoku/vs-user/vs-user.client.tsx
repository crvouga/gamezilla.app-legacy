import { ViewCtx } from "@gamezilla/shared/client";
import { Cmd, Sub } from "@gamezilla/core";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
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
  sendToServer,
}: {
  sendToServer: (m: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "clicked-cancel") {
    return { model: { ...model, confirming: undefined } };
  }

  if (msg.t === "resign") {
    if (model.confirming === "resign") {
      return { model, cmd: sendToServer(msg) };
    }

    return { model: { ...model, confirming: "resign" } };
  }

  return { model, cmd: sendToServer(msg) };
};

export const updateFromServer = ({
  msg,
  model,
}: {
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "input-move") {
    if (msg.result.t === "err") {
      return { model };
    }
    const merged = syncWithServer({
      serverModel: msg.result.value,
      clientModel: model,
    });

    return { model: merged };
  }

  if (msg.result.t === "err") {
    return { model };
  }

  const merged = syncWithServer({
    serverModel: msg.result.value,
    clientModel: model,
  });

  return { model: merged };
};

export const syncWithServer = ({
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
