import { exhaustive, Result } from '@gamezilla/shared/core';
import { UserId } from '@gamezilla/shared/app';
import {
  allColumnIndexes,
  ColumnIndex,
  Columns,
  emptyColumns,
  move,
  MoveProblem,
  MoveResult,
  opposite,
  PlayerType,
  toStatus,
  toTurn,
} from '../connect-four/connect-four';
const { Err, Ok } = Result;
//
//
//
// Model
//
//
//

export type SharedModel = SetupModel | GameModel | GameOverModel;

export type SetupModel = {
  type: 'Setup';
  moveTimeLimit: MoveTimeLimit;
  PlayerOne: UserId | 'none';
  PlayerTwo: UserId | 'none';
};

export type GameModel = {
  type: 'game';
  PlayerOne: UserId;
  PlayerTwo: UserId;
  moveTimeLimit: MoveTimeLimit;
  moveCountDown: number;
  columns: Columns;
};

export type GameOverModel = {
  type: 'GameOver';
  PlayerOne: UserId;
  PlayerTwo: UserId;
  moveTimeLimit: MoveTimeLimit;
  columns: Columns;
  gameOver: GameOver;
  rematch: Rematch;
};

type Rematch =
  | {
      type: 'NotAsking';
    }
  | {
      type: 'Asking';
      asker: PlayerType;
    };

type GameOver =
  | {
      type: 'Draw';
    }
  | {
      type: 'Winner';
      winner: PlayerType;
    }
  | {
      type: 'resignation';
      resigner: PlayerType;
    };

export const toGameOver = (model: SharedModel): GameOver | { type: 'none' } => {
  if (model.type === 'Setup') {
    return { type: 'none' };
  }

  const status = toStatus(model.columns);

  if (status.type === 'Tie') {
    return { type: 'Draw' };
  }

  if (status.type === 'Winner') {
    return { type: 'Winner', winner: status.winner };
  }

  return { type: 'none' };
};

export type MoveTimeLimit = 5 | 7 | 9;

export const allMoveTimeLimit: {
  [moveTimeLimit in MoveTimeLimit]: MoveTimeLimit;
} = {
  '5': 5,
  '7': 7,
  '9': 9,
};

export const initShared = ({
  PlayerOne,
  PlayerTwo,
}: Pick<SharedModel, 'PlayerOne' | 'PlayerTwo'>): SharedModel => {
  return {
    type: 'Setup',
    moveTimeLimit: 7,
    PlayerOne,
    PlayerTwo,
  };
};

export type ClientModel = SharedModel & {
  openedModal: 'ConfirmResign' | 'none';
  ghostIndex: ColumnIndex | 'none';
};

export type ServerModel = SharedModel;

//
//
//
// Msg
//
//
//

export type ServerMsg = Tick;

export type ClientMsg =
  | Req
  | ['hovered-over-columns', { columnIndex: ColumnIndex }]
  | ['clicked-resign', { userId: UserId }]
  | ['close-modal'];

export type ToServer = Req;

export type ToClient = Res | Tick_Done | ['player-left', SharedModel];

export type Req =
  //
  | ['stop-playing', { userId: UserId }]
  | ['start-playing', { userId: UserId; playerType: PlayerType }]
  | ['InputMoveTimeLimit', { userId: UserId; moveTimeLimit: MoveTimeLimit }]
  | ['input-move', { columnIndex: ColumnIndex; userId: UserId }]
  | ['start-game', { userId: UserId }]
  //
  | ['rematch-request', { userId: UserId }]
  | ['Rematch_Respond', { userId: UserId; response: 'Accept' | 'Decline' }]
  | ['Rematch_Cancel', { userId: UserId }]
  //
  | ['new-game', { userId: UserId }]
  | ['resign', { userId: UserId }];

export type Res = [Req[0], Result<Problem, SharedModel>];

export type Problem =
  | 'not_playing'
  | 'not_in_game'
  | 'not_game_over'
  | 'not_asking'
  | 'not_in_setup'
  | 'missing_player'
  | 'player_taken'
  | MoveProblem
  | 'already_asking';

