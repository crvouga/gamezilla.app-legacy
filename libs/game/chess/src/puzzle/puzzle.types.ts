import { Result } from '@gamezilla/core';

// source https://database.lichess.org/#puzzles

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

export type Problem =
  | { type: 'database-error'; message: string }
  | { type: 'parsing-error'; message: string };

export type Req = ['find-many', PuzzleQuery];
export type Res = ['find-many', PuzzleQuery, Result<Problem, Puzzle[]>];
