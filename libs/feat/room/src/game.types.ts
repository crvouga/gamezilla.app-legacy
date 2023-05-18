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

export type ClientModel =
  | { t: 'tic-tac-toe'; c: TicTacToe.ClientModel }
  | { t: 'connect-four'; c: ConnectFour.ClientModel }
  | { t: 'chess'; c: Chess.ClientModel }
  | { t: 'gomoku'; c: Gomoku.ClientModel }
  | { t: 'tetris'; c: Tetris.ClientModel }
  | { t: 'snake'; c: Snake.ClientModel }
  | { t: 'maze'; c: Maze.ClientModel }
  | { t: 'flow'; c: Flow.ClientModel };

export type ServerModel =
  | { t: 'tic-tac-toe'; c: TicTacToe.ServerModel }
  | { t: 'connect-four'; c: ConnectFour.ServerModel }
  | { t: 'chess'; c: Chess.ServerModel }
  | { t: 'gomoku'; c: Gomoku.ServerModel }
  | { t: 'tetris'; c: Tetris.ServerModel }
  | { t: 'snake'; c: Snake.ServerModel }
  | { t: 'maze'; c: Maze.ServerModel }
  | { t: 'flow'; c: Flow.ServerModel };

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

export type ClientMsg =
  | { t: 'tic-tac-toe'; c: TicTacToe.ClientMsg }
  | { t: 'connect-four'; c: ConnectFour.ClientMsg }
  | { t: 'chess'; c: Chess.ClientMsg }
  | { t: 'gomoku'; c: Gomoku.ClientMsg }
  | { t: 'tetris'; c: Tetris.ClientMsg }
  | { t: 'snake'; c: Snake.ClientMsg }
  | { t: 'maze'; c: Maze.ClientMsg }
  | { t: 'flow'; c: Flow.ClientMsg };

export type ToClient =
  | { t: 'tic-tac-toe'; c: TicTacToe.ToClient }
  | { t: 'connect-four'; c: ConnectFour.ToClient }
  | { t: 'chess'; c: Chess.ToClient }
  | { t: 'gomoku'; c: Gomoku.ToClient }
  | { t: 'tetris'; c: Tetris.ToClient }
  | { t: 'snake'; c: Snake.ToClient }
  | { t: 'maze'; c: Maze.ToClient }
  | { t: 'flow'; c: Flow.ToClient };

export type ToServer =
  | { t: 'tic-tac-toe'; c: TicTacToe.ToServer }
  | { t: 'connect-four'; c: ConnectFour.ToServer }
  | { t: 'chess'; c: Chess.ToServer }
  | { t: 'gomoku'; c: Gomoku.ToServer }
  | { t: 'tetris'; c: Tetris.ToServer }
  | { t: 'snake'; c: Snake.ToServer }
  | { t: 'maze'; c: Maze.ToServer }
  | { t: 'flow'; c: Flow.ToServer };

//
//
//
// Game Name
//
//
//

export type GameName = ServerModel['t'];

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