export const handle = (
  req: Req,
  model: SharedModel
): Result<Problem, SharedModel> => {
  switch (req[0]) {
    case 'input-move': {
      if (model.type !== 'game') {
        return Err('not_in_game');
      }
      const { userId, columnIndex } = req[1];

      const playerType = toPlayerType(userId, model);

      if (playerType === 'none') {
        return Err('not_playing');
      }

      const result = move(model.columns, columnIndex, playerType);

      if (result.type === 'Err') {
        return result;
      }

      const modelNew = handleMoveResult(result, model);

      return Ok(modelNew);
    }

    case 'start-playing': {
      if (model.type !== 'Setup') {
        return Err('not_in_setup');
      }

      const { playerType, userId } = req[1];

      if (model[playerType] !== 'none') {
        return Err('player_taken');
      }

      const modelNew: SharedModel = {
        ...model,
        [opposite[playerType]]:
          model[opposite[playerType]] === userId
            ? 'none'
            : model[opposite[playerType]],
        [playerType]: userId,
      };

      return Ok(modelNew);
    }

    case 'InputMoveTimeLimit': {
      if (model.type !== 'Setup') {
        return Err('not_in_setup');
      }

      const { userId, moveTimeLimit } = req[1];

      const playerType = toPlayerType(userId, model);

      if (playerType === 'none') {
        return Err('not_playing');
      }

      const modelNew: SharedModel = {
        ...model,
        moveTimeLimit,
      };

      return Ok(modelNew);
    }

    case 'stop-playing': {
      if (model.type !== 'Setup') {
        return Err('not_in_setup');
      }

      const { userId } = req[1];

      const playerType = toPlayerType(userId, model);

      if (playerType === 'none') {
        return Err('not_playing');
      }

      const modelNew: SharedModel = {
        ...model,
        [playerType]: 'none',
      };

      return Ok(modelNew);
    }

    case 'start-game': {
      if (model.type !== 'Setup') {
        return Err('not_in_setup');
      }

      if (model.PlayerOne === 'none' || model.PlayerTwo === 'none') {
        return Err('missing_player');
      }

      const modelNew: SharedModel = {
        type: 'game',
        columns: emptyColumns,
        moveTimeLimit: model.moveTimeLimit,
        moveCountDown: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
      };

      return Ok(modelNew);
    }

    case 'rematch-request': {
      const { userId } = req[1];

      if (model.type !== 'GameOver') {
        return Err('not_game_over');
      }

      if (model.rematch.type === 'Asking') {
        return Err('already_asking');
      }

      const playerType = toPlayerType(userId, model);

      if (playerType === 'none') {
        return Err('not_playing');
      }

      const modelNew: SharedModel = {
        ...model,
        rematch: { type: 'Asking', asker: playerType },
      };

      return Ok(modelNew);
    }

    case 'Rematch_Respond': {
      if (model.type !== 'GameOver') {
        return Err('not_game_over');
      }

      if (model.rematch.type === 'NotAsking') {
        return Err('not_asking');
      }

      const { response } = req[1];

      if (response === 'Decline') {
        const modelNew: SharedModel = {
          ...model,
          rematch: { type: 'NotAsking' },
        };

        return Ok(modelNew);
      }

      const modelNew: SharedModel = {
        type: 'game',
        columns: emptyColumns,
        moveCountDown: model.moveTimeLimit,
        moveTimeLimit: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
      };

      return Ok(modelNew);
    }

    case 'new-game': {
      if (model.type !== 'GameOver') {
        return Err('not_game_over');
      }

      const { userId } = req[1];

      const playerType = toPlayerType(userId, model);

      if (playerType === 'none') {
        return Err('not_playing');
      }

      const modelNew: SharedModel = {
        type: 'Setup',
        moveTimeLimit: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
      };

      return Ok(modelNew);
    }

    case 'Rematch_Cancel': {
      const { userId } = req[1];

      if (model.type !== 'GameOver') {
        return Err('not_game_over');
      }

      const playerType = toPlayerType(userId, model);

      if (playerType === 'none') {
        return Err('not_playing');
      }

      if (model.rematch.type !== 'Asking') {
        return Err('not_asking');
      }

      if (model.rematch.asker !== playerType) {
        return Err('not_asking');
      }

      const modelNew: SharedModel = {
        ...model,
        rematch: { type: 'NotAsking' },
      };

      return Ok(modelNew);
    }

    case 'resign': {
      if (model.type !== 'game') {
        return Err('not_in_game');
      }

      const { userId } = req[1];

      const playerType = toPlayerType(userId, model);

      if (playerType === 'none') {
        return Err('not_playing');
      }

      const modelNew: SharedModel = {
        type: 'GameOver',
        columns: model.columns,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
        rematch: { type: 'NotAsking' },
        moveTimeLimit: model.moveTimeLimit,
        gameOver: { type: 'resignation', resigner: playerType },
      };

      return Ok(modelNew);
    }

    default: {
      return exhaustive(req[0]);
    }
  }
};

