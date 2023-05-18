import * as Chess from '@gamezilla/game/chess';
import * as ConnectFour from '@gamezilla/game/connect-four';
import * as Flow from '@gamezilla/game/flow';
import * as Gomoku from '@gamezilla/game/gomoku';
import * as Maze from '@gamezilla/game/maze';
import * as Snake from '@gamezilla/game/snake';
import * as Tetris from '@gamezilla/game/tetris';
import * as TicTacToe from '@gamezilla/game/tic-tac-toe';

//
//
//
// Model
//
//
//

export type FrontendModel =
  | { t: 'tic-tac-toe'; c: TicTacToe.FrontendModel }
  | { t: 'connect-four'; c: ConnectFour.FrontendModel }
  | { t: 'chess'; c: Chess.FrontendModel }
  | { t: 'gomoku'; c: Gomoku.FrontendModel }
  | { t: 'tetris'; c: Tetris.FrontendModel }
  | { t: 'snake'; c: Snake.FrontendModel }
  | { t: 'maze'; c: Maze.FrontendModel }
  | { t: 'flow'; c: Flow.FrontendModel };

export type BackendModel =
  | { t: 'tic-tac-toe'; c: TicTacToe.BackendModel }
  | { t: 'connect-four'; c: ConnectFour.BackendModel }
  | { t: 'chess'; c: Chess.BackendModel }
  | { t: 'gomoku'; c: Gomoku.BackendModel }
  | { t: 'tetris'; c: Tetris.BackendModel }
  | { t: 'snake'; c: Snake.BackendModel }
  | { t: 'maze'; c: Maze.BackendModel }
  | { t: 'flow'; c: Flow.BackendModel };

//
//
//
// Msg
//
//
//

export type ServerMsg =
  | { t: 'tic-tac-toe'; c: TicTacToe.ServerMsg }
  | { t: 'connect-four'; c: ConnectFour.ServerMsg }
  | { t: 'chess'; c: Chess.ServerMsg }
  | { t: 'gomoku'; c: Gomoku.ServerMsg }
  | { t: 'tetris'; c: Tetris.ServerMsg }
  | { t: 'snake'; c: Snake.ServerMsg }
  | { t: 'maze'; c: Maze.ServerMsg }
  | { t: 'flow'; c: Flow.ServerMsg };

export type FrontendMsg =
  | { t: 'tic-tac-toe'; c: TicTacToe.FrontendMsg }
  | { t: 'connect-four'; c: ConnectFour.FrontendMsg }
  | { t: 'chess'; c: Chess.FrontendMsg }
  | { t: 'gomoku'; c: Gomoku.FrontendMsg }
  | { t: 'tetris'; c: Tetris.FrontendMsg }
  | { t: 'snake'; c: Snake.FrontendMsg }
  | { t: 'maze'; c: Maze.FrontendMsg }
  | { t: 'flow'; c: Flow.FrontendMsg };

export type ToFrontend =
  | { t: 'tic-tac-toe'; c: TicTacToe.ToFrontend }
  | { t: 'connect-four'; c: ConnectFour.ToFrontend }
  | { t: 'chess'; c: Chess.ToFrontend }
  | { t: 'gomoku'; c: Gomoku.ToFrontend }
  | { t: 'tetris'; c: Tetris.ToFrontend }
  | { t: 'snake'; c: Snake.ToFrontend }
  | { t: 'maze'; c: Maze.ToFrontend }
  | { t: 'flow'; c: Flow.ToFrontend };

export type ToBackend =
  | { t: 'tic-tac-toe'; c: TicTacToe.ToBackend }
  | { t: 'connect-four'; c: ConnectFour.ToBackend }
  | { t: 'chess'; c: Chess.ToBackend }
  | { t: 'gomoku'; c: Gomoku.ToBackend }
  | { t: 'tetris'; c: Tetris.ToBackend }
  | { t: 'snake'; c: Snake.ToBackend }
  | { t: 'maze'; c: Maze.ToBackend }
  | { t: 'flow'; c: Flow.ToBackend };

//
//
//
// Game Name
//
//
//

export type GameName = BackendModel['t'];

export const gameNames: { [gameName in GameName]: GameName } = {
  'tic-tac-toe': 'tic-tac-toe',
  'connect-four': 'connect-four',
  chess: 'chess',
  gomoku: 'gomoku',
  tetris: 'tetris',
  snake: 'snake',
  maze: 'maze',
  flow: 'flow',
};

export const gameNameList: GameName[] = [
  'chess',
  'connect-four',
  'tic-tac-toe',
  'gomoku',
  'flow',
  // 'snake',
  // 'tetris',
  // 'maze',
];
