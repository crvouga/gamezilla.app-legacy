import { Audio, Option, Result } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import * as Board from '../chess-board';

//
//
//
// Model
//
//
//

export type FrontendModel = {
  sharedModel: SharedModel;
  openedMenuId: Option<string>;
  openedModal: 'none' | 'GameOver';
  isFlipped: boolean;
};

export type BackendModel = SharedModel;

export type SharedModel = SetupModel | GameModel | GameOverModel;

export type SetupModel = {
  type: 'Setup';
  userColor: Board.Color;
  userId: UserId | 'none';
  botLevel: Board.BotLevel;
};

export type GameModel = {
  type: 'game';
  userColor: Board.Color;
  userId: UserId;
  board: Board.Model;
  botLevel: Board.BotLevel;
};

export type GameOverModel = {
  type: 'GameOver';
  gameOver: GameOver;
  userColor: Board.Color;
  userId: UserId;
  board: Board.Model;
  botLevel: Board.BotLevel;
};

export type GameOver = Board.GameOver;

export const initShared: SharedModel = {
  type: 'Setup',
  userColor: 'w',
  userId: 'none',
  botLevel: 1,
};

export const initBackend = ({
  userId,
}: {
  userId: UserId | 'none';
}): BackendModel => {
  return {
    type: 'Setup',
    botLevel: initShared.botLevel,
    userColor: initShared.userColor,
    userId,
  };
};

export const isBotTurn = (model: SharedModel) => {
  return model.type === 'game' && Board.toTurn(model.board) !== model.userColor;
};

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ['Audio_Done', Audio.PlayResult]
  | ['OpenedMenu', string]
  | ['ClosedMenu']
  | ['ClickedFlip']
  | ['ClosedModal']
  | Req;

export type BackendMsg = BotMoved;

export type ToBackend = ['Init'] | Req;

export type ToFrontend =
  | ['sync', SharedModel]
  | Res
  | BotMoved_Done
  | ['player-left', SharedModel];

export type Req =
  | InputUser
  | InputColor
  | InputBot
  | StartGame
  | StopGame
  | InputMove;

export type Res =
  | InputUser_Done
  | InputColor_Done
  | InputBot_Done
  | StartGame_Done
  | StopGame_Done
  | InputMove_Done;

//
//
//
//

export type InputUser = ['InputUser', { userId: UserId | 'none' }];
export type InputUser_Done = [
  'InputUser_Done',
  Result<'must_be_in_setup_mode', SharedModel>
];
export const inputUser = (
  { userId }: InputUser[1],
  model: SharedModel
): InputUser_Done[1] => {
  if (model.type !== 'Setup') {
    return Result.Err('must_be_in_setup_mode');
  }

  const modelNew: SharedModel = {
    ...model,
    userId,
  };

  return Result.Ok(modelNew);
};

export type InputColor = [
  'InputColor',
  { userColor: Board.Color; userId: UserId }
];
export type InputColor_Done = [
  'InputColor_Done',
  Result<InputColorProblem, SharedModel>
];

export type InputColorProblem = 'must_be_playing' | 'must_be_in_setup_mode';

export const inputColorProblemToString = (
  problem: InputColorProblem
): string => {
  switch (problem) {
    case 'must_be_in_setup_mode': {
      return 'Must be in setup mode';
    }

    case 'must_be_playing': {
      return 'Must be playing to change color';
    }
  }
};

export const inputColor = (
  { userColor, userId }: InputColor[1],
  model: SharedModel
): InputColor_Done[1] => {
  if (model.type !== 'Setup') {
    return Result.Err('must_be_in_setup_mode');
  }

  if (model.userId === 'none') {
    return Result.Err('must_be_playing');
  }

  if (model.userId !== userId) {
    return Result.Err('must_be_playing');
  }

  const modelNew: SharedModel = {
    ...model,
    userColor,
  };

  return Result.Ok(modelNew);
};

//
//
//
//

export type InputBot = [
  'InputBot',
  { botLevel: Board.BotLevel; userId: UserId }
];
export type InputBot_Done = [
  'InputBot_Done',
  Result<InputBotProblem, SharedModel>
];
export type InputBotProblem = 'must_be_in_setup_mode' | 'must_be_playing';

export const inputBotProblemToString = (problem: InputBotProblem): string => {
  switch (problem) {
    case 'must_be_in_setup_mode': {
      return 'Must be in setup mode';
    }

    case 'must_be_playing': {
      return 'Must be playing to change bot';
    }
  }
};

export const inputBot = (
  { botLevel, userId }: InputBot[1],
  model: SharedModel
): InputBot_Done[1] => {
  if (model.type !== 'Setup') {
    return Result.Err('must_be_in_setup_mode');
  }

  if (model.userId === 'none') {
    return Result.Err('must_be_playing');
  }

  if (model.userId !== userId) {
    return Result.Err('must_be_playing');
  }

  const modelNew: SharedModel = {
    ...model,
    botLevel: botLevel,
  };
  return Result.Ok(modelNew);
};

