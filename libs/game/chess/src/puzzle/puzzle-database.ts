import { p, Result, Task } from '@gamezilla/core';
import { DatabaseConnection } from '@gamezilla/shared/backend';
import { z } from 'zod';
import { Puzzle, PuzzleQuery } from './puzzle.types';

export const puzzleRowSchema = z.object({
  puzzle_id: z.string(),
  rating: z.string().transform((s) => parseInt(s)),
  rating_deviation: z.string().transform((s) => parseInt(s)),
  opening_tags: z.array(z.string()),
  fen: z.string(),
  moves: z.array(z.string()),
  popularity: z.string().transform((s) => parseInt(s)),
  number_of_plays: z
    .union([z.string(), z.number()])
    .transform((s) => (typeof s === 'string' ? parseInt(s) : s)),
  themes: z.array(z.string()),
  game_url: z.string(),
});

export type PuzzleRow = z.infer<typeof puzzleRowSchema>;

const tableName = 'game_chess_puzzle';

const insertMany = async ({
  dbConn,
  rows,
}: {
  dbConn: DatabaseConnection;
  rows: PuzzleRow[];
}) => {
  try {
    const values = rows
      .map(
        (row) =>
          `('${row.puzzle_id}', ${row.rating}, ${
            row.rating_deviation
          }, ARRAY[${row.opening_tags.map((tag) => `'${tag}'`).join(', ')}], '${
            row.fen
          }', ARRAY[${row.moves.map((move) => `'${move}'`).join(', ')}], ${
            row.popularity
          }, ${row.number_of_plays}, ARRAY[${row.themes
            .map((theme) => `'${theme}'`)
            .join(', ')}], '${row.game_url}')`
      )
      .join(', ');

    const inserted = await dbConn.query(
      puzzleRowSchema,
      `
        INSERT INTO ${tableName} (
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
        ) VALUES ${values}
      `
    );

    return inserted;
  } catch (e) {
    return Result.Err(String(e));
  }
};

const runQuery =
  (
    dbConn: DatabaseConnection,
    query: PuzzleQuery
  ): Task<Result<string, Puzzle[]>> =>
  async () => {
    const queryStr = buildQuery(query);
    console.log(queryStr);

    const queried = await dbConn.query(puzzleRowSchema, queryStr);
    return p(
      queried,
      Result.map((rows) => rows.map(rowToPuzzle))
    );
  };

const rowToPuzzle = (row: PuzzleRow): Puzzle => {
  return {
    puzzleId: row.puzzle_id,
    fen: row.fen,
    moves: row.moves,
    rating: row.rating,
    ratingDeviation: row.rating_deviation,
    popularity: row.popularity,
    numberOfPlays: row.number_of_plays,
    themes: row.themes,
    gameUrl: row.game_url,
    openingTags: row.opening_tags,
  };
};

const buildQuery = (query: PuzzleQuery) => {
  const { ratingRange, popularity, pageSize, pageIndex } = query;

  const offset = pageIndex * pageSize;

  const ratingOrderBy = ratingRange.direction === 'ascend' ? 'ASC' : 'DESC';

  const popularityOrderBy = popularity.direction === 'descend' ? 'ASC' : 'DESC';

  return `
    SELECT
      *
    FROM
      game_chess_puzzle
    WHERE
      rating BETWEEN ${ratingRange.value - 100} AND ${ratingRange.value + 100}
    ORDER BY
      popularity ${popularityOrderBy},
      rating ${ratingOrderBy}
    LIMIT ${pageSize}
    OFFSET ${offset}
  `;
};

export const PuzzleDatabase = {
  insertMany,
  runQuery,
};
