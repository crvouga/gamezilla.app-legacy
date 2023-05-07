import { Result } from '@gamezilla/shared/core';
import { UserId } from '@gamezilla/shared/app';
import {
  Board,
  BotLevel,
  emptyBoard,
  GetBestMoveProblem,
  move,
  MoveProblem,
  PlayerType,
  Position,
  toOpposite,
  toStatus,
} from '../tic-tic-toe/tic-tac-toe';

const { Err, Ok } = Result;

//
//
//
// Model
//
//
//

export type SharedModel = SetupModel | GameModel;

export type SetupModel = {
  type: 'Setup';
  player: UserId | 'none';
  userPlayerType: PlayerType;
  botLevel: BotLevel;
};

export type GameModel = {
  type: 'game';
  player: UserId;
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  board: Board;
};

export type FrontendModel = SharedModel;

export type BackendModel = SharedModel;

export const initSharedModel = ({
  userId,
}: {
  userId: SetupModel['player'];
}): SharedModel => {
  return {
    type: 'Setup',
    botLevel: 'Medium',
    userPlayerType: 'X',
    player: userId,
  };
};

export const isBotTurn = (model: SharedModel): model is GameModel => {
  if (model.type !== 'game') {
    return false;
  }

  const status = toStatus(model.board);

  return (
    status.type === 'Turn' && status.turn === toOpposite(model.userPlayerType)
  );
};

//
//
//
// Msg
//
//
//

export type FrontendMsg = Req | ['animate'];

export type BackendMsg = BotMove;

export type ToBackend = Req;

export type ToFrontend = Res | BotMove_Done | ['player-left', SharedModel];

export type Req =
  | InputBot
  | InputPlayerType
  | StartPlaying
  | StopPlaying
  | StartGame
  | StopGame
  | InputMove
  | SwapSides
  | Restart;

export type Res =
  | InputBot_Done
  | InputPlayerType_Done
  | StartPlaying_Done
  | StopPlaying_Done
  | StartGame_Done
  | StopGame_Done
  | InputMove_Done
  | SwapSidesDone
  | Restart_Done;

//
//
//
//
//
//

type InputPlayerType = [
  'input-player-type',
  { userId: UserId; playerType: PlayerType }
];
type InputPlayerType_Done = [
  'InputPlayerType_Done',
  Result<InputPlayerTypeProblem, SharedModel>
];
type InputPlayerTypeProblem = 'not_playing' | 'not_in_setup';

export const inputPlayerType = (
  { userId, playerType }: InputPlayerType[1],
  model: SharedModel
): InputPlayerType_Done[1] => {
  if (model.type !== 'Setup') {
    return Err('not_in_setup');
  }

  if (model.player !== userId) {
    return Err('not_playing');
  }

  const modelNew: SharedModel = {
    ...model,
    userPlayerType: playerType,
  };

  return Ok(modelNew);
};

export const inputPlayerTypeToString = (
  result: InputPlayerType_Done[1]
): string => {
  if (result.type === 'Ok') {
    return '';
  }

  switch (result.error) {
    case 'not_in_setup': {
      return 'Must be in setup mode to change player player';
    }

    case 'not_playing': {
      return 'Must be playing to change';
    }
  }
};

//
//
//
//
//
//

type InputBot = ['InputBot', { userId: UserId; botLevel: BotLevel }];
type InputBot_Done = ['InputBot_Done', Result<InputBotProblem, SharedModel>];
type InputBotProblem = 'not_playing' | 'not_in_setup';

export const inputBot = (
  { userId, botLevel }: InputBot[1],
  model: SharedModel
): InputBot_Done[1] => {
  if (model.type !== 'Setup') {
    return Err('not_in_setup');
  }

  if (model.player !== userId) {
    return Err('not_playing');
  }

  const modelNew: SharedModel = {
    ...model,
    botLevel: botLevel,
  };

  return Ok(modelNew);
};

export const inputBotToString = (result: InputBot_Done[1]): string => {
  if (result.type === 'Ok') {
    return '';
  }

  switch (result.error) {
    case 'not_in_setup': {
      return 'Must be in setup mode to change';
    }

    case 'not_playing': {
      return 'Must be playing to change';
    }
  }
};

//
//
//
//
//
type StartPlaying = ['start-playing', { userId: UserId }];
type StartPlaying_Done = [
  'StartPlaying_Done',
  Result<StartPlayingProblem, SharedModel>
];
type StartPlayingProblem = 'player_is_taken' | 'not_in_setup';

export const startPlaying = (
  { userId }: StartPlaying[1],
  model: SharedModel
): StartPlaying_Done[1] => {
  if (model.type !== 'Setup') {
    return Err('not_in_setup');
  }

  if (model.player !== 'none') {
    return Err('player_is_taken');
  }

  return Ok({
    ...model,
    player: userId,
  });
};

