import { Result } from '~/@/core'
import { p } from '~/@/core/parser'
import type { IDbConnSql } from '~/@/db-conn-sql'
import { PuzzleDb, type PuzzleRow } from '../puzzle-db/puzzle-db-impl'

//
//
// csv file found here:
// https://database.lichess.org/#puzzles
//
//
//

const LichessRow = p.obj({
  PuzzleId: p.str,
  FEN: p.str,
  Moves: p.str,
  Rating: p.str,
  RatingDeviation: p.str,
  Popularity: p.str,
  NbPlays: p.str,
  Themes: p.str,
  GameUrl: p.str,
  OpeningTags: p.str
})

export type LichessRow = p.Infer<typeof LichessRow>

export const toLichessRow = (x: unknown): LichessRow | null => {
  return Result.unwrapOr(LichessRow.parse(x), null)
}

const log = (...args: unknown[]) => {
  console.log(...args)
}

export const uploadLichessDbPuzzleCsv = async ({
  dbConn,
  lichessDbPuzzleCsvPath,
  batchSize = 10_000
}: {
  dbConn: IDbConnSql
  lichessDbPuzzleCsvPath: string
  batchSize?: number
}) => {
  if (typeof window !== 'undefined') {
    // Code to run in the browser environment
    log('Running in a browser environment')
    return
  }

  log(`reading ${lichessDbPuzzleCsvPath}`)

  const file = Bun.file(lichessDbPuzzleCsvPath)

  if (await file.exists()) {
    log(`file ${lichessDbPuzzleCsvPath} does not exist`)
    return
  }

  console.error('not implemented')

  let batch: PuzzleRow[] = []

  log('starting upload')
  for await (const lichessRow of []) {
    const parsed = toLichessRow(lichessRow)
    if (!parsed) {
      continue
    }
    const row = lichessRowToRow(parsed)

    batch.push(row)

    if (batch.length < batchSize) {
      continue
    }

    log('insert started')

    const inserted = await PuzzleDb.puzzles.replace({
      dbConn,
      rows: batch
    })

    log(`${inserted.t} - ${batch.length} rows -`)

    batch = []

    if (inserted.t === 'err') {
      log(`insert error ${inserted.error}`)
    }
  }

  if (batch.length > 0) {
    const inserted = await PuzzleDb.puzzles.replace({
      dbConn,
      rows: batch
    })

    if (inserted.t === 'err') {
      log(`insert error ${inserted.error}`)
    } else {
      log('inserted batch')
    }
  }

  log('upload done')
}

const lichessRowToRow = (lichessRow: LichessRow): PuzzleRow => {
  const { PuzzleId, FEN, Moves, Rating, RatingDeviation, Popularity, NbPlays, Themes, GameUrl, OpeningTags } =
    lichessRow

  return {
    puzzle_id: PuzzleId,
    rating: Rating,
    rating_deviation: RatingDeviation,
    opening_tags: OpeningTags,
    fen: FEN,
    moves: Moves,
    popularity: Popularity,
    number_of_plays: NbPlays,
    themes: Themes,
    game_url: GameUrl
  }
}
