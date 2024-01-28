import {
  SpaceReqCtx,
  SpaceServerEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ServerModel, ServerMsg, ToServer, initShared } from "./vs-user.core";

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
  model,
}: {
  ctx: SpaceReqCtx;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  return { model };
};

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceServerEvent;
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
