import {
  Paginated,
  Pagination,
  UserId,
} from "gamezilla/@CHILD/app/@SHARED/data"
import { Result } from "gamezilla/@SHARED/core"
import { FlowPuzzle } from "../flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "../flow-puzzle/flow-puzzle-id"

type WhereClause = {
  createdBy?: {
    equals: UserId
  }
  puzzleId?: {
    in: FlowPuzzleId[]
  }
}
export type IFlowPuzzleDb = {
  count: (input: { where: WhereClause }) => Promise<Result<string, number>>
  list: (input: {
    pagination: Pagination
    where: WhereClause
    order: {
      createdAt?: "asc" | "desc"
      lastUpdatedAt?: "asc" | "desc"
    }
  }) => Promise<Result<string, Paginated<FlowPuzzle>>>
  get: (id: FlowPuzzleId) => Promise<Result<string, FlowPuzzle | null>>
  put: (input: FlowPuzzle) => Promise<Result<string, null>>
  zap: (input: {
    id: FlowPuzzleId
    deletedByUserId: UserId
  }) => Promise<Result<string, null>>
}

export type ListPuzzlesInput = Parameters<IFlowPuzzleDb["list"]>[0]

export type ListPuzzlesOutput = Awaited<ReturnType<IFlowPuzzleDb["list"]>>
