import { Cmd, Sub } from '@gamezilla/core';
import { RoomMsg } from '@gamezilla/game-shared';
import { RoomRequestCtx } from '@gamezilla/shared/backend';
import {
  BackendModel,
  BackendMsg,
  Res,
  ToBackend,
  ToFrontend,
  handle,
  initShared,
} from './vs-user.types';

//
//
//
// model
//
//
//

export type Model = BackendModel;

export const init = initShared;

//
//
//
// update
//
//
//

export type Msg = BackendMsg;

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

export const updateFromFrontend = ({
  sendToClient,
  broadcast,
  msg,
  model,
  ctx,
}: {
  ctx: RoomRequestCtx;
  msg: ToBackend;
  model: Model;
  broadcast: (m: ToFrontend) => Cmd;
  sendToClient: (m: ToFrontend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const res: Res = { ...msg, result: handle({ msg, model, ctx }) };

  if (res.result.type === 'Err') {
    return { model, cmd: sendToClient(res) };
  }
  return { model: res.result.value, cmd: broadcast(res) };
};

export const updateFromRoom = ({
  msg,
  model,
}: {
  msg: RoomMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'user-left') {
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
