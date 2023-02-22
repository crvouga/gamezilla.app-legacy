import * as Chess from '@gamezilla/game/chess';
import * as ConnectFour from '@gamezilla/game/connect-four';
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
  | { type: 'tic-tac-toe'; child: TicTacToe.FrontendModel }
  | { type: 'connect-four'; child: ConnectFour.FrontendModel }
  | { type: 'chess'; child: Chess.FrontendModel }
  | { type: 'gomoku'; child: Gomoku.FrontendModel }
  | { type: 'tetris'; child: Tetris.FrontendModel }
  | { type: 'snake'; child: Snake.FrontendModel }
  | { type: 'maze'; child: Maze.FrontendModel };

export type BackendModel =
  | { type: 'tic-tac-toe'; child: TicTacToe.BackendModel }
  | { type: 'connect-four'; child: ConnectFour.BackendModel }
  | { type: 'chess'; child: Chess.BackendModel }
  | { type: 'gomoku'; child: Gomoku.BackendModel }
  | { type: 'tetris'; child: Tetris.BackendModel }
  | { type: 'snake'; child: Snake.BackendModel }
  | { type: 'maze'; child: Maze.BackendModel };

export type GameName = BackendModel['type'];

export const gameNames: { [gameName in GameName]: GameName } = {
  'tic-tac-toe': 'tic-tac-toe',
  'connect-four': 'connect-four',
  chess: 'chess',
  gomoku: 'gomoku',
  tetris: 'tetris',
  snake: 'snake',
  maze: 'maze',
};

export const gameNameList: GameName[] = [
  'chess',
  'connect-four',
  'tic-tac-toe',
  'gomoku',
];

//
//
//
// Msg
//
//
//

export type BackendMsg =
  | ['tic-tac-toe', TicTacToe.BackendMsg]
  | ['connect-four', ConnectFour.BackendMsg]
  | ['chess', Chess.BackendMsg]
  | ['gomoku', Gomoku.BackendMsg]
  | ['tetris', Tetris.BackendMsg]
  | ['snake', Snake.BackendMsg]
  | ['maze', Maze.BackendMsg];

export type FrontendMsg =
  | ['tic-tac-toe', TicTacToe.FrontendMsg]
  | ['connect-four', ConnectFour.FrontendMsg]
  | ['chess', Chess.FrontendMsg]
  | ['gomoku', Gomoku.FrontendMsg]
  | ['tetris', Tetris.FrontendMsg]
  | ['snake', Snake.FrontendMsg]
  | ['maze', Maze.FrontendMsg];

export type ToFrontend =
  | ['tic-tac-toe', TicTacToe.ToFrontend]
  | ['connect-four', ConnectFour.ToFrontend]
  | ['chess', Chess.ToFrontend]
  | ['gomoku', Gomoku.ToFrontend]
  | ['tetris', Tetris.ToFrontend]
  | ['snake', Snake.ToFrontend]
  | ['maze', Maze.ToFrontend];

export type ToBackend =
  | ['tic-tac-toe', TicTacToe.ToBackend]
  | ['connect-four', ConnectFour.ToBackend]
  | ['chess', Chess.ToBackend]
  | ['gomoku', Gomoku.ToBackend]
  | ['tetris', Tetris.ToBackend]
  | ['snake', Snake.ToBackend]
  | ['maze', Maze.ToBackend];