type StopPlaying = ['stop-playing', { userId: UserId }];
type StopPlaying_Done = [
  'StopPlaying_Done',
  Result<StopPlayingProblem, SharedModel>
];
type StopPlayingProblem = 'not_in_setup' | 'not_playing';

export const stopPlaying = (
  { userId }: StopPlaying[1],
  model: SharedModel
): StopPlaying_Done[1] => {
  if (model.type !== 'Setup') {
    return Err('not_in_setup');
  }

  if (model.player !== userId) {
    return Err('not_playing');
  }

  return Ok({
    ...model,
    player: 'none',
  });
};

//
//
//
//
//

type StartGame = ['start-game', { userId: UserId }];
type StartGame_Done = ['StartGame_Done', Result<StartGameProblem, SharedModel>];
type StartGameProblem = 'not_in_setup' | 'missing_player' | 'not_playing';

export const startGame = (
  { userId }: StartGame[1],
  model: SharedModel
): StartGame_Done[1] => {
  if (model.type !== 'Setup') {
    return Err('not_in_setup');
  }

  if (model.player === 'none') {
    return Err('missing_player');
  }

  if (model.player !== userId) {
    return Err('not_playing');
  }

  const modelNew: SharedModel = {
    type: 'game',
    board: emptyBoard,
    botLevel: model.botLevel,
    player: model.player,
    userPlayerType: model.userPlayerType,
  };

  return Ok(modelNew);
};

//
//
//
//

type StopGame = ['stop-game', { userId: UserId }];
type StopGame_Done = ['StopGame_Done', Result<StopGameProblem, SharedModel>];
type StopGameProblem = 'not_started' | 'not_playing';

export const stopGame = (
  { userId }: StopGame[1],
  model: SharedModel
): StopGame_Done[1] => {
  if (model.type !== 'game') {
    return Err('not_started');
  }

  if (model.player !== userId) {
    return Err('not_playing');
  }

  return Ok({
    type: 'Setup',
    botLevel: model.botLevel,
    player: model.player,
    userPlayerType: model.userPlayerType,
  });
};

//
//
//
//

type Restart = ['restart', { userId: UserId }];
type Restart_Done = ['restart-done', Result<RestartProblem, SharedModel>];
type RestartProblem = 'not_playing' | 'not_in_game';

export const restart = (
  { userId }: Restart[1],
  model: SharedModel
): Restart_Done[1] => {
  if (model.type !== 'game') {
    return Err('not_in_game');
  }

  if (model.player !== userId) {
    return Err('not_playing');
  }

  return Ok({
    ...model,
    board: emptyBoard,
  });
};

//
//
//
//

type InputMove = ['input-move', { userId: UserId; position: Position }];
type InputMove_Done = [
  'input-move-done',
  Result<InputMoveProblem, SharedModel>
];
type InputMoveProblem = MoveProblem | 'not_in_game' | 'not_playing';

export const inputMove = (
  { userId, position }: InputMove[1],
  model: SharedModel
): InputMove_Done[1] => {
  if (model.type !== 'game') {
    return Err('not_in_game');
  }

  if (model.player !== userId) {
    return Err('not_playing');
  }

  const result = move({
    board: model.board,
    player: model.userPlayerType,
    position,
  });

  if (result.type === 'Err') {
    return result;
  }

  const modelNext: SharedModel = {
    ...model,
    board: result.value,
  };

  return Ok(modelNext);
};

//
//
//
//

type SwapSides = ['swap-sides', { userId: UserId }];
type SwapSidesDone = ['swap-sides-done', Result<SwapSideProblem, SharedModel>];
type SwapSideProblem = 'not_in_game' | 'not_playing';

export const swapSides = (
  { userId }: SwapSides[1],
  model: SharedModel
): SwapSidesDone[1] => {
  if (model.type !== 'game') {
    return Err('not_in_game');
  }

  if (model.player !== userId) {
    return Err('not_playing');
  }

  const modelNext: SharedModel = {
    ...model,
    board: emptyBoard,
    userPlayerType: toOpposite(model.userPlayerType),
  };

  return Ok(modelNext);
};

//
//
//
//
//

type BotMove = ['bot-move', Result<GetBestMoveProblem, Position>];
type BotMove_Done = ['bot-move-done', Result<BotMoveProblem, SharedModel>];
type BotMoveProblem = 'not_in_game' | MoveProblem | GetBestMoveProblem;

export const botMove = (
  botMoveResult: BotMove[1],
  model: SharedModel
): BotMove_Done[1] => {
  if (model.type !== 'game') {
    return Err('not_in_game');
  }

  if (botMoveResult.type === 'Err') {
    return botMoveResult;
  }

  const position = botMoveResult.value;

  const botPlayerType = toOpposite(model.userPlayerType);

  const moveResult = move({
    board: model.board,
    player: botPlayerType,
    position,
  });

  if (moveResult.type === 'Err') {
    return moveResult;
  }

  const modelNext: SharedModel = {
    ...model,
    board: moveResult.value,
  };

  return Ok(modelNext);
};
