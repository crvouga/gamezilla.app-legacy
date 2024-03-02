import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server"
import { NonEmpty, Result, Uuid, err, ok } from "gamezilla/@SHARED/core"
import { Parsing as P } from "gamezilla/@SHARED/parsing"
import { MoveInput, uciMoveToMoveInput } from "../../../@SHARED/chess"
import { EloRating } from "../elo-rating"
import {
  Puzzle,
  PuzzleInteraction,
  PuzzleProfile,
  initQuery,
} from "../puzzle.core"
import { splitEvery } from "../utils"

//
//
//
// Model
//
//
//

export type Int = string | number

export type PuzzleRow = {
  puzzle_id: string
  rating: Int
  rating_deviation: Int
  opening_tags: string
  fen: string
  moves: string
  popularity: Int
  number_of_plays: Int
  themes: string
  game_url: string
}

export type PuzzleInteractionRow = {
  id: string
  puzzle_id: string
  user_id: string
  type: "started" | "solved" | "incorrect" | "solved-with-hint"
}

export type PuzzleProfileRow = {
  id: string
  user_id: string
  elo_rating: Int
  puzzle_query: PuzzleQueryJSON
}

//
//
//
// Parsing
//
//
//

const types = ["started", "solved", "incorrect", "solved-with-hint"] as const

const toInt = (x: unknown): Int | null => {
  if (P.str(x) || P.num(x)) {
    return x
  }
  return null
}

const isInt = P.is(toInt)

export const toPuzzleRow = (x: unknown): PuzzleRow | null => {
  if (
    P.obj(x) &&
    P.has(x, "puzzle_id", P.str) &&
    P.has(x, "rating", isInt) &&
    P.has(x, "rating_deviation", isInt) &&
    P.has(x, "opening_tags", P.str) &&
    P.has(x, "fen", P.str) &&
    P.has(x, "moves", P.str) &&
    P.has(x, "popularity", isInt) &&
    P.has(x, "number_of_plays", isInt) &&
    P.has(x, "themes", P.str) &&
    P.has(x, "game_url", P.str)
  ) {
    return {
      fen: x.fen,
      game_url: x.game_url,
      moves: x.moves,
      number_of_plays: x.number_of_plays,
      opening_tags: x.opening_tags,
      popularity: x.popularity,
      puzzle_id: x.puzzle_id,
      rating: x.rating,
      rating_deviation: x.rating_deviation,
      themes: x.themes,
    }
  }
  return null
}

export const toPuzzleInteractionRow = (
  x: unknown,
): PuzzleInteractionRow | null => {
  if (
    P.obj(x) &&
    P.has(x, "id", P.str) &&
    P.has(x, "puzzle_id", P.str) &&
    P.has(x, "user_id", P.str) &&
    P.has(x, "type", P.union(types))
  ) {
    return x
  }
  return null
}

export type RatingRange = [number, number]

const toRatingRange = P.to<RatingRange>(P.tuple(P.num, P.num))

export type PuzzleQueryJSON = {
  ratingRange: RatingRange
}

const toPuzzleQueryJSON = (x: unknown): PuzzleQueryJSON | null => {
  if (P.obj(x) && P.has(x, "ratingRange", P.is(toRatingRange))) {
    return x
  }
  return null
}

export const toPuzzleProfileRow = (x: unknown): PuzzleProfileRow | null => {
  if (
    P.obj(x) &&
    P.has(x, "id", P.str) &&
    P.has(x, "user_id", P.str) &&
    P.has(x, "elo_rating", isInt) &&
    P.has(x, "puzzle_query", P.is(toPuzzleQueryJSON))
  ) {
    return x
  }
  return null
}

//
//
//
//
//
//

