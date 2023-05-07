import { UserId } from '@gamezilla/shared/app';
import { Cmd, p, Sub } from '@gamezilla/shared/core';
import { RoomMsg } from '@gamezilla/shared/frontend';
import { getBestMove, opposite } from '../connect-four/connect-four';
import {
  BackendModel,
  BackendMsg,
  botMove,
  handle,
  initShared,
  isBotTurn,
  Res,
  ToBackend,
  ToFrontend,
} from './vs-bot.types';

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

export const update = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (m: ToFrontend) => Cmd;
  msg: Msg;
  model: Model;
}): { model: Model; cmd: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'bot-move': {
      const result = botMove(msg[1], model);
      if (result.type === 'Err') {
        return { model, cmd: broadcast(['bot-move', result]) };
      }
      return { model: result.value, cmd: broadcast(['bot-move', result]) };
    }
  }
};

export const updateFromFrontend = (
  wire: {
    broadcast: (msg: ToFrontend) => Cmd;
    sendToClient: (msg: ToFrontend) => Cmd;
    currentUserId: UserId;
  },
  msg: ToBackend,
  modelPrev: Model
): [Model, Cmd<Msg>] => {
  const [modelNext, cmd] = updateFromFrontend_(wire, msg, modelPrev);

  if (
    !isBotTurn(modelPrev) &&
    isBotTurn(modelNext) &&
    modelNext.type === 'game'
  ) {
    return [
      modelNext,
      Cmd.batch([
        cmd,
        p(
          getBestMove({
            columns: modelNext.columns,
            maximizingPlayer: opposite[modelNext.userPlayerType],
          }),
          Cmd.perform((result) => ['bot-move', result])
        ),
      ]),
    ];
  }

  return [modelNext, cmd];
};

const updateFromFrontend_ = (
  {
    broadcast,
    sendToClient,
    currentUserId,
  }: {
    broadcast: (m: ToFrontend) => Cmd;
    sendToClient: (m: ToFrontend) => Cmd;
    currentUserId: UserId;
  },
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  const res: Res = [msg[0], handle({ currentUserId }, msg, model)];

  if (res[1].type === 'Err') {
    return [model, sendToClient(res)];
  }

  return [res[1].value, broadcast(res)];
};

export const updateFromRoom = ({
  msg,
  model,
  broadcast,
}: {
  broadcast: (m: ToFrontend) => Cmd;
  msg: RoomMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'user-left') {
    if (model.player !== msg.userId) {
      return { model };
    }

    const modelNew: Model = {
      type: 'Setup',
      botLevel: model.botLevel,
      userPlayerType: model.userPlayerType,
      player: 'none',
    };

    return { model: modelNew, cmd: broadcast(['player-left', modelNew]) };
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

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
