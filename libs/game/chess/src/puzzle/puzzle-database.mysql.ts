import { Result, Task, p } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import { DatabaseConnectionMySQL } from '@gamezilla/shared/backend';
import { z } from 'zod';
import {
  MoveInput,
  PromotionPieceSymbol,
  isPromotionPieceSymbol,
  isSquare,
} from '../chess/chess-board';
import { Puzzle, PuzzleInteraction, PuzzleQuery } from './puzzle.types';

// source https://database.lichess.org/#puzzles

//
//
//
// Decoders
//
//
//

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
  id: z.number().int(),
  puzzle_id: z.string().min(1).max(255),
  user_id: z.string().min(1).max(255),
  type: z.enum(['solved', 'incorrect']),
});

export type PuzzleInteractionRow = z.infer<typeof PuzzleInteractionRow>;

//
//
//
//
//
//
//

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

const findMany =
  ({
    dbConn,
    userId,
    query,
  }: {
    dbConn: DatabaseConnectionMySQL;
    userId: UserId;
    query: PuzzleQuery;
  }): Task<Result<string, Puzzle[]>> =>
  async () => {
    const { rating, index } = query;

    const limit = 1;

    const offset = index * limit;

    const sql = `
      SELECT
        p.*
      FROM
        game_chess_puzzle p
      WHERE
        rating BETWEEN ${rating - 100} AND ${rating + 100}
      ORDER BY
        rating DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    console.log('FIND', { rating, index, limit, offset, userId, sql });

    const found = await dbConn.query(PuzzleRow, sql);

    console.log('FOUND', found);

    if (found.type === 'Err') {
      return found;
    }

    const rows = found.value;

    const result = Result.combine(rows.map(rowToPuzzle));

    return result;
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

//
//
//
// Translators
//
//
//

const rowToPuzzle = (row: PuzzleRow): Result<string, Puzzle> => {
  const puzzleMoves = uciMovesToPuzzleMoves(row.moves.split(' '));
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
    themes: row.themes.split(' '),
    gameUrl: row.game_url,
    openingTags: row.opening_tags.split(' '),
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

//
//
//
//
//
//

export const PuzzleDatabase = {
  replaceMany,
  findMany,
  insertManyInteractions,
};
