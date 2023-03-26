import { NonEmpty, Result } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import {
  Board,
  initBoard,
  move,
  MoveProblem,
  Stone,
  toOppositeStone,
  toStatus,
  Win,
} from '../gomoku/gomoku';
import { Position } from '../gomoku/gomoku-position';

const { Err, Ok } = Result;

//
//
//
// Model
//
//
//

export type Model = ModelSetup | ModelPlaying | ModelGameOver;

export type ModelSetup = {
  type: 'setup';
  white: UserId | null;
  black: UserId | null;
};

export type ModelPlaying = {
  type: 'playing';
  white: UserId;
  black: UserId;
  board: Board;
};

export type ModelGameOver = {
  type: 'gameOver';
  white: UserId;
  black: UserId;
  board: Board;
  gameOver: GameOver;
  rematch: Rematch;
};

type Rematch =
  | {
      type: 'none';
    }
  | {
      type: 'Requested';
    };

type GameOver =
  | {
      type: 'Resigned';
      resigner: Stone;
    }
  | {
      type: 'Winner';
      winner: Stone;
      wins: NonEmpty<Win>;
    }
  | {
      type: 'Draw';
    };

export type FrontendModel = Model & {
  confirming?: FrontendMsg[0];
};

export type BackendModel = Model;

export const initShared = ({
  white,
  black,
}: {
  white: UserId | null;
  black: UserId | null;
}): Model => {
  return {
    type: 'setup',
    white,
    black,
  };
};

const initGameOver = ({
  model,
  gameOver,
}: {
  gameOver: GameOver;
  model: ModelPlaying;
}): ModelGameOver => {
  return {
    type: 'gameOver',
    black: model.black,
    white: model.white,
    board: model.board,
    rematch: { type: 'none' },
    gameOver,
  };
};

const initSetup = (model: Model): ModelSetup => {
  return {
    type: 'setup',
    black: model.black,
    white: model.white,
  };
};

//
//
//
// Msg
//
//
//

export type FrontendMsg = Req | ['clicked-cancel'];

export type BackendMsg = ['none'];

export type ToFrontend = Res;

export type ToBackend = Req;

//
//
//
//
//

export type Req =
  | ['start-playing', { stone: Stone }]
  | ['stop-playing', { stone: Stone }]
  | ['start-game']
  //
  | ['input-move', { position: Position }]
  | ['Resign']
  | ['RematchRequest']
  | ['RematchRespond', { response: 'Accept' | 'Decline' }]
  | ['stop-game'];

export type Res = [Req[0], Result<Problem, Model>];

type Problem =
  | 'must_be_setup'
  | 'player_taken'
  | 'must_be_player'
  | 'missing_player'
  | 'must_be_playing'
  | MoveProblem;

export const handle = ({
  currentUserId,
  msg,
  model,
}: {
  currentUserId: UserId;
  msg: Req;
  model: Model;
}): Result<Problem, Model> => {
  switch (msg[0]) {
    case 'start-playing': {
      if (model.type !== 'setup') {
        return Err('must_be_setup');
      }

      const { stone } = msg[1];

      if (model[stone]) {
        return Err('player_taken');
      }

      const modelNew: Model = {
        ...model,
        [stone]: currentUserId,
        [toOppositeStone(stone)]:
          model[toOppositeStone(stone)] === currentUserId
            ? null
            : model[toOppositeStone(stone)],
      };

      return Ok(modelNew);
    }

    case 'stop-playing': {
      if (model.type !== 'setup') {
        return Err('must_be_setup');
      }

      const { stone } = msg[1];

      if (model[stone] !== currentUserId) {
        return Err('must_be_player');
      }

      const modelNew: Model = {
        ...model,
        [stone]: null,
      };

      return Ok(modelNew);
    }

    case 'start-game': {
      if (model.type !== 'setup') {
        return Err('must_be_setup');
      }

      if (!(model.white && model.black)) {
        return Err('missing_player');
      }

      const modelNew: Model = {
        type: 'playing',
        white: model.white,
        black: model.black,
        board: initBoard,
      };

      return Ok(modelNew);
    }

    case 'input-move': {
      if (model.type !== 'playing') {
        return Err('must_be_playing');
      }

      const { position } = msg[1];

      const currentUserStone =
        model.white === currentUserId ? 'white' : 'black';

      const moved = move({
        board: model.board,
        position,
        stone: currentUserStone,
      });

      if (moved.type === 'Err') {
        return moved;
      }

      const modelNew = { ...model, board: moved.value };

      const statusNew = toStatus(modelNew.board);

      if (statusNew.type === 'win') {
        const gameOver: GameOver = {
          type: 'Winner',
          winner: statusNew.winner,
          wins: statusNew.wins,
        };
        return Ok(initGameOver({ model: modelNew, gameOver }));
      }

      if (statusNew.type === 'draw') {
        return Ok(
          initGameOver({ model: modelNew, gameOver: { type: 'Draw' } })
        );
      }

      return Ok(modelNew);
    }

    case 'Resign': {
      if (model.type !== 'playing') {
        return Err('must_be_playing');
      }

      if (model.white !== currentUserId && model.black !== currentUserId) {
        return Err('must_be_player');
      }

      const currentUserStone =
        model.white === currentUserId ? 'white' : 'black';

      const modelNew = initGameOver({
        model,
        gameOver: { type: 'Resigned', resigner: currentUserStone },
      });

      return Ok(modelNew);
    }

    case 'RematchRequest': {
      return Ok(model);
    }

    case 'RematchRespond': {
      return Ok(model);
    }

    case 'stop-game': {
      if (model.black !== currentUserId && model.white !== currentUserId) {
        return Err('must_be_player');
      }

      return Ok(initSetup(model));
    }
  }
};
