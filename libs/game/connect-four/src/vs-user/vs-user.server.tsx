import { Cmd, exhaustive, Sub, Time } from '@gamezilla/shared/core';
import { RoomMsg } from '@gamezilla/shared/client';
import {
  ServerModel,
  ServerMsg,
  handle,
  initShared,
  Res,
  tick,
  ToServer,
  ToClient,
  toPlayerType,
} from './vs-user.shared';

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init = initShared;

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = (
  { broadcast }: { broadcast: (msg: ToClient) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'tick': {
      const modelNew = tick(model);
      return [modelNew, broadcast(['Tick_Done', modelNew])];
    }
  }
};

export const updateFromClient = (
  {
    sendToClient,
    broadcast,
  }: {
    sendToClient: (msg: ToClient) => Cmd;
    broadcast: (msg: ToClient) => Cmd;
  },
  msg: ToServer,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'resign':
    case 'new-game':
    case 'Rematch_Cancel':
    case 'rematch-request':
    case 'Rematch_Respond':
    case 'InputMoveTimeLimit':
    case 'input-move':
    case 'start-game':
    case 'stop-playing':
    case 'start-playing': {
      const res: Res = [msg[0], handle(msg, model)];

      if (res[1].type === 'Err') {
        return [model, sendToClient(res)];
      }

      return [res[1].value, broadcast(res)];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const updateFromRoom = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (m: ToClient) => Cmd;
  msg: RoomMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'user-left') {
    const userId = msg.userId;
    const player = toPlayerType(userId, model);

    if (player === 'none') {
      return { model };
    }

    const modelNew: Model = {
      type: 'Setup',
      moveTimeLimit: model.moveTimeLimit,
      PlayerOne: model.PlayerOne,
      PlayerTwo: model.PlayerTwo,
      [player]: 'none',
    };

    return {
      model: modelNew,
      cmd: broadcast(['player-left', modelNew]),
    };
  }
  return { model };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model.type) {
    case 'GameOver': {
      return Sub.None;
    }

    case 'Setup': {
      return Sub.None;
    }

    case 'game': {
      return Time.every(intervalId, 1000, () => ['tick']);
    }
  }
};
