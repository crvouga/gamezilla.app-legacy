import { Result } from '@gamezilla/core';
import { DatabaseConnection } from '@gamezilla/shared/backend';
import { z } from 'zod';

export const puzzleRowSchema = z.object({
  puzzle_id: z.string(),
  rating: z.number(),
  rating_deviation: z.number(),
  opening_tags: z.array(z.string()),
  fen: z.string(),
  moves: z.array(z.string()),
  popularity: z.number(),
  number_of_plays: z.number(),
  themes: z.array(z.string()),
  game_url: z.string(),
});

export type PuzzleRow = z.infer<typeof puzzleRowSchema>;

const tableName = 'game_chess_puzzle';

const insert = async ({
  dbConn,
  row,
}: {
  dbConn: DatabaseConnection;
  row: PuzzleRow;
}) => {
  const {
    puzzle_id,
    rating,
    rating_deviation,
    opening_tags,
    fen,
    moves,
    popularity,
    number_of_plays,
    themes,
    game_url,
  } = row;

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
    ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
    )
    `,
    [
      puzzle_id,
      rating,
      rating_deviation,
      opening_tags,
      fen,
      moves,
      popularity,
      number_of_plays,
      themes,
      game_url,
    ]
  );

  return inserted;
};

export const insertMany_ = async ({
  dbConn,
  rows,
}: {
  dbConn: DatabaseConnection;
  rows: PuzzleRow[];
}) => {
  const client = await dbConn.pool.connect();
  client.on('error', (err) => {
    console.error('insertMany error', err);
  });
  try {
    client.query('BEGIN');
    for (const row of rows) {
      await client.query(
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        [
          row.puzzle_id,
          row.rating,
          row.rating_deviation,
          row.opening_tags,
          row.fen,
          row.moves,
          row.popularity,
          row.number_of_plays,
          row.themes,
          row.game_url,
        ]
      );
    }
    client.query('COMMIT');
    return Result.Ok(null);
  } catch (e) {
    client.query('ROLLBACK');
    return Result.Err(String(e));
  } finally {
    client.release();
  }
};

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

export const PuzzleDatabase = {
  insert,
  insertMany,
};
