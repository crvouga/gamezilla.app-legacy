import { Err, Ok, Result, exhaustive } from '@gamezilla/shared/core';
import { UserId } from '@gamezilla/shared/app';
import {
  BestMoveProblem,
  BestMoveResult,
  ColumnIndex,
  Columns,
  MoveProblem,
  PlayerType,
  emptyColumns,
  move,
  opposite,
  toStatus,
} from '../connect-four/connect-four';

//
//
// Model
//
//

export type SharedModel = SetupModel | GameModel;

export type SetupModel = {
  type: 'Setup';
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  player: UserId | 'none';
};

export type GameModel = {
  type: 'game';
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  player: UserId;
  columns: Columns;
};

export const isBotTurn = (model: SharedModel): boolean => {
  if (model.type !== 'game') {
    return false;
  }
  const status = toStatus(model.columns);
  return (
    status.type === 'Playing' && status.turn === opposite[model.userPlayerType]
  );
};

export type BackendModel = SharedModel;

export type FrontendGameModel = GameModel & {
  ghostIndex: ColumnIndex | 'none';
};

export type FrontendModel = SetupModel | FrontendGameModel;

export const initShared = ({
  player,
}: {
  player: UserId | 'none';
}): SharedModel => {
  return {
    type: 'Setup',
    botLevel: 'Medium',
    player: player,
    userPlayerType: 'PlayerOne',
  };
};

//
//
//
//

export type GameOver = { type: 'Tie' } | { type: 'Winner'; winner: PlayerType };

export const toGameOver = (model: SharedModel): GameOver | { type: 'none' } => {
  switch (model.type) {
    case 'game': {
      const status = toStatus(model.columns);
      switch (status.type) {
        case 'Playing': {
          return { type: 'none' };
        }
        case 'Tie': {
          return { type: 'Tie' };
        }

        case 'Winner': {
          return { type: 'Winner', winner: status.winner };
        }

        default: {
          return { type: 'none' };
        }
      }
    }

    case 'Setup': {
      return { type: 'none' };
    }
  }
};

export type BotLevel = 'Easy' | 'Medium' | 'Hard';

export const botLevel: { [botLevel in BotLevel]: BotLevel } = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard',
};

//
//
// Msg
//
//

export type FrontendMsg =
  | Req
  | ['hovered', { columnIndex: ColumnIndex }]
  | ['animate'];

export type ServerMsg = ['bot-move', BestMoveResult];

export type ToFrontend =
  | Res
  | ['player-left', SharedModel]
  | ['bot-move', BotMoveResult];

export type ToBackend = Req;

export type Req =
  | ['start-playing']
  | ['stop-playing']
  | ['input-player-type', { playerType: PlayerType }]
  | ['input-bot-level', { botLevel: BotLevel }]
  | ['start-game']
  | ['input-move', { columnIndex: ColumnIndex }]
  | ['stop-game']
  | ['swap-sides']
  | ['restart'];

export type Res = [Req[0], Result<Problem, SharedModel>];

export type Problem =
  | 'not_setup'
  | 'not_game'
  | 'player_taken'
  | 'not_playing'
  | 'missing_player'
  | MoveProblem;

//
//
//
//

export const handle = (
  { currentUserId }: { currentUserId: UserId },
  msg: Req,
  model: SharedModel
): Result<Problem, SharedModel> => {
  switch (msg[0]) {
    case 'start-playing': {
      if (model.type !== 'Setup') {
        return Err('not_setup');
      }

      if (model.player !== 'none') {
        return Err('player_taken');
      }

      const modelNew: SharedModel = {
        ...model,
        player: currentUserId,
      };

      return Ok(modelNew);
    }

    case 'stop-playing': {
      if (model.type !== 'Setup') {
        return Err('not_setup');
      }

      if (model.player === 'none') {
        return Err('not_playing');
      }

      if (model.player !== currentUserId) {
        return Err('not_playing');
      }

      const modelNew: SharedModel = {
        ...model,
        player: 'none',
      };

      return Ok(modelNew);
    }

    case 'input-player-type': {
      if (model.type !== 'Setup') {
        return Err('not_setup');
      }

      if (model.player !== currentUserId) {
        return Err('not_playing');
      }

      const modelNew: SharedModel = {
        ...model,
        userPlayerType: msg[1].playerType,
      };

      return Ok(modelNew);
    }

    case 'input-bot-level': {
      if (model.type !== 'Setup') {
        return Err('not_setup');
      }

      if (model.player !== currentUserId) {
        return Err('not_playing');
      }

      const modelNew: SharedModel = {
        ...model,
        botLevel: msg[1].botLevel,
      };

      return Ok(modelNew);
    }

    case 'start-game': {
      if (model.type !== 'Setup') {
        return Err('not_setup');
      }

      if (model.player !== currentUserId) {
        return Err('not_playing');
      }

      if (model.player === 'none') {
        return Err('missing_player');
      }

      const modelNew: SharedModel = {
        type: 'game',
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
        columns: emptyColumns,
      };

      return Ok(modelNew);
    }

    case 'stop-game': {
      if (model.type !== 'game') {
        return Err('not_game');
      }

      if (model.player !== currentUserId) {
        return Err('not_playing');
      }

      const modelNew: SharedModel = {
        type: 'Setup',
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
      };

      return Ok(modelNew);
    }

    case 'swap-sides': {
      if (model.type !== 'game') {
        return Err('not_game');
      }

      if (model.player !== currentUserId) {
        return Err('not_playing');
      }

      const modelNew: SharedModel = {
        ...model,
        columns: emptyColumns,
        userPlayerType: opposite[model.userPlayerType],
      };

      return Ok(modelNew);
    }

    case 'input-move': {
      if (model.type !== 'game') {
        return Err('not_game');
      }

      if (model.player !== currentUserId) {
        return Err('not_playing');
      }

      const result = move(
        model.columns,
        msg[1].columnIndex,
        model.userPlayerType
      );

      if (result.type === 'Err') {
        return result;
      }

      const modelNew: SharedModel = {
        ...model,
        columns: result.value,
      };

      return Ok(modelNew);
    }

    case 'restart': {
      if (model.type !== 'game') {
        return Err('not_game');
      }

      if (model.player !== currentUserId) {
        return Err('not_playing');
      }

      const modelNew: GameModel = {
        ...model,
        columns: emptyColumns,
      };

      return Ok(modelNew);
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

type BotMoveResult = Result<
  MoveProblem | BestMoveProblem | 'not_game',
  SharedModel
>;

export const botMove = (
  bestMoveResult: BestMoveResult,
  model: SharedModel
): BotMoveResult => {
  if (model.type !== 'game') {
    return Err('not_game');
  }

  if (bestMoveResult.type === 'Err') {
    return bestMoveResult;
  }

  const moveResult = move(
    model.columns,
    bestMoveResult.value,
    opposite[model.userPlayerType]
  );

  if (moveResult.type === 'Err') {
    return moveResult;
  }

  const modelNew: SharedModel = {
    ...model,
    columns: moveResult.value,
  };

  return Ok(modelNew);
};
