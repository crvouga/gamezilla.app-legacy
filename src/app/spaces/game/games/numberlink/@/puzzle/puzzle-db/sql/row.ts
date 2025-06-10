import { s } from '~/@/schema'
import { Result } from '~/@/result'
import { UnixMs } from '~/@/time/unix-ms'
import { UserId } from '~/app/@/data/user-id'
import { NumberlinkVariant } from '../../../variant'
import type { Puzzle } from '../../puzzle'
import { PuzzleId } from '../../puzzle-id'
import { PuzzleName } from '../../puzzle-name'

const schema = s.obj({
  id: s.str(),
  name: s.str(),
  model: s.or(s.str(), s.json),
  created_at_unix_ms: s.or(s.num(), s.str()),
  created_by_user_id: s.str(),
  last_updated_at_unix_ms: s.or(s.num(), s.str()),
  last_updated_by_user_id: s.str(),
})

export type Row = s.Infer<typeof schema>

const ensureNumber = (x: string | number): number => {
  return typeof x === 'string' ? Number.parseFloat(x) : x
}

const rowToPuzzle = (row: Row): Puzzle | null => {
  const puzzleId = PuzzleId.is(row.id) ? row.id : null
  const puzzleName = PuzzleName.is(row.name) ? row.name : null

  const rowNumberlink = typeof row.model === 'string' ? JSON.parse(row.model) : row.model
  const parsedNumberlink = NumberlinkVariant.Model.parse(rowNumberlink)
  const numberlink = Result.unwrapOr(parsedNumberlink, null)

  const createdAt = UnixMs.init(ensureNumber(row.created_at_unix_ms))
  const createdBy = UserId.is(row.created_by_user_id) ? row.created_by_user_id : null
  const lastUpdatedAt = UnixMs.init(ensureNumber(row.last_updated_at_unix_ms))
  const lastUpdatedBy = UserId.is(row.last_updated_by_user_id) ? row.last_updated_by_user_id : null

  if (puzzleId && puzzleName && numberlink && createdAt && createdBy && lastUpdatedAt && lastUpdatedBy) {
    return {
      id: puzzleId,
      name: puzzleName,
      model: numberlink,
      solutions: [],
      createdAt,
      createdBy,
      lastUpdatedAt,
      lastUpdatedBy,
    }
  }
  console.error(
    `[numberlink-puzzle-db] Failed to parse row=${JSON.stringify(row, null, 4)} \nerror=${JSON.stringify(
      parsedNumberlink,
      null,
      4,
    )}`,
  )
  return null
}

export const Row = {
  ...schema,
  rowToPuzzle,
}
