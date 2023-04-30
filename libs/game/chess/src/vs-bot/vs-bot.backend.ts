import { Cmd, p, Sub } from '@gamezilla/core';
import { RoomMsg } from '@gamezilla/shared';
import * as Chess from '../chess/chess';
import {
  BackendModel,
  BackendMsg,
  botMoved,
  initBackend,
  inputBot,
  inputColor,
  inputMove,
  inputUser,
  isBotTurn,
  startGame,
  stopGame,
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

export const init = initBackend;

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
    case 'bot-moved': {
      const result = botMoved(msg[1], model);

      const modelNew = result.type === 'Err' ? model : result.value;

      return [modelNew, broadcast(['bot-moved_Done', result])];
    }
  }
};

type Wire = {
  sendToClient: (msg: ToFrontend) => Cmd;
  broadcast: (msg: ToFrontend) => Cmd;
};

export const updateFromFrontend = (
  wire: Wire,
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  const [modelNew, cmd] = updateFromFrontend_(wire, msg, model);

  return [modelNew, Cmd.batch([cmd, toBotMoveCmd(model, modelNew)])];
};

const toBotMoveCmd = (modelPrev: Model, modelNext: Model): Cmd<Msg> => {
  const didChangeToBotTurn = !isBotTurn(modelPrev) && isBotTurn(modelNext);

  if (!didChangeToBotTurn) {
    return Cmd.None;
  }
  if (modelNext.type !== 'game') {
    return Cmd.None;
  }

  const cmd = p(
    Chess.getBestMove(modelNext.botLevel, modelNext.board),
    Cmd.perform((result): Msg => ['bot-moved', result])
  );

  return cmd;
};

const updateFromFrontend_ = (
  { broadcast }: Wire,
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'start-game': {
      const result = startGame(msg[1], model);

      const modelNew = result.type === 'Err' ? model : result.value;

      return [modelNew, broadcast(['StartGame_Done', result])];
    }

    case 'stop-game': {
      const result = stopGame(msg[1], model);

      const modelNew = result.type === 'Err' ? model : result.value;

      return [modelNew, broadcast(['StopGame_Done', result])];
    }

    case 'InputUser': {
      const result = inputUser(msg[1], model);

      const modelNew = result.type === 'Err' ? model : result.value;

      return [modelNew, broadcast(['InputUser_Done', result])];
    }

    case 'InputColor': {
      const result = inputColor(msg[1], model);

      const modelNew = result.type === 'Err' ? model : result.value;

      return [modelNew, broadcast(['InputColor_Done', result])];
    }

    case 'InputBot': {
      const result = inputBot(msg[1], model);

      const modelNew = result.type === 'Err' ? model : result.value;

      return [modelNew, broadcast(['InputBot_Done', result])];
    }

    case 'input-move': {
      const result = inputMove(msg[1], model);

      const modelNew = result.type === 'Err' ? model : result.value;

      return [modelNew, broadcast(['input-move-done', result])];
    }
  }
};

export const updateFromRoom = ({
  msg,
  model,
  broadcast,
}: {
  msg: RoomMsg;
  broadcast: (m: ToFrontend) => Cmd;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  switch (msg.t) {
    case 'user-left': {
      if (model.userId === msg.userId) {
        const modelNew: Model = {
          type: 'Setup',
          botLevel: model.botLevel,
          userColor: model.userColor,
          userId: 'none',
        };
        return { model: modelNew, cmd: broadcast(['player-left', modelNew]) };
      }

      return { model };
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

export const subscriptions = (_intervalId: string, _model: Model): Sub<Msg> => {
  return Sub.None;
};
