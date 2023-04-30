import { Cmd, exhaustive, Sub, Time } from '@gamezilla/core';
import { RoomMsg } from '@gamezilla/game-shared';
import { PlayerType, toOpposite, toTurn } from '../tic-tic-toe/tic-tac-toe';
import * as Round from './vs-user-round';
import {
  BackendModel,
  BackendMsg,
  initSharedModel,
  inputBestOutOf,
  inputMove,
  InputMoveTimeLimit,
  inputPlayer,
  moveCountDown,
  NewGame,
  rematchAccept,
  rematchAsk,
  rematchCancel,
  rematchDecline,
  Res,
  resign,
  roundCountDown,
  startGame,
  stopPlaying,
  ToBackend,
  ToFrontend,
} from './vs-user.types';

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

export const update = (
  {
    broadcast,
  }: {
    broadcast: (msg: ToFrontend) => Cmd;
  },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'RoundCountDown': {
      const result = roundCountDown(model);

      const modelNew = result.type === 'Err' ? model : result.value;

      return [modelNew, broadcast(['RoundCountDown_Done', result])];
    }

    case 'MoveCountDown': {
      const result = moveCountDown(model);

      const modelNew = result.type === 'Err' ? model : result.value;

      return [modelNew, broadcast(['MoveCountDown_Done', result])];
    }
  }
};

export const updateFromFrontend = (
  {
    sendToClient,
    broadcast,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd;
    broadcast: (msg: ToFrontend) => Cmd;
  },
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'InputPlayer': {
      const result = inputPlayer(msg[1], model);

      if (result.type === 'Err') {
        return [model, sendToClient(['InputPlayer_Done', result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(['InputPlayer_Done', result])];
    }

    case 'stop-playing': {
      const result = stopPlaying(msg[1], model);

      if (result.type === 'Err') {
        return [model, sendToClient(['StopPlaying_Done', result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(['StopPlaying_Done', result])];
    }

    case 'start-game': {
      const result = startGame(msg[1], model);

      if (result.type === 'Err') {
        return [model, sendToClient(['StartGame_Done', result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(['StartGame_Done', result])];
    }

    case 'resign': {
      const result = resign(msg[1], model);

      if (result.type === 'Err') {
        return [model, sendToClient(['resign_Done', result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(['resign_Done', result])];
    }

    case 'input-move': {
      const result = inputMove(msg[1], model);

      if (result.type === 'Err') {
        return [model, sendToClient(['input-move-done', result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(['input-move-done', result])];
    }

    case 'NewGame': {
      const result = NewGame(msg[1], model);

      if (result.type === 'Err') {
        return [model, sendToClient(['NewGame_Done', result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(['NewGame_Done', result])];
    }

    case 'InputBestOutOf': {
      const result = inputBestOutOf(msg[1], model);

      if (result.type === 'Err') {
        return [model, sendToClient(['InputBestOutOf_Done', result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(['InputBestOutOf_Done', result])];
    }

    case 'InputMoveTimeLimit': {
      const result = InputMoveTimeLimit(msg[1], model);

      if (result.type === 'Err') {
        return [model, sendToClient(['InputMoveTimeLimit_Done', result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(['InputMoveTimeLimit_Done', result])];
    }

    case 'RematchAccept': {
      const result = rematchAccept(msg[1], model);
      const res: Res = ['RematchAccept_Done', result];

      if (result.type === 'Err') {
        return [model, sendToClient(res)];
      }

      return [result.value, broadcast(res)];
    }

    case 'RematchAsk': {
      const result = rematchAsk(msg[1], model);
      const res: Res = ['RematchAsk_Done', result];

      if (result.type === 'Err') {
        return [model, sendToClient(res)];
      }

      return [result.value, broadcast(res)];
    }

    case 'RematchDecline': {
      const result = rematchDecline(msg[1], model);
      const res: Res = ['RematchDecline_Done', result];

      if (result.type === 'Err') {
        return [model, sendToClient(res)];
      }

      return [result.value, broadcast(res)];
    }

    case 'Rematch_Cancel': {
      const result = rematchCancel(msg[1], model);
      const res: Res = ['Rematch_Cancel_Done', result];

      if (result.type === 'Err') {
        return [model, sendToClient(res)];
      }

      return [result.value, broadcast(res)];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
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
  switch (msg.t) {
    case 'user-left': {
      const { userId } = msg;

      const player: PlayerType | 'none' =
        model.O === userId ? 'O' : model.X === userId ? 'X' : 'none';

      if (player === 'none') {
        return { model };
      }

      const other = toOpposite(player);

      const modelNew: Model = {
        type: 'Setup',
        maxRoundCount: model.maxRoundCount,
        moveTimeLimit: model.moveTimeLimit,
        X: model.X,
        O: model.O,
        [player]: 'none',
        [other]: model[other],
      };

      return { model: modelNew, cmd: broadcast(['player-left', modelNew]) };
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

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model.type) {
    case 'Setup': {
      return Sub.None;
    }

    case 'GameOver': {
      return Sub.None;
    }

    case 'game': {
      const currentRound = Round.toCurrent(model.round);

      switch (currentRound.type) {
        case 'RoundStarted': {
          const turn = toTurn(currentRound.board);
          return Time.every(
            `${intervalId}-move-count-down-${turn}`,
            1000,
            (): Msg => ['MoveCountDown']
          );
        }

        case 'RoundStarting': {
          return Time.every(
            `${intervalId}-round-count-down`,
            750,
            (): Msg => ['RoundCountDown']
          );
        }

        case 'RoundOver': {
          return Sub.None;
        }
      }
    }
  }
};
