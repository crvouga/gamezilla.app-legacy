import * as Chess from '@gamezilla/game/chess';
import * as ConnectFour from '@gamezilla/game/connect-four';
import * as Gomoku from '@gamezilla/game/gomoku';
import * as TicTacToe from '@gamezilla/game/tic-tac-toe';
import * as Tetris from '@gamezilla/game/tetris';
import * as Snake from '@gamezilla/game/snake';
import * as Maze from '@gamezilla/game/maze';

//
//
//
// Model
//
//
//

export type FrontendModel =
  | ['TicTacToe', TicTacToe.FrontendModel]
  | ['connect-four', ConnectFour.FrontendModel]
  | ['Chess', Chess.FrontendModel]
  | ['Gomoku', Gomoku.FrontendModel]
  | ['Tetris', Tetris.FrontendModel]
  | ['Snake', Snake.FrontendModel]
  | ['Maze', Maze.FrontendModel];

export type BackendModel =
  | ['TicTacToe', TicTacToe.BackendModel]
  | ['connect-four', ConnectFour.BackendModel]
  | ['Chess', Chess.BackendModel]
  | ['Gomoku', Gomoku.BackendModel]
  | ['Tetris', Tetris.BackendModel]
  | ['Snake', Snake.BackendModel]
  | ['Maze', Maze.BackendModel];

export type GameName = BackendModel[0];

export const gameNames: { [gameName in GameName]: GameName } = {
  TicTacToe: 'TicTacToe',
  'connect-four': 'connect-four',
  Chess: 'Chess',
  Gomoku: 'Gomoku',
  Tetris: 'Tetris',
  Snake: 'Snake',
  Maze: 'Maze',
};

export const gameNameList: GameName[] = [
  'Chess',
  'connect-four',
  'TicTacToe',
  'Gomoku',
];

//
//
//
// Msg
//
//
//

export type BackendMsg =
  | ['TicTacToe', TicTacToe.BackendMsg]
  | ['connect-four', ConnectFour.BackendMsg]
  | ['Chess', Chess.BackendMsg]
  | ['Gomoku', Gomoku.BackendMsg]
  | ['Tetris', Tetris.BackendMsg]
  | ['Snake', Snake.BackendMsg]
  | ['Maze', Maze.BackendMsg];

export type FrontendMsg =
  | ['TicTacToe', TicTacToe.FrontendMsg]
  | ['connect-four', ConnectFour.FrontendMsg]
  | ['Chess', Chess.FrontendMsg]
  | ['Gomoku', Gomoku.FrontendMsg]
  | ['Tetris', Tetris.FrontendMsg]
  | ['Snake', Snake.FrontendMsg]
  | ['Maze', Maze.FrontendMsg];

export type ToFrontend =
  | ['TicTacToe', TicTacToe.ToFrontend]
  | ['connect-four', ConnectFour.ToFrontend]
  | ['Chess', Chess.ToFrontend]
  | ['Gomoku', Gomoku.ToFrontend]
  | ['Tetris', Tetris.ToFrontend]
  | ['Snake', Snake.ToFrontend]
  | ['Maze', Maze.ToFrontend];

export type ToBackend =
  | ['TicTacToe', TicTacToe.ToBackend]
  | ['connect-four', ConnectFour.ToBackend]
  | ['Chess', Chess.ToBackend]
  | ['Gomoku', Gomoku.ToBackend]
  | ['Tetris', Tetris.ToBackend]
  | ['Snake', Snake.ToBackend]
  | ['Maze', Maze.ToBackend];
