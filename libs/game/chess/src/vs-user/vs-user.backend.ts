import { Cmd, exhaustive, Sub, Time } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import * as Board from '../chess-board';
import {
  BackendModel,
  BackendMsg,
  cancelDraw,
  clockTicked,
  initShared,
  inputClock,
  inputMove,
  inputPlayer,
  newGame,
  requestToDraw,
  Res,
  resign,
  respondToDraw,
  startGame,
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
    case 'ClockTicked': {
      const modelNew: Model = {
        ...model,
        ...clockTicked(model),
      };

      const didChangeToGameOver =
        model.type !== 'GameOver' && modelNew.type === 'GameOver';

      return [
        modelNew,
        Cmd.batch([
          broadcast(['ClockTicked', modelNew]),
          didChangeToGameOver ? broadcast(['GameOver']) : Cmd.None,
        ]),
      ];
    }
  }
};

export const updateFromFrontend = (
  wire: {
    sendToClient: (msg: ToFrontend) => Cmd;
    broadcast: (msg: ToFrontend) => Cmd;
  },
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'Init': {
      return [model, wire.sendToClient(['Sync', model])];
    }

    case 'RequestToDraw': {
      return sendResponse(
        wire,
        ['RequestToDraw_Done', requestToDraw(msg[1], model)],
        model
      );
    }

    case 'Resign': {
      return sendResponse(wire, ['Resign_Done', resign(msg[1], model)], model);
    }

    case 'InputClock': {
      return sendResponse(
        wire,
        ['InputClock_Done', inputClock(msg[1], model)],
        model
      );
    }

    case 'InputPlayer': {
      return sendResponse(
        wire,
        ['InputPlayer_Done', inputPlayer(msg[1], model)],
        model
      );
    }

    case 'start-game': {
      return sendResponse(
        wire,
        ['StartGame_Done', startGame(msg[1], model)],
        model
      );
    }

    case 'input-move': {
      return sendResponse(
        wire,
        ['InputMove_Done', inputMove(msg[1], model)],
        model
      );
    }

    case 'RespondToDraw': {
      return sendResponse(
        wire,
        ['RespondToDraw_Done', respondToDraw(msg[1], model)],
        model
      );
    }

    case 'NewGame': {
      return sendResponse(wire, ['NewGame_Done', newGame(model)], model);
    }

    case 'CancelDraw': {
      return sendResponse(
        wire,
        ['CancelDraw_Done', cancelDraw(msg[1], model)],
        model
      );
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

const sendResponse = (
  {
    sendToClient,
    broadcast,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd;
    broadcast: (msg: ToFrontend) => Cmd;
  },
  response: Res,
  model: Model
): [Model, Cmd<Msg>] => {
  if (response[1].type === 'Err') {
    return [
      model,
      Cmd.batch([sendToClient(response), sendToClient(['Sync', model])]),
    ];
  }

  const modelNew: Model = response[1].value;

  const didChangeToGameOver =
    model.type !== 'GameOver' && modelNew.type === 'GameOver';

  return [
    modelNew,
    Cmd.batch([
      didChangeToGameOver ? broadcast(['GameOver']) : Cmd.None,
      broadcast(response),
    ]),
  ];
};

export const updateRoomLeave = (
  { broadcast }: { broadcast: (m: ToFrontend) => Cmd },
  userId: UserId,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (model.type) {
    case 'Setup': {
      const color: Board.Color | 'none' =
        model.b === userId ? 'b' : model.w === userId ? 'w' : 'none';

      if (color === 'none') {
        return [model, Cmd.None];
      }

      const modelNew: Model = { ...model, [color]: 'none' };

      return [modelNew, broadcast(['player-left', modelNew])];
    }

    case 'game':
    case 'GameOver': {
      const color: Board.Color | 'none' =
        model.b === userId ? 'b' : model.w === userId ? 'w' : 'none';

      if (color === 'none') {
        return [model, Cmd.None];
      }

      const otherColor = Board.toOppositeColor(color);

      const modelNew: Model = {
        ...model,
        type: 'Setup',
        clockPreset: model.clock.preset,
        [otherColor]: model[otherColor],
        [color]: 'none',
      };

      return [modelNew, broadcast(['player-left', modelNew])];
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
      const turn = Board.toTurn(model.board);

      switch (turn) {
        case 'b': {
          return Time.every(`${intervalId}-b`, 1000, () => ['ClockTicked']);
        }
        case 'w': {
          return Time.every(`${intervalId}-w`, 1000, () => ['ClockTicked']);
        }
      }
    }
  }
};
