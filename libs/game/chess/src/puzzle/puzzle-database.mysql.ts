import { Result } from '@gamezilla/core';
import { DatabaseConnectionMySQL } from '@gamezilla/shared/backend';
import { z } from 'zod';

// source https://database.lichess.org/#puzzles

export const PuzzleRow = z.object({
  puzzle_id: z.string(),
  rating: z.string().transform((s) => parseInt(s)),
  rating_deviation: z.string().transform((s) => parseInt(s)),
  opening_tags: z.string(),
  fen: z.string(),
  moves: z.string(),
  popularity: z.string().transform((s) => parseInt(s)),
  number_of_plays: z
    .union([z.string(), z.number()])
    .transform((s) => (typeof s === 'string' ? parseInt(s) : s)),
  themes: z.string(),
  game_url: z.string(),
});

export type PuzzleRow = z.infer<typeof PuzzleRow>;

export const PuzzleInteractionRow = z.object({
  id: z.string(),
  puzzle_id: z.string(),
  user_id: z.string(),
  interaction: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('correct'),
    }),
    z.object({
      type: z.literal('incorrect'),
    }),
  ]),
});

export type PuzzleInteractionRow = z.infer<typeof PuzzleInteractionRow>;

const insertMany = async ({
  dbConn,
  rows,
}: {
  dbConn: DatabaseConnectionMySQL;
  rows: PuzzleRow[];
}) => {
  try {
    const queryString = `
    INSERT INTO game_chess_puzzle (
      puzzle_id,
      rating,
      rating_deviation,
      opening_tags,
      fen,
      moves,
      popularity,
      number_of_plays,
      themes,
      game_url
    )
    VALUES
      ${rows.map(
        (row) =>
          `("${row.puzzle_id}", ${row.rating}, ${row.rating_deviation}, "${row.opening_tags}", "${row.fen}", "${row.moves}", ${row.popularity}, ${row.number_of_plays}, "${row.themes}", "${row.game_url}")`
      )}
  `;

    const inserted = await dbConn.query(PuzzleRow, queryString);

    return inserted;
  } catch (e) {
    return Result.Err(String(e));
  }
};

//
//
//
//
//
//

export const PuzzleDatabase = {
  insertMany,
};
