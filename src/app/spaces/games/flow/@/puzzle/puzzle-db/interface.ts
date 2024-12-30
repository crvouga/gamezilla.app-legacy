import type { Paginated, Pagination, UserId } from '~/app/@/data'
import type { Task } from '~/@/promise/task'
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

export type ListPuzzlesInput = {
  pagination: Pagination
  where: WhereClause
  order: OrderClause
}

export type ListPuzzlesOutput = Awaited<ReturnType<IPuzzleDb['list']>>

export type IPuzzleDb = {
  count: (input: Omit<ListPuzzlesInput, 'pagination' | 'order'>) => Task<string, number>
  list: (input: ListPuzzlesInput) => Task<string, Paginated<Puzzle>>
  get: (id: PuzzleId) => Task<string, Puzzle | null>
  put: (input: Puzzle) => Task<string, null>
  zap: (input: { id: PuzzleId; deletedByUserId: UserId }) => Task<string, null>
}