export type StartGame = ['start-game', { userId: UserId }];
export type StartGame_Done = [
  'StartGame_Done',
  Result<StartGameProblem, SharedModel>
];
export type StartGameProblem =
  | 'must_be_in_setup_mode'
  | 'user_is_missing'
  | 'must_be_the_player';

export const startGameProblemToString = (problem: StartGameProblem): string => {
  switch (problem) {
    case 'must_be_in_setup_mode': {
      return 'Game must be in setup mode';
    }

    case 'must_be_the_player': {
      return 'Must be playing to start game';
    }

    case 'user_is_missing': {
      return 'Nobody is playing';
    }
  }
};

export const startGame = (
  { userId }: StartGame[1],
  model: SharedModel
): StartGame_Done[1] => {
  if (model.type !== 'Setup') {
    return Result.Err('must_be_in_setup_mode');
  }

  if (model.userId === 'none') {
    return Result.Err('user_is_missing');
  }

  if (model.userId !== userId) {
    return Result.Err('must_be_the_player');
  }

  const modelNew: SharedModel = {
    type: 'game',
    board: Board.init(),
    botLevel: model.botLevel,
    userColor: model.userColor,
    userId: model.userId,
  };

  return Result.Ok(modelNew);
};

//
//
//
//

export type StopGame = ['stop-game', { userId: UserId }];
export type StopGame_Done = [
  'StopGame_Done',
  Result<'must_be_playing', SharedModel>
];

export const stopGameResultToString = (result: StopGame_Done[1]): string => {
  if (result.type === 'Ok') {
    return '';
  }

  const problem = result.error;

  switch (problem) {
    case 'must_be_playing': {
      return 'Must be playing to stop the game';
    }
  }
};

export const stopGame = (
  { userId }: StopGame[1],
  model: SharedModel
): StopGame_Done[1] => {
  if (model.userId !== userId) {
    return Result.Err('must_be_playing');
  }

  const modelNew: SharedModel = {
    type: 'Setup',
    botLevel: model.botLevel,
    userColor: model.userColor,
    userId: model.userId,
  };

  return Result.Ok(modelNew);
};

//
//
//
//
//
//
//

export type InputMove = ['input-move', Board.MoveInput & { userId: UserId }];

export type InputMove_Done = [
  'InputMove_Done',
  Result<InputMoveProblem, SharedModel & { didCapture: boolean }>
];

export type InputMoveProblem =
  | Board.MoveProblem
  | 'must_be_started'
  | 'must_be_playing'
  | 'must_be_turn';

export const inputMove = (
  { userId, ...moveInput }: InputMove[1],
  model: SharedModel
): InputMove_Done[1] => {
  if (model.type !== 'game') {
    return Result.Err('must_be_started');
  }

  if (model.userId !== userId) {
    return Result.Err('must_be_playing');
  }

  if (Board.toTurn(model.board) !== model.userColor) {
    return Result.Err('must_be_turn');
  }

  const result = Board.move(moveInput, model.board);

  if (result.type === 'Err') {
    return result;
  }

  const boardNew = result.value;

  const gameOver = Board.toGameOver(boardNew);

  if (gameOver.type !== 'none') {
    const modelNew: SharedModel = {
      ...model,
      type: 'GameOver',
      board: boardNew,
      gameOver: gameOver,
    };

    return Result.Ok({
      ...modelNew,
      didCapture: boardNew.didCapture,
    });
  }

  const modelNew: SharedModel = {
    ...model,
    board: boardNew,
  };

  return Result.Ok({
    ...modelNew,
    didCapture: boardNew.didCapture,
  });
};

//
//
//
// Bot Moved
//
//
//

export type BotMoved = ['bot-moved', Board.BestMoveInputResult];
export type BotMoved_Done = [
  'bot-moved_Done',
  Result<BotMovedProblem, SharedModel & { didCapture: boolean }>
];
export type BotMovedProblem =
  | Board.MoveProblem
  | Board.BestMoveInputProblem
  | 'must_be_started'
  | 'must_be_turn';

export const botMoved = (
  botMoveResult: BotMoved[1],
  model: SharedModel
): BotMoved_Done[1] => {
  if (model.type !== 'game') {
    return Result.Err('must_be_started');
  }

  if (botMoveResult.type === 'Err') {
    return botMoveResult;
  }

  const botMoveInput = botMoveResult.value;

  const botColor = Board.toOppositeColor(model.userColor);

  if (Board.toTurn(model.board) !== botColor) {
    return Result.Err('must_be_turn');
  }

  const result = Board.move(botMoveInput, model.board);

  if (result.type === 'Err') {
    return result;
  }

  const { didCapture, ...boardNew } = result.value;

  const gameOver = Board.toGameOver(boardNew);

  if (gameOver.type !== 'none') {
    const modelNew: SharedModel = {
      ...model,
      type: 'GameOver',
      gameOver: gameOver,
      board: boardNew,
    };
    return Result.Ok({ ...modelNew, didCapture });
  }

  return Result.Ok({
    ...model,
    board: boardNew,
    didCapture,
  });
};
