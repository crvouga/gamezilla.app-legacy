import { Paginated, Pagination, UserId } from "gamezilla-app/app/@SHARED/data"
import { Task } from "gamezilla-app/@SHARED/core"
import { FlowPuzzle } from "../flow-puzzle"
import { FlowPuzzleId } from "../flow-puzzle-id"

export type WhereClause = {
  createdBy?: {
    equals: UserId
  }
  puzzleId?: {
    in: FlowPuzzleId[]
  }
}

export type OrderClause = {
  createdAt?: "asc" | "desc"
  lastUpdatedAt?: "asc" | "desc"
}

export type ListPuzzlesInput = {
  pagination: Pagination
  where: WhereClause
  order: OrderClause
}

export type ListPuzzlesOutput = Awaited<ReturnType<IFlowPuzzleDb["list"]>>

export type IFlowPuzzleDb = {
  count: (input: { where: WhereClause }) => Task<string, number>
  list: (input: ListPuzzlesInput) => Task<string, Paginated<FlowPuzzle>>
  get: (id: FlowPuzzleId) => Task<string, FlowPuzzle | null>
  put: (input: FlowPuzzle) => Task<string, null>
  zap: (input: {
    id: FlowPuzzleId
    deletedByUserId: UserId
  }) => Task<string, null>
}
