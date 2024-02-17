import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { Posix } from "gamezilla/@SHARED/core"
import { FlowPuzzleId } from "../flow-puzzle/flow-puzzle-id"
import { FlowPackId } from "./flow-pack-id"
import { FlowPackName } from "./flow-pack-name"

export type FlowPack = {
  id: FlowPackId
  createdBy: UserId
  createdAt: Posix
  lastUpdatedBy: UserId
  lastUpdatedAt: Posix
  name: FlowPackName
  puzzleIds: FlowPuzzleId[]
}

const create = (input: {
  count?: number
  createdBy: UserId
  puzzleIds: FlowPuzzleId[]
  now: Posix
}): FlowPack => {
  return {
    id: FlowPackId.generate(),
    createdBy: input.createdBy,
    createdAt: input.now,
    lastUpdatedBy: input.createdBy,
    lastUpdatedAt: input.now,
    name: FlowPackName.generate({
      count: input.count ?? 0,
    }),
    puzzleIds: input.puzzleIds,
  }
}

export const FlowPack = {
  create,
}
