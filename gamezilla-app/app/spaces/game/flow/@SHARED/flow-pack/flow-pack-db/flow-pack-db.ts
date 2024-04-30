import { Result } from "gamezilla-app/@shared/core"
import { Paginated, Pagination, UserId } from "gamezilla-app/app/@shared/data"
import { FlowPuzzleId } from "../../flow-puzzle/flow-puzzle-id"
import { FlowPack } from "../flow-pack"
import { FlowPackId } from "../flow-pack-id"

export type IFlowPackDb = {
  count: (input: {
    where: {
      createdBy?: UserId
    }
  }) => Promise<Result<string, number>>
  list: (input: {
    pagination: Pagination
    where: {
      createdBy?: UserId
    }
    order: {
      createdAt?: "asc" | "desc"
      lastUpdatedAt?: "asc" | "desc"
    }
  }) => Promise<Result<string, Paginated<FlowPack>>>
  get: (id: FlowPackId) => Promise<Result<string, FlowPack | null>>
  put: (pack: FlowPack) => Promise<Result<string, FlowPack>>
  zap: (input: {
    id: FlowPuzzleId
    deletedBy: UserId
  }) => Promise<Result<string, null>>
}