export const toPlayerType = (
  userId: UserId,
  model: SharedModel
): PlayerType | 'none' => {
  if (model.PlayerOne === userId) {
    return 'PlayerOne';
  }

  if (model.PlayerTwo === userId) {
    return 'PlayerTwo';
  }

  return 'none';
};

export const resultToString = (result: ReturnType<typeof handle>): string => {
  if (result.type === 'Ok') {
    return '';
  }

  switch (result.error) {
    case 'column_is_full': {
      return 'Column is full';
    }

    case 'game_over_winner': {
      return 'Game is over';
    }

    case 'game_over_tie': {
      return 'Game is over';
    }

    case 'missing_player': {
      return 'Missing a player';
    }

    case 'not_in_game': {
      return 'Must be in game mode';
    }

    case 'not_in_setup': {
      return 'Must be in setup mode';
    }

    case 'not_playing': {
      return 'Must be playing to change';
    }

    case 'not_turn': {
      return 'Must be your turn';
    }

    case 'out_of_bounds': {
      return 'Out of bounds';
    }

    case 'player_taken': {
      return 'Player is taken';
    }

    case 'not_game_over': {
      return 'Must be in game over mode';
    }

    case 'not_asking': {
      return 'The other player is not asking for a rematch';
    }

    case 'already_asking': {
      return 'Already asking';
    }

    default: {
      return exhaustive(result.error);
    }
  }
};

//
//
//
//
//

type Tick = ['tick'];
type Tick_Done = ['Tick_Done', SharedModel];

export const tick = (model: SharedModel): SharedModel => {
  if (model.type !== 'game') {
    return model;
  }

  const moveCountDownNew = Math.floor(Math.max(0, model.moveCountDown - 1));

  if (moveCountDownNew > 0) {
    const modelNew: SharedModel = {
      ...model,
      moveCountDown: moveCountDownNew,
    };

    return modelNew;
  }

  const turn = toTurn(model.columns);

  for (const columnIndex of shuffle(allColumnIndexes)) {
    const result = move(model.columns, columnIndex, turn);

    if (result.type === 'Err') {
      continue;
    }

    const modelNew = handleMoveResult(result, model);

    return modelNew;
  }

  return model;
};

const handleMoveResult = (
  result: MoveResult,
  model: GameModel
): GameModel | GameOverModel => {
  if (result.type === 'Err') {
    return model;
  }

  const columnsNew = result.value;

  const status = toStatus(columnsNew);

  if (status.type === 'Playing') {
    const modelNew: SharedModel = {
      ...model,
      columns: columnsNew,
      moveCountDown: model.moveTimeLimit,
    };

    return modelNew;
  }

  const gameOver: GameOver =
    status.type === 'Winner'
      ? { type: 'Winner', winner: status.winner }
      : { type: 'Draw' };

  const modelNew: SharedModel = {
    type: 'GameOver',
    moveTimeLimit: model.moveTimeLimit,
    PlayerOne: model.PlayerOne,
    PlayerTwo: model.PlayerTwo,
    columns: columnsNew,
    gameOver: gameOver,
    rematch: { type: 'NotAsking' },
  };

  return modelNew;
};

const shuffle = <X>(xs: X[]): X[] => {
  return [...xs].sort(() => (Math.random() > 0.5 ? -1 : 1));
};
