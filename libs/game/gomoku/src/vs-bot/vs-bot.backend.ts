import { Cmd, Sub } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import {
  BackendModel,
  BackendMsg,
  handle,
  handleBotMove,
  initShared,
  Res,
  ToBackend,
  ToFrontend,
} from './vs-bot.types';

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

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'none': {
      return [model, Cmd.None];
    }
  }
};

type UpdateFromFrontend = (
  params: {
    ctx: { currentUserId: UserId };
    sendToClient: (m: ToFrontend) => Cmd;
    broadcast: (m: ToFrontend) => Cmd;
  },
  msg: ToBackend,
  model: Model
) => [Model, Cmd<Msg>];

export const updateFromFrontend: UpdateFromFrontend = (
  params,
  msg,
  modelPrev
) => {
  const [model, cmd] = updateFromFrontend_(params, msg, modelPrev);

  const handled = handleBotMove(model);

  if (handled.type === 'Err') {
    return [model, cmd];
  }

  const modelNew = handled.value;

  return [
    modelNew,
    Cmd.batch([cmd, params.broadcast(['bot-moved', modelNew])]),
  ];
};

const updateFromFrontend_: UpdateFromFrontend = (
  { ctx, sendToClient, broadcast },
  msg,
  model
) => {
  switch (msg[0]) {
    default: {
      const res: Res = [msg[0], handle(ctx, msg, model)];
      if (res[1].type === 'Err') {
        return [model, sendToClient(res)];
      }
      return [res[1].value, broadcast(res)];
    }
  }
};

export const updateRoomLeave = (
  _userId: UserId,
  model: Model
): [Model, Cmd<Msg>] => {
  return [init({ userId: model.userId }), Cmd.None];
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