const rowToPuzzle = (row: PuzzleRow): Result<string, Puzzle> => {
  const parsedMoves = uciMovesToPuzzleMoves(row.moves.split(" "))

  if (parsedMoves.t === "err") {
    return parsedMoves
  }

  const moves = splitEvery(2, parsedMoves.value).flatMap(
    ([opponentMove, correctMove]) => {
      if (!opponentMove) {
        return []
      }
      if (!correctMove) {
        return []
      }
      return [
        {
          opponentMove,
          correctMove,
        },
      ]
    },
  )

  if (!NonEmpty.is(moves)) {
    return err("Failed to parse moves from puzzle database record")
  }

  if (!EloRating.is(row.rating)) {
    return err("Failed to parse elo rating from puzzle database record")
  }

  const puzzle: Puzzle = {
    puzzleId: row.puzzle_id,
    fen: row.fen,
    moves,
    rating: row.rating,
    ratingDeviation:
      typeof row.rating_deviation === "string"
        ? parseFloat(row.rating_deviation)
        : row.rating_deviation,
    popularity:
      typeof row.popularity === "string"
        ? parseInt(row.popularity)
        : row.popularity,
    numberOfPlays:
      typeof row.number_of_plays === "string"
        ? parseInt(row.number_of_plays)
        : row.number_of_plays,
    themes: row.themes.split(" "),
    gameUrl: row.game_url,
    openingTags: row.opening_tags.split(" "),
  }

  return ok(puzzle)
}

export const uciMovesToPuzzleMoves = (
  moves: string[],
): Result<string, [MoveInput, MoveInput, ...MoveInput[]]> => {
  const [move1, move2, ...rest] = moves
  if (!(move1 && move2)) {
    return err("Missing first two moves")
  }
  const moveInput1 = uciMoveToMoveInput(move1)
  const moveInput2 = uciMoveToMoveInput(move2)

  if (moveInput1.t === "err") {
    return moveInput1
  }

  if (moveInput2.t === "err") {
    return moveInput2
  }

  const moveInputRest = Result.combine(rest.map(uciMoveToMoveInput))

  if (moveInputRest.t === "err") {
    return moveInputRest
  }

  return ok([moveInput1.value, moveInput2.value, ...moveInputRest.value])
}

const puzzlesFindForProfile = async (
  dbConn: DbConnSql,
  input: { profile: PuzzleProfile; omit?: string[] },
): Promise<Result<string, Puzzle[]>> => {
  const delta = 100
  const minRating = input.profile.eloRating - delta
  const maxRating = input.profile.eloRating + delta
  const userId = input.profile.userId
  const omit = input.omit?.map((x) => `"${x}"`).join(", ") ?? null

  const sql = `
    SELECT
      p.*
    FROM
      game_chess_puzzle p
    WHERE
      NOT EXISTS (
        SELECT 1
        FROM game_chess_puzzle_interaction pi
        WHERE p.puzzle_id = pi.puzzle_id AND pi.user_id = '${userId}'
      )
      AND p.rating BETWEEN ${minRating} AND ${maxRating}
      ${omit ? `AND p.puzzle_id NOT IN (${omit})` : ""}
    ORDER BY
      p.popularity DESC
    LIMIT 1
  `

  const found = await dbConn.query(P.is(toPuzzleRow), sql, {})

  if (found.t === "err") {
    return found
  }

  const rows = found.value

  const result = Result.combine(rows.map(rowToPuzzle))

  return result
}

