import { Result, Task } from '@gamezilla/core';
import { DatabaseConnection } from '@gamezilla/shared/backend';
import { z } from 'zod';
import {
  isPromotionPieceSymbol,
  isSquare,
  MoveInput,
  PromotionPieceSymbol,
} from '../chess/chess-board';
import { Puzzle, PuzzleQuery } from './puzzle.types';

// source https://database.lichess.org/#puzzles

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

    const queried = await dbConn.query(puzzleRowSchema, queryStr);

    if (queried.type === 'Err') {
      return queried;
    }

    const rows = queried.value;

    const result = Result.combine(rows.map(rowToPuzzle));

    return result;
  };

const rowToPuzzle = (row: PuzzleRow): Result<string, Puzzle> => {
  const puzzleMoves = uciMovesToPuzzleMoves(row.moves);
  if (puzzleMoves.type === 'Err') {
    return puzzleMoves;
  }
  return Result.Ok({
    puzzleId: row.puzzle_id,
    fen: row.fen,
    moves: puzzleMoves.value,
    rating: row.rating,
    ratingDeviation: row.rating_deviation,
    popularity: row.popularity,
    numberOfPlays: row.number_of_plays,
    themes: row.themes,
    gameUrl: row.game_url,
    openingTags: row.opening_tags,
  });
};

export const uciMovesToPuzzleMoves = (
  moves: string[]
): Result<string, Puzzle['moves']> => {
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

const buildQuery = (query: PuzzleQuery) => {
  const { ratingRange, popularity, pageSize, pageIndex } = query;

  const offset = pageIndex * pageSize;

  const ratingOrderBy = ratingRange.direction === 'ascend' ? 'ASC' : 'DESC';

  const popularityOrderBy = popularity.direction === 'ascend' ? 'ASC' : 'DESC';

  return `
    SELECT
      *
    FROM
      ${tableName}
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
