import {
  Paginated,
  Pagination,
  UserId,
} from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Task } from "gamezilla-app/@SHARED/core"
import { FlowPuzzle } from "../flow-puzzle"
import { FlowPuzzleId } from "../flow-puzzle-id"

type WhereClause = {
  createdBy?: {
    equals: UserId
  }
  puzzleId?: {
    in: FlowPuzzleId[]
  }
}
export type IFlowPuzzleDb = {
  count: (input: { where: WhereClause }) => Task<string, number>
  list: (input: {
    pagination: Pagination
    where: WhereClause
    order: {
      createdAt?: "asc" | "desc"
      lastUpdatedAt?: "asc" | "desc"
    }
  }) => Task<string, Paginated<FlowPuzzle>>
  get: (id: FlowPuzzleId) => Task<string, FlowPuzzle | null>
  upsert: (input: FlowPuzzle) => Task<string, null>
  zap: (input: {
    id: FlowPuzzleId
    deletedByUserId: UserId
  }) => Task<string, null>
}

export type ListPuzzlesInput = Parameters<IFlowPuzzleDb["list"]>[0]

export type ListPuzzlesOutput = Awaited<ReturnType<IFlowPuzzleDb["list"]>>
