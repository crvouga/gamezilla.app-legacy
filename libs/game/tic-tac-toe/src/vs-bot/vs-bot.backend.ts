import { Cmd, p, Sub } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import { toDepth, findBestMove, toOpposite } from '../tic-tic-toe/tic-tac-toe';
import {
  BackendModel,
  BackendMsg,
  botMove,
  initSharedModel,
  inputBot,
  inputMove,
  inputPlayerType,
  isBotTurn,
  Response,
  restart,
  startGame,
  startPlaying,
  stopGame,
  stopPlaying,
  swapSides,
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

export const init = initSharedModel;

//
//
//
// Update
//
//
//

export type Msg = BackendMsg;

type Update = (
  wire: { broadcast: (msg: ToFrontend) => Cmd },
  msg: Msg,
  model: Model
) => [Model, Cmd<Msg>];

export const update: Update = (wire, msg, model) => {
  const [modelNext, cmd] = update_(wire, msg, model);

  //

  return [modelNext, cmd];
};

export const update_: Update = ({ broadcast }, msg, model) => {
  switch (msg[0]) {
    case 'bot-move': {
      const response: ToFrontend = ['BotMove_Done', botMove(msg[1], model)];
      const modelNext = response[1].type === 'Ok' ? response[1].value : model;
      return [modelNext, broadcast(response)];
    }
  }
};

//
//
//
//
//

type UpdateFromFrontend = (
  wire: {
    sendToClient: (m: ToFrontend) => Cmd;
    broadcast: (m: ToFrontend) => Cmd;
  },
  msg: ToBackend,
  model: Model
) => [Model, Cmd<Msg>];

export const updateFromFrontend: UpdateFromFrontend = (
  wire,
  msg,
  modelPrev
) => {
  const [modelNext, cmd] = updateFromFrontend_(wire, msg, modelPrev);

  if (!isBotTurn(modelPrev) && isBotTurn(modelNext)) {
    return [
      modelNext,
      Cmd.batch([
        cmd,
        p(
          findBestMove({
            depth: toDepth(modelNext.botLevel),
            maximizingPlayer: toOpposite(modelNext.userPlayerType),
            board: modelNext.board,
          }),
          Cmd.perform((result) => ['bot-move', result])
        ),
      ]),
    ];
  }

  return [modelNext, cmd];
};

const updateFromFrontend_: UpdateFromFrontend = (
  { sendToClient, broadcast },
  msg,
  model
) => {
  switch (msg[0]) {
    case 'start-game': {
      const response: Response = ['StartGame_Done', startGame(msg[1], model)];
      if (response[1].type === 'Err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'stop-playing': {
      const response: Response = [
        'StopPlaying_Done',
        stopPlaying(msg[1], model),
      ];
      if (response[1].type === 'Err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'start-playing': {
      const response: Response = [
        'StartPlaying_Done',
        startPlaying(msg[1], model),
      ];
      if (response[1].type === 'Err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'InputBot': {
      const response: Response = ['InputBot_Done', inputBot(msg[1], model)];
      if (response[1].type === 'Err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'input-player-type': {
      const response: Response = [
        'InputPlayerType_Done',
        inputPlayerType(msg[1], model),
      ];
      if (response[1].type === 'Err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'stop-game': {
      const response: Response = ['StopGame_Done', stopGame(msg[1], model)];
      if (response[1].type === 'Err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'input-move': {
      const response: Response = ['InputMove_Done', inputMove(msg[1], model)];
      if (response[1].type === 'Err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'swap-sides': {
      const response: Response = ['swap-sides-done', swapSides(msg[1], model)];
      if (response[1].type === 'Err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'restart': {
      const response: Response = ['Restart_Done', restart(msg[1], model)];
      if (response[1].type === 'Err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }
  }
};

export const updateRoomLeave = ({
  broadcast,
  userId,
  model,
}: {
  userId: UserId;
  model: Model;
  broadcast: (m: ToFrontend) => Cmd;
}): [Model, Cmd<Msg>] => {
  if (model.player !== userId) {
    return [model, Cmd.None];
  }

  const modelNew: Model = {
    type: 'Setup',
    botLevel: model.botLevel,
    player: 'none',
    userPlayerType: model.userPlayerType,
  };

  return [modelNew, broadcast(['player-left', modelNew])];
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
