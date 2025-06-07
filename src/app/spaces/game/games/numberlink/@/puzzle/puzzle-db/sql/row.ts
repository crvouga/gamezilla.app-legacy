import { s } from '~/@/schema'
import { Result } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { UserId } from '~/app/@/data/user-id'
import { Variant } from '../../../variant'
import type { Puzzle } from '../../puzzle'
import { PuzzleId } from '../../puzzle-id'
import { PuzzleName } from '../../puzzle-name'

const schema = s.obj({
  id: s.str(),
  name: s.str(),
  flow: s.or(s.str(), s.json),
  created_at_posix: s.or(s.num(), s.str()),
  created_by_user_id: s.str(),
  last_updated_at_posix: s.or(s.num(), s.str()),
  last_updated_by_user_id: s.str(),
})

export type Row = s.Infer<typeof schema>

const ensureNumber = (x: string | number): number => {
  return typeof x === 'string' ? Number.parseFloat(x) : x
}

const rowToPuzzle = (row: Row): Puzzle | null => {
  const puzzleId = PuzzleId.is(row.id) ? row.id : null
  const puzzleName = PuzzleName.is(row.name) ? row.name : null

  const rowFlow = typeof row.flow === 'string' ? JSON.parse(row.flow) : row.flow
  const parsedFlow = Variant.Model.parse(rowFlow)
  const flow = Result.unwrapOr(parsedFlow, null)

  const createdAt = Posix.init(ensureNumber(row.created_at_posix))
  const createdBy = UserId.is(row.created_by_user_id) ? row.created_by_user_id : null
  const lastUpdatedAt = Posix.init(ensureNumber(row.last_updated_at_posix))
  const lastUpdatedBy = UserId.is(row.last_updated_by_user_id) ? row.last_updated_by_user_id : null

  if (puzzleId && puzzleName && flow && createdAt && createdBy && lastUpdatedAt && lastUpdatedBy) {
    return {
      id: puzzleId,
      name: puzzleName,
      flow: flow,
      solutions: [],
      createdAt,
      createdBy,
      lastUpdatedAt,
      lastUpdatedBy,
    }
  }
  console.error(
    `[flow-puzzle-db] Failed to parse row=${JSON.stringify(row, null, 4)} \nerror=${JSON.stringify(
      parsedFlow,
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
