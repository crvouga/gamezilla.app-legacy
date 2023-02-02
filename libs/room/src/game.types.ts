import * as Chess from '@gamezilla/game/chess';
import * as ConnectFour from '@gamezilla/game/connect-four';
import * as gomoku from '@gamezilla/game/gomoku';
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
  | { type: 'tic-tac-toe'; child: TicTacToe.FrontendModel }
  | { type: 'connect-four'; child: ConnectFour.FrontendModel }
  | { type: 'Chess'; child: Chess.FrontendModel }
  | { type: 'gomoku'; child: gomoku.FrontendModel }
  | { type: 'Tetris'; child: Tetris.FrontendModel }
  | { type: 'Snake'; child: Snake.FrontendModel }
  | { type: 'Maze'; child: Maze.FrontendModel };

export type BackendModel =
  | { type: 'tic-tac-toe'; child: TicTacToe.BackendModel }
  | { type: 'connect-four'; child: ConnectFour.BackendModel }
  | { type: 'Chess'; child: Chess.BackendModel }
  | { type: 'gomoku'; child: gomoku.BackendModel }
  | { type: 'Tetris'; child: Tetris.BackendModel }
  | { type: 'Snake'; child: Snake.BackendModel }
  | { type: 'Maze'; child: Maze.BackendModel };

export type GameName = BackendModel['type'];

export const gameNames: { [gameName in GameName]: GameName } = {
  'tic-tac-toe': 'tic-tac-toe',
  'connect-four': 'connect-four',
  Chess: 'Chess',
  gomoku: 'gomoku',
  Tetris: 'Tetris',
  Snake: 'Snake',
  Maze: 'Maze',
};

export const gameNameList: GameName[] = [
  'Chess',
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
  | ['Chess', Chess.BackendMsg]
  | ['gomoku', gomoku.BackendMsg]
  | ['Tetris', Tetris.BackendMsg]
  | ['Snake', Snake.BackendMsg]
  | ['Maze', Maze.BackendMsg];

export type FrontendMsg =
  | ['tic-tac-toe', TicTacToe.FrontendMsg]
  | ['connect-four', ConnectFour.FrontendMsg]
  | ['Chess', Chess.FrontendMsg]
  | ['gomoku', gomoku.FrontendMsg]
  | ['Tetris', Tetris.FrontendMsg]
  | ['Snake', Snake.FrontendMsg]
  | ['Maze', Maze.FrontendMsg];

export type ToFrontend =
  | ['tic-tac-toe', TicTacToe.ToFrontend]
  | ['connect-four', ConnectFour.ToFrontend]
  | ['Chess', Chess.ToFrontend]
  | ['gomoku', gomoku.ToFrontend]
  | ['Tetris', Tetris.ToFrontend]
  | ['Snake', Snake.ToFrontend]
  | ['Maze', Maze.ToFrontend];

export type ToBackend =
  | ['tic-tac-toe', TicTacToe.ToBackend]
  | ['connect-four', ConnectFour.ToBackend]
  | ['Chess', Chess.ToBackend]
  | ['gomoku', gomoku.ToBackend]
  | ['Tetris', Tetris.ToBackend]
  | ['Snake', Snake.ToBackend]
  | ['Maze', Maze.ToBackend];
