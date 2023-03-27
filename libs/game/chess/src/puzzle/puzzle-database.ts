import { p, Result, Task } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import { DatabaseConnection } from '@gamezilla/shared/backend';
import { z } from 'zod';
import {
  isPromotionPieceSymbol,
  isSquare,
  MoveInput,
  PromotionPieceSymbol,
} from '../chess/chess-board';
import { Puzzle, PuzzleInteraction, PuzzleQuery } from './puzzle.types';

// source https://database.lichess.org/#puzzles

export const PuzzleRow = z.object({
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

const puzzleTableName = 'game_chess_puzzle';

const puzzleInteractionTableName = 'game_chess_puzzle_interaction';

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
      PuzzleRow,
      `
        INSERT INTO ${puzzleTableName} (
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

const rowToPuzzle = (row: PuzzleRow): Result<string, Puzzle> => {
  const puzzleMoves = uciMovesToPuzzleMoves(row.moves);
  if (puzzleMoves.type === 'Err') {
    return puzzleMoves;
  }

  const [opponentMoves, correctMoves] = deinterleave(puzzleMoves.value);

  if (!isNonEmpty(opponentMoves)) {
    return Result.Err('Opponent moves is empty');
  }

  if (!isNonEmpty(correctMoves)) {
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
    themes: row.themes,
    gameUrl: row.game_url,
    openingTags: row.opening_tags,
  });
};

const isNonEmpty = <T>(arr: T[]): arr is [T, ...T[]] => {
  return arr.length > 0;
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

export const uciMoveToMoveInput = (
  uciMove: string
): Result<string, MoveInput> => {
  const uciMoveRegex = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/;
  const match = uciMove.match(uciMoveRegex);

  if (!match) {
    return Result.Err(
      `uci move did not match regex. uciMove: ${uciMove} regex: ${uciMoveRegex}`
    );
  }

  const [, from, to, promotion] = match;

  if (!(from && to)) {
    return Result.Err('failed to extract from and to from uci move');
  }

  const upperCaseFrom = from.toUpperCase();
  const upperCaseTo = to.toUpperCase();

  if (!(isSquare(upperCaseFrom) && isSquare(upperCaseTo))) {
    return Result.Err('from or to is not a valid square');
  }

  const promotionPiece: PromotionPieceSymbol = isPromotionPieceSymbol(promotion)
    ? promotion
    : 'q';

  return Result.Ok({
    from: upperCaseFrom,
    to: upperCaseTo,
    promotion: promotionPiece,
  });
};

export const findMany =
  ({
    dbConn,
    userId,
    query,
  }: {
    dbConn: DatabaseConnection;
    userId: UserId;
    query: PuzzleQuery;
  }): Task<Result<string, Puzzle[]>> =>
  async () => {
    const { rating, index } = query;

    const limit = 1;

    const offset = index * limit;

    const found = await dbConn.query(
      PuzzleRow,
      `
      SELECT
        p.*
      FROM
        ${puzzleTableName} p
      LEFT JOIN
        ${puzzleInteractionTableName} pi
      ON
        p.puzzle_id = pi.puzzle_id
        AND pi.user_id = '${userId}'
      WHERE
        rating BETWEEN ${rating - 100} AND ${rating + 100}
        AND pi.puzzle_id IS NULL
      ORDER BY
        rating DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `
    );

    if (found.type === 'Err') {
      return found;
    }

    const rows = found.value;

    const result = Result.combine(rows.map(rowToPuzzle));

    return result;
  };

const findAllThemes =
  (dbConn: DatabaseConnection): Task<Result<string, string[]>> =>
  async () => {
    const found = await dbConn.query(
      z.string(),
      `SELECT DISTINCT unnest(themes) FROM ${puzzleTableName};`
    );

    return found;
  };

const insertManyInteractions =
  (
    dbConn: DatabaseConnection,
    interactions: PuzzleInteraction[]
  ): Task<Result<string, null>> =>
  async () => {
    const result = await dbConn.query(
      PuzzleInteractionRow,
      `
        INSERT INTO ${puzzleInteractionTableName} (
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

//
//
//
//
//
//

export const PuzzleDatabase = {
  insertMany,
  findMany,
  insertManyInteractions,
  findAllThemes,
};

//
//
//
// Helpers
//
//
//

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
