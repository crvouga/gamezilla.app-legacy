import { Cmd, p, Sub } from '@gamezilla/shared/core';
import { RoomMsg } from '@gamezilla/shared/client';
import { findBestMove, toDepth, toOpposite } from '../tic-tic-toe/tic-tac-toe';
import {
  ServerModel,
  ServerMsg,
  botMove,
  initSharedModel,
  inputBot,
  inputMove,
  inputPlayerType,
  isBotTurn,
  Res,
  restart,
  startGame,
  startPlaying,
  stopGame,
  stopPlaying,
  swapSides,
  ToServer,
  ToClient,
} from './vs-bot.shared';

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init = initSharedModel;

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

type Update = (
  wire: { broadcast: (msg: ToClient) => Cmd },
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
      const response: ToClient = ['bot-move-done', botMove(msg[1], model)];
      const modelNext = response[1].t === 'ok' ? response[1].value : model;
      return [modelNext, broadcast(response)];
    }
  }
};

//
//
//
//
//

type updateFromClient = (
  wire: {
    sendToClient: (m: ToClient) => Cmd;
    broadcast: (m: ToClient) => Cmd;
  },
  msg: ToServer,
  model: Model
) => [Model, Cmd<Msg>];

export const updateFromClient: updateFromClient = (wire, msg, modelPrev) => {
  const [modelNext, cmd] = updateFromClient_(wire, msg, modelPrev);

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

const updateFromClient_: updateFromClient = (
  { sendToClient, broadcast },
  msg,
  model
) => {
  switch (msg[0]) {
    case 'start-game': {
      const response: Res = ['StartGame_Done', startGame(msg[1], model)];
      if (response[1].t === 'err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'stop-playing': {
      const response: Res = ['StopPlaying_Done', stopPlaying(msg[1], model)];
      if (response[1].t === 'err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'start-playing': {
      const response: Res = ['StartPlaying_Done', startPlaying(msg[1], model)];
      if (response[1].t === 'err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'InputBot': {
      const response: Res = ['InputBot_Done', inputBot(msg[1], model)];
      if (response[1].t === 'err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'input-player-type': {
      const response: Res = [
        'InputPlayerType_Done',
        inputPlayerType(msg[1], model),
      ];
      if (response[1].t === 'err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'stop-game': {
      const response: Res = ['StopGame_Done', stopGame(msg[1], model)];
      if (response[1].t === 'err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'input-move': {
      const response: Res = ['input-move-done', inputMove(msg[1], model)];
      if (response[1].t === 'err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'swap-sides': {
      const response: Res = ['swap-sides-done', swapSides(msg[1], model)];
      if (response[1].t === 'err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }

    case 'restart': {
      const response: Res = ['restart-done', restart(msg[1], model)];
      if (response[1].t === 'err') {
        return [model, sendToClient(response)];
      }
      return [response[1].value, broadcast(response)];
    }
  }
};

export const updateFromRoom = ({
  broadcast,
  msg,
  model,
}: {
  msg: RoomMsg;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case 'user-left': {
      if (model.player !== msg.userId) {
        return { model };
      }

      const modelNew: Model = {
        type: 'Setup',
        botLevel: model.botLevel,
        player: 'none',
        userPlayerType: model.userPlayerType,
      };

      return {
        model: modelNew,
        cmd: broadcast(['player-left', modelNew]),
      };
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

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
