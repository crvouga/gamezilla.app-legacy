import { Result } from '@gamezilla/core';
import * as ChessBoard from '../chess/chess-board';
import { PuzzleId } from './puzzle-id';

// source https://database.lichess.org/#puzzles

export type SharedModel = {
  activePuzzleId?: PuzzleId;
  activeQuery: PuzzleQuery;
};

export const initShared: SharedModel = {
  activeQuery: {
    ratingRange: {
      direction: 'descend',
      value: 1000,
    },
    popularity: {
      direction: 'descend',
      value: 5000,
    },
    pageSize: 25,
    pageIndex: 0,
  },
};

type SortDirection = 'ascend' | 'descend';

export type PuzzleQuery = {
  ratingRange: {
    direction: SortDirection;
    value: number;
  };
  popularity: {
    direction: SortDirection;
    value: number;
  };
  pageSize: number;
  pageIndex: number;
};

export type Puzzle = {
  puzzleId: string;
  fen: string;
  moves: string[];
  rating: number;
  ratingDeviation: number;
  popularity: number;
  numberOfPlays: number;
  themes: string[];
  gameUrl: string;
  openingTags: string[];
};

export type PuzzleCompleted = {
  puzzleId: string;
  userId: string;
  seconds: number;
};

export type Req =
  | ['query', PuzzleQuery]
  | ['input-move', string]
  | ['upload-lichess-db-puzzle'];

export type Res = [...Req, Result<string, Puzzle[]>];

export type BackendMsg = ['upload-lichess-db-puzzle-done'];

export type FrontendMsg = Req;

export type ToBackend = Req;

export type ToFrontend = Res;

export type BackendModel = SharedModel & {
  isUploadingLichessDbPuzzle?: boolean;
};

export type FrontendModel = SharedModel & {
  puzzles: {
    [puzzleId: string]: Puzzle;
  };
  board: ChessBoard.Model;
};
