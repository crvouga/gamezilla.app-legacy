import { Result } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import {
  Board,
  BotLevel,
  initBoard,
  move,
  MoveProblem,
  Stone,
  toBestMove,
  toOppositeStone,
  toTurn,
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

export type Model = SetupModel | GameModel;

export type SetupModel = {
  type: 'setup';
  userId: UserId | null;
  userStone: Stone;
  botLevel: BotLevel;
};

export type GameModel = {
  type: 'game';
  userId: UserId;
  userStone: Stone;
  botLevel: BotLevel;
  board: Board;
};

export type FrontendModel = Model;

export type BackendModel = Model;

export const initShared = ({ userId }: { userId: UserId | null }): Model => {
  return {
    type: 'setup',
    userId,
    userStone: 'white',
    botLevel: 'Medium',
  };
};

//
//
//
// Msg
//
//
//

export type FrontendMsg = Req;

export type BackendMsg = ['none'];

export type ToBackend = Req;

export type ToFrontend = Res | ['BotMoved', Model];

//
//
//
//
//

export type Req =
  // setup
  | ['start-playing']
  | ['stop-playing']
  | ['InputUserStone', { userStone: Stone }]
  | ['input-bot-level', { botLevel: BotLevel }]
  | ['start-game']
  // game
  | ['input-move', { position: Position }]
  | ['stop-game']
  | ['restart']
  | ['swap-sides'];

export type Res = [Req[0], Result<Problem, Model>];

export type Problem =
  | 'not_bot_turn'
  | 'must_be_player'
  | 'must_be_setup'
  | 'must_be_no_player'
  | 'must_be_game'
  | 'no_position'
  | MoveProblem;

export const handle = (
  { currentUserId }: { currentUserId: UserId },
  msg: Req,
  model: Model
): Result<Problem, Model> => {
  switch (msg[0]) {
    case 'input-bot-level': {
      if (model.type !== 'setup') {
        return Err('must_be_setup');
      }
      if (model.userId !== currentUserId) {
        return Err('must_be_player');
      }
      return Ok({
        ...model,
        botLevel: msg[1].botLevel,
      });
    }

    case 'InputUserStone': {
      if (model.type !== 'setup') {
        return Err('must_be_setup');
      }
      if (model.userId !== currentUserId) {
        return Err('must_be_player');
      }
      return Ok({
        ...model,
        userStone: msg[1].userStone,
      });
    }

    case 'start-playing': {
      if (model.type !== 'setup') {
        return Err('must_be_setup');
      }
      if (model.userId) {
        return Err('must_be_no_player');
      }
      return Ok({
        ...model,
        userId: currentUserId,
      });
    }

    case 'stop-playing': {
      if (model.type !== 'setup') {
        return Err('must_be_setup');
      }
      if (model.userId !== currentUserId) {
        return Err('must_be_player');
      }
      return Ok({
        ...model,
        userId: null,
      });
    }

    case 'start-game': {
      if (model.type !== 'setup') {
        return Err('must_be_setup');
      }
      if (model.userId !== currentUserId) {
        return Err('must_be_player');
      }
      return Ok({
        type: 'game',
        board: initBoard,
        botLevel: model.botLevel,
        userId: model.userId,
        userStone: model.userStone,
      });
    }

    case 'input-move': {
      if (model.type !== 'game') {
        return Err('must_be_game');
      }
      if (model.userId !== currentUserId) {
        return Err('must_be_player');
      }
      const moved = move({
        position: msg[1].position,
        stone: model.userStone,
        board: model.board,
      });
      if (moved.type === 'Err') {
        return moved;
      }
      return Ok({
        ...model,
        board: moved.value,
      });
    }

    case 'stop-game': {
      if (model.type !== 'game') {
        return Err('must_be_game');
      }
      if (model.userId !== currentUserId) {
        return Err('must_be_player');
      }
      return Ok({
        type: 'setup',
        botLevel: model.botLevel,
        userId: model.userId,
        userStone: model.userStone,
      });
    }

    case 'restart': {
      if (model.type !== 'game') {
        return Err('must_be_game');
      }
      if (model.userId !== currentUserId) {
        return Err('must_be_player');
      }
      return Ok({
        ...model,
        board: initBoard,
      });
    }

    case 'swap-sides': {
      if (model.type !== 'game') {
        return Err('must_be_game');
      }
      if (model.userId !== currentUserId) {
        return Err('must_be_player');
      }
      return Ok({
        ...model,
        board: initBoard,
        userStone: toOppositeStone(model.userStone),
      });
    }
  }
};

export const handleBotMove = (model: Model): Result<Problem, Model> => {
  if (model.type !== 'game') {
    return Err('must_be_game');
  }

  const isBotTurn = toTurn(model.board) === toOppositeStone(model.userStone);

  if (!isBotTurn) {
    return Err('not_bot_turn');
  }

  const botStone = toOppositeStone(model.userStone);

  const position = toBestMove({ stone: botStone, board: model.board });

  if (!position) {
    return Err('no_position');
  }

  const moved = move({ stone: botStone, position, board: model.board });

  if (moved.type === 'Err') {
    return moved;
  }

  const modelNew: Model = { ...model, board: moved.value };

  return Ok(modelNew);
};
