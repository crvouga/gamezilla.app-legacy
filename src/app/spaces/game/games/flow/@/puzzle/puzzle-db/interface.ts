import type { Task } from '~/@/promise/task'
import { Pagination } from '~/@/query/query'
import { Sub } from '~/@/sub'
import { Paginated } from '~/app/@/data/pagination'
import { UserId } from '~/app/@/data/user-id'
import { Solutions } from '../../solutions/solutions'
import type { Puzzle } from '../puzzle'
import type { PuzzleId } from '../puzzle-id'

export type WhereClause = {
  createdBy?: {
    equals: UserId
  }
  puzzleId?: {
    in: PuzzleId[]
  }
}

export type OrderClause = {
  createdAt?: 'asc' | 'desc'
  lastUpdatedAt?: 'asc' | 'desc'
}

export type QueryPuzzlesInput = {
  pagination: Pagination
  where: WhereClause
  order: OrderClause
}

export type ListPuzzlesOutput = Awaited<ReturnType<IPuzzleDb['query']>>

export type IPuzzleDb = {
  count: (input: Omit<QueryPuzzlesInput, 'pagination' | 'order'>) => Task<string, number>
  query: (input: QueryPuzzlesInput) => Task<string, { puzzles: Paginated<Puzzle>; solutions: Solutions }>
  get: (id: PuzzleId) => Task<string, Puzzle | null>
  put: (input: Puzzle) => Task<string, null>
  zap: (input: { id: PuzzleId; deletedByUserId: UserId }) => Task<string, null>
  subscribe: (input: { where: WhereClause }) => Sub<Puzzle[]>
}
