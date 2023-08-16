import { Cmd, Sub } from "gamezilla/@SHARED/core";
import { SpaceEvent, SpaceReqCtx } from "gamezilla/app/space/@SHARED";
import {
  Res,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  handle,
  initShared,
} from "./vs-user.core";

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
  ctx: SpaceReqCtx;
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

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceEvent;
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
