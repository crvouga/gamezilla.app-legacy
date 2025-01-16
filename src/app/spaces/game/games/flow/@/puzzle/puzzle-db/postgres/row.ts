import { p } from '~/@/parser'
import { Result } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { UserId } from '~/app/@/data/user-id'
import { Flow } from '../../../flow'
import { Variant } from '../../../variant'
import type { Puzzle } from '../../puzzle'
import { PuzzleId } from '../../puzzle-id'
import { PuzzleName } from '../../puzzle-name'

const parser = p.obj({
  id: p.str,
  flow_puzzle_name: p.str,
  flow: p.or(p.str, p.json),
  flow_solutions: p.or(p.str, p.json),
  created_at_posix: p.or(p.num, p.str),
  created_by_user_id: p.str,
  last_updated_at_posix: p.or(p.num, p.str),
  last_updated_by_user_id: p.str,
})

export type PostgresRow = p.Infer<typeof parser>

const ensureNumber = (x: string | number): number => {
  return typeof x === 'string' ? Number.parseFloat(x) : x
}

const rowToPuzzle = (row: PostgresRow): Puzzle | null => {
  const flowPuzzleId = PuzzleId.is(row.id) ? row.id : null
  const puzzleName = PuzzleName.is(row.flow_puzzle_name) ? row.flow_puzzle_name : null

  const rowFlow = typeof row.flow === 'string' ? JSON.parse(row.flow) : row.flow
  const parsedFlow = Variant.Model.parse(rowFlow)
  const flow = Result.unwrapOr(parsedFlow, null)

  const createdAt = Posix.init(ensureNumber(row.created_at_posix))
  const createdBy = UserId.is(row.created_by_user_id) ? row.created_by_user_id : null
  const lastUpdatedAt = Posix.init(ensureNumber(row.last_updated_at_posix))
  const lastUpdatedBy = UserId.is(row.last_updated_by_user_id) ? row.last_updated_by_user_id : null

  const parsedFlowSolutions = p.arr(p.or(Variant.Model, Flow.Model)).parse(row.flow_solutions)
  const solutions = Result.unwrapOr(parsedFlowSolutions, [])

  if (flowPuzzleId && puzzleName && flow && createdAt && createdBy && lastUpdatedAt && lastUpdatedBy) {
    return {
      id: flowPuzzleId,
      name: puzzleName,
      flow: flow,
      createdAt,
      createdBy,
      lastUpdatedAt,
      lastUpdatedBy,
      solutions,
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

export const PostgresRow = {
  ...parser,
  rowToPuzzle,
}