const puzzlesReplace = async ({
  dbConn,
  rows,
}: {
  dbConn: DbConnSql
  rows: PuzzleRow[]
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
          `("${row.puzzle_id}", ${row.rating}, ${row.rating_deviation}, "${row.opening_tags}", "${row.fen}", "${row.moves}", ${row.popularity}, ${row.number_of_plays}, "${row.themes}", "${row.game_url}")`,
      )}
  `

  const inserted = await dbConn.query(P.is(toPuzzleRow), queryString, {})

  return inserted
}

const interactionsInsert = async (
  dbConn: DbConnSql,
  interactions: PuzzleInteraction[],
): Promise<Result<string, null>> => {
  const result = await dbConn.query(
    P.is(toPuzzleInteractionRow),
    `
        INSERT INTO game_chess_puzzle_interaction (
          puzzle_id,
          user_id,
          type
        ) VALUES ${interactions
          .map((x) => `('${x.puzzleId}', '${x.userId}', '${x.type}')`)
          .join(", ")}
      `,
    {},
  )
  return Result.mapOk(result, () => null)
}

const profilesFind = async (
  dbConn: DbConnSql,
  userId: UserId,
): Promise<Result<string, PuzzleProfile | null>> => {
  const found = await dbConn.query(
    P.is(toPuzzleProfileRow),
    `
      SELECT
        *
      FROM
        game_chess_puzzle_profile
      WHERE
        user_id = :user_id
    `,
    {
      user_id: userId,
    },
  )

  if (found.t === "err") {
    return found
  }

  const rows = found.value

  const row = rows[0]

  if (!row) {
    return ok(null)
  }

  if (!UserId.is(row.user_id)) {
    return err("Invalid user id")
  }

  if (!EloRating.is(row.elo_rating)) {
    return err("Invalid elo rating")
  }

  const puzzleQuery = toPuzzleQueryJSON(row.puzzle_query) ?? initQuery

  const profile: PuzzleProfile = {
    userId: row.user_id,
    eloRating: row.elo_rating,
    puzzleQuery: puzzleQuery,
  }

  return ok(profile)
}

export const profilesInsert = async (
  dbConn: DbConnSql,
  profile: PuzzleProfile,
): Promise<Result<string, null>> => {
  const puzzleProfileId = Uuid.generate()

  const mutated = await dbConn.query(
    P.is(toPuzzleProfileRow),
    `
        INSERT INTO game_chess_puzzle_profile (
          id,
          user_id,
          elo_rating,
          puzzle_query
        ) VALUES (
          :puzzle_profile_id,
          :user_id,
          :elo_rating,
          :puzzle_query
        )
      `,
    {
      puzzle_profile_id: puzzleProfileId,
      user_id: profile.userId,
      elo_rating: profile.eloRating,
      puzzle_query: JSON.stringify(profile.puzzleQuery),
    },
  )

  if (mutated.t === "err") {
    return mutated
  }
  return ok(null)
}

export const profilesFindElseInsert = async (
  dbConn: DbConnSql,
  profile: PuzzleProfile,
): Promise<Result<string, PuzzleProfile>> => {
  const found = await profilesFind(dbConn, profile.userId)

  if (found.t === "err") {
    return found
  }

  if (found.value !== null) {
    return ok(found.value)
  }

  const inserted = await profilesInsert(dbConn, profile)

  if (inserted.t === "err") {
    return inserted
  }

  return ok(profile)
}

const profilesUpdate = async (
  dbConn: DbConnSql,
  profile: PuzzleProfile,
): Promise<Result<string, null>> => {
  const mutated = await dbConn.query(
    P.is(toPuzzleProfileRow),
    `
      UPDATE game_chess_puzzle_profile
      SET
        user_id = :user_id,
        elo_rating = :elo_rating,
        puzzle_query = :puzzle_query
      WHERE
        user_id = :user_id
    `,
    {
      user_id: profile.userId,
      elo_rating: profile.eloRating,
      puzzle_query: JSON.stringify(profile.puzzleQuery),
    },
  )

  if (mutated.t === "err") {
    return mutated
  }
  return ok(null)
}

export const PuzzleDb = {
  interactions: {
    insert: interactionsInsert,
  },
  puzzles: {
    replace: puzzlesReplace,
    findForProfile: puzzlesFindForProfile,
  },
  profiles: {
    find: profilesFind,
    insert: profilesInsert,
    findElseInsert: profilesFindElseInsert,
    update: profilesUpdate,
  },
}
