import { Result } from '@gamezilla/core';
import { PuzzleId } from './puzzle-id';

// source https://database.lichess.org/#puzzles

export type SharedModel = {
  activePuzzleId?: PuzzleId;
};

export const initShared: SharedModel = {};

export type PuzzleQuery = {
  puzzleId?: string;
};

export type Puzzle = {
  puzzle_id: string;
  FEN: string;
  moves: string[];
  rating: number;
  rating_deviation: number;
  popularity: number;
  number_of_plays: number;
  themes: string[];
  game_URL: string;
  opening_tags: string[];
};

export type PuzzleCompleted = {
  puzzleId: string;
  userId: string;
  seconds: number;
};

export type Req =
  | ['find-many', PuzzleQuery]
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
    [puzzleId: PuzzleId]: Puzzle;
  };
};
