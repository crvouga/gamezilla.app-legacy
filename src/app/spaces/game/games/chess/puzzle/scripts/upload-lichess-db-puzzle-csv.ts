import { promises as fs } from 'fs'
import { Result } from '~/@/result'
import { s } from '~/@/schema'
import type { ISqlDb } from '~/@/sql-db'
import { PuzzleDb, type PuzzleRow } from '../puzzle-db/puzzle-db-impl'

//
//
// csv file found here:
// https://database.lichess.org/#puzzles
//
//
//

const LichessRow = s.obj({
  PuzzleId: s.str(),
  FEN: s.str(),
  Moves: s.str(),
  Rating: s.str(),
  RatingDeviation: s.str(),
  Popularity: s.str(),
  NbPlays: s.str(),
  Themes: s.str(),
  GameUrl: s.str(),
  OpeningTags: s.str(),
})

export type LichessRow = s.Infer<typeof LichessRow>

export const toLichessRow = (x: unknown): LichessRow | null => {
  return Result.unwrapOr(LichessRow.parse(x), null)
}

const log = (...args: unknown[]) => {
  console.log(...args)
}

export const uploadLichessDbPuzzleCsv = async ({
  dbConn,
  lichessDbPuzzleCsvPath,
  batchSize = 10_000,
}: {
  dbConn: ISqlDb
  lichessDbPuzzleCsvPath: string
  batchSize?: number
}) => {
  if (typeof window !== 'undefined') {
    // Code to run in the browser environment
    log('Running in a browser environment')
    return
  }

  log(`reading ${lichessDbPuzzleCsvPath}`)

  try {
    await fs.access(lichessDbPuzzleCsvPath)
  } catch {
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
      rows: batch,
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
      rows: batch,
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
    game_url: GameUrl,
  }
}
