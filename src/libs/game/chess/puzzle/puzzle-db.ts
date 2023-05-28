import { UserId } from "@gamezilla/shared/app";
import {
  Err,
  NonEmpty,
  Ok,
  Result,
  Task,
  Uuid,
  p,
} from "@gamezilla/shared/core";
import { DatabaseConnectionMySQL } from "@gamezilla/shared/server";
import { z } from "zod";
import { MoveInput, uciMoveToMoveInput } from "../chess/chess";
import { EloRating } from "./elo-rating";
import {
  Puzzle,
  PuzzleInteraction,
  PuzzleProfile,
  PuzzleQuery,
  initQuery,
  maxRating,
  minRating,
} from "./puzzle.shared";
import { deinterleave } from "./utils";

// source https://database.lichess.org/#puzzles

//
//
//
// Model
//
//
//

const Int = z
  .union([z.string(), z.number()])
  .transform((s) => (typeof s === "string" ? parseInt(s) : s));

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

export const PuzzleInteractionRow = z.object({
  id: z.string(),
  puzzle_id: z.string(),
  user_id: z.string(),
  interaction: z.enum(["solved", "incorrect"]),
});

export const PuzzleQueryJSON = z.object({
  ratingRange: z.tuple([
    z.number().min(minRating).max(maxRating),
    z.number().min(minRating).max(maxRating),
  ]),
});

export const PuzzleProfileRow = z.object({
  id: z.string(),
  user_id: z.string(),
  elo_rating: Int,
  query: PuzzleQueryJSON,
});

//
//
//
//
//
//

const rowToPuzzle = (
  row: z.infer<typeof PuzzleRow>
): Result<string, Puzzle> => {
  const puzzleMoves = uciMovesToPuzzleMoves(row.moves.split(" "));
  if (puzzleMoves.t === "err") {
    return puzzleMoves;
  }

  const [opponentMoves, correctMoves] = deinterleave(puzzleMoves.value);

  if (!NonEmpty.is(opponentMoves)) {
    return Err("Opponent moves is empty");
  }

  if (!NonEmpty.is(correctMoves)) {
    return Err("Correct moves is empty");
  }

  if (!EloRating.is(row.rating)) {
    return Err("Invalid rating. Did not pass as elo rating");
  }

  return Ok({
    opponentMoves,
    correctMoves,
    puzzleId: row.puzzle_id,
    fen: row.fen,
    rating: row.rating,
    ratingDeviation: row.rating_deviation,
    popularity: row.popularity,
    numberOfPlays: row.number_of_plays,
    themes: row.themes.split(" "),
    gameUrl: row.game_url,
    openingTags: row.opening_tags.split(" "),
  });
};

export const uciMovesToPuzzleMoves = (
  moves: string[]
): Result<string, [MoveInput, MoveInput, ...MoveInput[]]> => {
  const [move1, move2, ...rest] = moves;
  if (!(move1 && move2)) {
    return Err("Missing first two moves");
  }
  const moveInput1 = uciMoveToMoveInput(move1);
  const moveInput2 = uciMoveToMoveInput(move2);

  if (moveInput1.t === "err") {
    return moveInput1;
  }

  if (moveInput2.t === "err") {
    return moveInput2;
  }

  const moveInputRest = Result.combine(rest.map(uciMoveToMoveInput));

  if (moveInputRest.t === "err") {
    return moveInputRest;
  }

  return Ok([moveInput1.value, moveInput2.value, ...moveInputRest.value]);
};

const findWhereNoInteractions =
  (dbConn: DatabaseConnectionMySQL, query: PuzzleQuery & { userId: UserId }) =>
  async (): Promise<Result<string, Puzzle[]>> => {
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

    if (found.t === "err") {
      return found;
    }

    const rows = found.value;

    const result = Result.combine(rows.map(rowToPuzzle));

    return result;
  };

const replaceMany = async ({
  dbConn,
  rows,
}: {
  dbConn: DatabaseConnectionMySQL;
  rows: z.infer<typeof PuzzleRow>[];
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
          .join(", ")}
      `
    );
    return p(
      result,
      Result.map(() => null)
    );
  };

const findProfile =
  (dbConn: DatabaseConnectionMySQL, userId: UserId) =>
  async (): Promise<Result<string, PuzzleProfile | null>> => {
    const found = await dbConn.query(
      PuzzleProfileRow,
      `
      SELECT
        *
      FROM
        game_chess_puzzle_profile
      WHERE
        user_id = "${userId}"
    `
    );

    if (found.t === "err") {
      return found;
    }

    const rows = found.value;

    if (rows.length === 0) {
      return Ok(null);
    }

    const row = rows[0];

    if (!UserId.is(row.user_id)) {
      return Err("Invalid user id");
    }

    if (!EloRating.is(row.elo_rating)) {
      return Err("Invalid elo rating");
    }

    const parsed = PuzzleQueryJSON.safeParse(row.query);

    const query = parsed.success ? parsed.data : initQuery;

    const profile: PuzzleProfile = {
      userId: row.user_id,
      eloRating: row.elo_rating,
      query,
    };

    return Ok(profile);
  };

export const insertProfile =
  (
    dbConn: DatabaseConnectionMySQL,
    profile: PuzzleProfile
  ): Task<Result<string, null>> =>
  async () => {
    const puzzleProfileId = Uuid.generateSync();

    const mutated = await dbConn.query(
      PuzzleProfileRow,
      `
        INSERT INTO game_chess_puzzle_profile (
          id,
          user_id,
          elo_rating,
          query
        ) VALUES (
          ?,
          ?,
          ?,
          ?
        )
      `,
      [
        puzzleProfileId,
        profile.userId,
        profile.eloRating,
        JSON.stringify(profile.query),
      ]
    );

    if (mutated.t === "err") {
      return mutated;
    }
    return Ok(null);
  };

export const findElseInsertProfile =
  (
    dbConn: DatabaseConnectionMySQL,
    profile: PuzzleProfile
  ): Task<Result<string, PuzzleProfile>> =>
  async () => {
    const found = await findProfile(dbConn, profile.userId)();

    if (found.t === "err") {
      return found;
    }

    if (found.value !== null) {
      return Ok(found.value);
    }

    const inserted = await insertProfile(dbConn, profile)();

    if (inserted.t === "err") {
      return inserted;
    }

    return Ok(profile);
  };

export const PuzzleDatabase = {
  insertManyInteractions,
  //
  replaceMany,
  findWhereNoInteractions,
  //
  findProfile,
  insertProfile,
  findElseInsertProfile,
};
