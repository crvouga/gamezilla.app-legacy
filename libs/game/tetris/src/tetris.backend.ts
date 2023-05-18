import { Cmd, Sub, Time } from '@gamezilla/shared/core';
import {
  BackendModel,
  BackendMsg,
  initShared,
  inputDrop,
  inputRotate,
  inputTranslate,
  mouseMove,
  tick,
  ToBackend,
  ToFrontend,
} from './tetris.types';

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: Model = initShared;

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
      const modelNext = tick(model);

      return [modelNext, broadcast(['Tick_Done', modelNext])];
    }
  }
};

export const updateFromClient = (
  {
    broadcast,
    sendToClient,
  }: {
    broadcast: (msg: ToFrontend) => Cmd;
    sendToClient: (msg: ToFrontend) => Cmd;
  },
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'MouseMove': {
      const toFrontend = mouseMove(msg, model);

      if (toFrontend[1].type === 'Err') {
        return [model, sendToClient(toFrontend)];
      }

      const modelNew = toFrontend[1].value;

      return [modelNew, broadcast(toFrontend)];
    }

    case 'InputDrop': {
      const result = inputDrop(model);

      if (result.type === 'Err') {
        return [model, sendToClient(['InputDrop_Done', result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(['InputDrop_Done', result])];
    }

    case 'InputTranslate': {
      const result = inputTranslate(msg[1], model);

      if (result.type === 'Err') {
        return [model, sendToClient(['InputTranslate_Done', result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(['InputTranslate_Done', result])];
    }

    case 'InputRotate': {
      const result = inputRotate(model);

      if (result.type === 'Err') {
        return [model, sendToClient(['InputRotate_Done', result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(['InputRotate_Done', result])];
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

export const subscriptions = (intervalId: string, _model: Model): Sub<Msg> => {
  return Time.every(intervalId, 500, (): Msg => ['tick']);
};
