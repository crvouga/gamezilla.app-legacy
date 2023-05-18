import { Cmd, Sub, Time } from '@gamezilla/shared/core';
import {
  BackendModel,
  BackendMsg,
  handle,
  initShared,
  Res,
  tick,
  ToBackend,
  ToFrontend,
} from './maze.types';

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init = initShared;

//
//
//
// Update
//
//
//

export type Msg = BackendMsg;

export const update = (
  { broadcast }: { broadcast: (msg: ToFrontend) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'tick': {
      const modelNew = tick(model);
      return [modelNew, broadcast(['tick', modelNew])];
    }
  }
};

export const updateFromClient = (
  { broadcast }: { broadcast: (m: ToFrontend) => Cmd },
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'stop-game':
    case 'input-direction':
    case 'input-seed':
    case 'start-game':
    case 'stop-playing':
    case 'start-playing': {
      const res: Res = [...msg, handle(msg, model)];
      const modelNew = res[2].type === 'Ok' ? res[2].value : model;
      return [modelNew, broadcast(res)];
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (
  intervalId: string,
  model: BackendModel
): Sub<Msg> => {
  if (model.type === 'game') {
    return Time.every(intervalId, 500, () => ['tick']);
    // return Sub.None
  }
  return Sub.None;
};
