import type { Task } from '~/@/promise/task'
import { Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { UserId } from '~/app/@/data/user-id'
import type { Puzzle } from '../puzzle'
import type { PuzzleId } from '../puzzle-id'
import { PuzzleQuery } from './query'

export type ListPuzzlesOutput = Awaited<ReturnType<IPuzzleDb['query']>>

export type IPuzzleDb = {
  count: (input: Omit<PuzzleQuery, 'pagination' | 'order'>) => Task<string, number>
  query: (input: PuzzleQuery) => Task<string, { puzzles: Paginated<Puzzle> }>
  get: (id: PuzzleId) => Task<string, Puzzle | null>
  put: (input: Puzzle) => Task<string, null>
  zap: (input: { puzzleId: PuzzleId; deletedByUserId: UserId }) => Task<string, null>
  sub: (input: PuzzleQuery) => Sub<Puzzle[]>
}
