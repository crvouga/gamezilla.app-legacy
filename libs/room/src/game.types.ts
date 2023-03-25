import * as Chess from '@gamezilla/game/chess';
import * as ConnectFour from '@gamezilla/game/connect-four';
import * as Flow from '@gamezilla/game/flow';
import * as Gomoku from '@gamezilla/game/gomoku';
import * as Maze from '@gamezilla/game/maze';
import * as Snake from '@gamezilla/game/snake';
import * as Tetris from '@gamezilla/game/tetris';
import * as TicTacToe from '@gamezilla/game/tic-tac-toe';
import { z } from 'zod';

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
  | { type: 'maze'; child: Maze.FrontendModel }
  | { type: 'flow'; child: Flow.FrontendModel };

export type BackendModel =
  | { type: 'tic-tac-toe'; child: TicTacToe.BackendModel }
  | { type: 'connect-four'; child: ConnectFour.BackendModel }
  | { type: 'chess'; child: Chess.BackendModel }
  | { type: 'gomoku'; child: Gomoku.BackendModel }
  | { type: 'tetris'; child: Tetris.BackendModel }
  | { type: 'snake'; child: Snake.BackendModel }
  | { type: 'maze'; child: Maze.BackendModel }
  | { type: 'flow'; child: Flow.BackendModel };

export const BackendModel = z.discriminatedUnion('type', [
  z.object({ type: z.literal('tic-tac-toe'), child: TicTacToe.BackendModel }),
  // z.object({
  //   type: z.literal('connect-four'),
  //   child: ConnectFour.BackendModel,
  // }),
  // z.object({ type: z.literal('chess'), child: Chess.BackendModel }),
  // z.object({ type: z.literal('gomoku'), child: Gomoku.BackendModel }),
  // z.object({ type: z.literal('tetris'), child: Tetris.BackendModel }),
  // z.object({ type: z.literal('snake'), child: Snake.BackendModel }),
  // z.object({ type: z.literal('maze'), child: Maze.BackendModel }),
  // z.object({ type: z.literal('flow'), child: Flow.BackendModel }),
]);

export type GameName = BackendModel['type'];

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
  'snake',
  'tetris',
  'maze',
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
  | ['maze', Maze.BackendMsg]
  | ['flow', Flow.BackendMsg];

export type FrontendMsg =
  | ['tic-tac-toe', TicTacToe.FrontendMsg]
  | ['connect-four', ConnectFour.FrontendMsg]
  | ['chess', Chess.FrontendMsg]
  | ['gomoku', Gomoku.FrontendMsg]
  | ['tetris', Tetris.FrontendMsg]
  | ['snake', Snake.FrontendMsg]
  | ['maze', Maze.FrontendMsg]
  | ['flow', Flow.FrontendMsg];

export type ToFrontend =
  | ['tic-tac-toe', TicTacToe.ToFrontend]
  | ['connect-four', ConnectFour.ToFrontend]
  | ['chess', Chess.ToFrontend]
  | ['gomoku', Gomoku.ToFrontend]
  | ['tetris', Tetris.ToFrontend]
  | ['snake', Snake.ToFrontend]
  | ['maze', Maze.ToFrontend]
  | ['flow', Flow.ToFrontend];

export type ToBackend =
  | ['tic-tac-toe', TicTacToe.ToBackend]
  | ['connect-four', ConnectFour.ToBackend]
  | ['chess', Chess.ToBackend]
  | ['gomoku', Gomoku.ToBackend]
  | ['tetris', Tetris.ToBackend]
  | ['snake', Snake.ToBackend]
  | ['maze', Maze.ToBackend]
  | ['flow', Flow.ToBackend];
