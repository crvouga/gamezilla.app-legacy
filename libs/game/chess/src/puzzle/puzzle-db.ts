import { NonEmpty, p, Result, Task } from '@gamezilla/shared/core';
import { UserId } from '@gamezilla/shared/app';
import { DatabaseConnectionMySQL } from '@gamezilla/shared/server';
import { z } from 'zod';
import { MoveInput, uciMoveToMoveInput } from '../chess/chess';
import { Puzzle, PuzzleInteraction, PuzzleQuery } from './puzzle.shared';

// source https://database.lichess.org/#puzzles

const Int = z
  .union([z.string(), z.number()])
  .transform((s) => (typeof s === 'string' ? parseInt(s) : s));

export const PuzzleRow = z.object({
  puzzle_id: z.string(),
  rating: Int,
  rating_deviation: Int,
  opening_tags: z.string(),
  fen: z.string(),
  moves: z.string(),
  popularity: Int,
  number_of_plays: Int,
  themes: z.string(),
  game_url: z.string(),
});

export type PuzzleRow = z.infer<typeof PuzzleRow>;

export const PuzzleInteractionRow = z.object({
  id: z.string(),
  puzzle_id: z.string(),
  user_id: z.string(),
  interaction: z.enum(['solved', 'incorrect']),
});

export type PuzzleInteractionRow = z.infer<typeof PuzzleInteractionRow>;

export const PuzzleProfileRow = z.object({
  id: z.string(),
  user_id: z.string(),
  queryJSON: z.string(),
});

const rowToPuzzle = (row: PuzzleRow): Result<string, Puzzle> => {
  const puzzleMoves = uciMovesToPuzzleMoves(row.moves.split(' '));
  if (puzzleMoves.type === 'Err') {
    return puzzleMoves;
  }

  const [opponentMoves, correctMoves] = deinterleave(puzzleMoves.value);

  if (!NonEmpty.is(opponentMoves)) {
    return Result.Err('Opponent moves is empty');
  }

  if (!NonEmpty.is(correctMoves)) {
    return Result.Err('Correct moves is empty');
  }

  return Result.Ok({
    opponentMoves,
    correctMoves,
    puzzleId: row.puzzle_id,
    fen: row.fen,
    rating: row.rating,
    ratingDeviation: row.rating_deviation,
    popularity: row.popularity,
    numberOfPlays: row.number_of_plays,
    themes: row.themes.split(' '),
    gameUrl: row.game_url,
    openingTags: row.opening_tags.split(' '),
  });
};

export const uciMovesToPuzzleMoves = (
  moves: string[]
): Result<string, [MoveInput, MoveInput, ...MoveInput[]]> => {
  const [move1, move2, ...rest] = moves;
  if (!(move1 && move2)) {
    return Result.Err('Missing first two moves');
  }
  const moveInput1 = uciMoveToMoveInput(move1);
  const moveInput2 = uciMoveToMoveInput(move2);

  if (moveInput1.type === 'Err') {
    return moveInput1;
  }

  if (moveInput2.type === 'Err') {
    return moveInput2;
  }

  const moveInputRest = Result.combine(rest.map(uciMoveToMoveInput));

  if (moveInputRest.type === 'Err') {
    return moveInputRest;
  }

  return Result.Ok([
    moveInput1.value,
    moveInput2.value,
    ...moveInputRest.value,
  ]);
};

const fetchNeverSeen =
  (
    dbConn: DatabaseConnectionMySQL,
    query: PuzzleQuery & { userId: UserId }
  ): Task<Result<string, Puzzle[]>> =>
  async () => {
    const { userId, ratingRange } = query;

    const found = await dbConn.query(
      PuzzleRow,
      `
      SELECT
        p.*
      FROM
        game_chess_puzzle p
      LEFT JOIN
        game_chess_puzzle_interaction pi
      ON
        p.puzzle_id = pi.puzzle_id
        AND pi.user_id = "${userId}"
      WHERE
        rating BETWEEN ${ratingRange[0]} AND ${ratingRange[1]}
        AND pi.puzzle_id IS NULL
      ORDER BY
        popularity DESC
      LIMIT 10
    `
    );

    if (found.type === 'Err') {
      return found;
    }

    const rows = found.value;

    const result = Result.combine(rows.map(rowToPuzzle));

    return result;
  };

const deinterleave = <T>(xs: T[]): [T[], T[]] => {
  const ys: T[] = [];
  const zs: T[] = [];
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    if (!x) {
      continue;
    }
    if (i % 2 === 0) {
      ys.push(x);
    } else {
      zs.push(x);
    }
  }
  return [ys, zs];
};

const replaceMany = async ({
  dbConn,
  rows,
}: {
  dbConn: DatabaseConnectionMySQL;
  rows: PuzzleRow[];
}) => {
  const queryString = `
    REPLACE INTO game_chess_puzzle (
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
};

const insertManyInteractions =
  (
    dbConn: DatabaseConnectionMySQL,
    interactions: PuzzleInteraction[]
  ): Task<Result<string, null>> =>
  async () => {
    const result = await dbConn.query(
      PuzzleInteractionRow,
      `
        INSERT INTO game_chess_puzzle_interaction (
          puzzle_id,
          user_id,
          type
        ) VALUES ${interactions
          .map(
            (interaction) =>
              `('${interaction.puzzleId}', '${interaction.userId}', '${interaction.type}')`
          )
          .join(', ')}
      `
    );
    return p(
      result,
      Result.map(() => null)
    );
  };

export const PuzzleDatabase = {
  insertManyInteractions,
  replaceMany,
  fetchNeverSeen,
};
