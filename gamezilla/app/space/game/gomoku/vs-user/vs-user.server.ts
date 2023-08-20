import { Eff, Sub } from "gamezilla/@SHARED/core";
import { SpaceEvt, SpaceReqCtx } from "gamezilla/app/space/@SHARED";
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
  eff?: Eff<Msg>;
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
  broadcast: (m: ToClient) => Eff;
  sendToClient: (m: ToClient) => Eff;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  const res: Res = { ...msg, result: handle({ msg, model, ctx }) };

  if (res.result.t === "err") {
    return { model, eff: sendToClient(res) };
  }
  return { model: res.result.value, eff: broadcast(res) };
};

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceEvt;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
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
