import { SpaceRequestCtx } from "@gamezilla/shared/server";
import { Cmd, Sub } from "@gamezilla/shared/core";
import { SpaceMsg } from "@gamezilla/shared/client";
import {
  ServerModel,
  ServerMsg,
  Res,
  ToServer,
  ToClient,
  handle,
  initShared,
} from "./vs-user.shared";

//
//
//
// model
//
//
//

export type Model = ServerModel;

export const init = initShared;

//
//
//
// update
//
//
//

export type Msg = ServerMsg;

export const update = ({
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return { model };
};

export const updateFromClient = ({
  sendToClient,
  broadcast,
  msg,
  model,
  ctx,
}: {
  ctx: SpaceRequestCtx;
  msg: ToServer;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
  sendToClient: (m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const res: Res = { ...msg, result: handle({ msg, model, ctx }) };

  if (res.result.t === "err") {
    return { model, cmd: sendToClient(res) };
  }
  return { model: res.result.value, cmd: broadcast(res) };
};

export const updateFromSpace = ({
  msg,
  model,
}: {
  msg: SpaceMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "user-left") {
    return { model: init(model) };
  }

  return { model };
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
