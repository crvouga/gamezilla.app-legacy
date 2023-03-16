// source https://database.lichess.org/#puzzles

import { Result } from '@gamezilla/core';
import { z } from 'zod';

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

const Puzzle = z.object({
  puzzle_id: z.string(),
  FEN: z.string(),
  moves: z.array(z.string()),
  rating: z.number(),
  rating_deviation: z.number(),
  popularity: z.number(),
  number_of_plays: z.number(),
  themes: z.array(z.string()),
  game_URL: z.string(),
  opening_tags: z.array(z.string()),
});

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
