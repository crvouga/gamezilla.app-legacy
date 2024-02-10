import {
    Paginated,
    Pagination,
    UserId,
} from "gamezilla/@CHILD/app/@SHARED/data"
import { Result } from "gamezilla/@SHARED/core"
import { FlowPack } from "../flow-pack/flow-pack"
import { FlowPuzzleId } from "../flow-puzzle/flow-puzzle-id"

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
    get: (id: FlowPuzzleId) => Promise<Result<string, FlowPack | null>>
    put: (input: FlowPack) => Promise<Result<string, FlowPack>>
    zap: (id: FlowPuzzleId) => Promise<Result<string, null>>
}
