import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Posix } from "gamezilla-app/@SHARED/core"
import { FlowVariant } from "../flow"
import { FlowPuzzleId } from "./flow-puzzle-id"
import { FlowPuzzleName } from "./flow-puzzle-name"
import { P } from "gamezilla-app/@SHARED/parsing"

export type FlowPuzzle = {
  id: FlowPuzzleId
  name: FlowPuzzleName
  createdAt: Posix
  createdBy: UserId
  lastUpdatedAt: Posix
  lastUpdatedBy: UserId
  flow: FlowVariant.Model
}

const create = (input: {
  count: number
  flow: FlowVariant.Model
  createdAt: Posix
  createdBy: UserId
}): FlowPuzzle => {
  return {
    flow: input.flow,
    name: FlowPuzzleName.generate({ count: input.count }),
    id: FlowPuzzleId.generate(),
    createdAt: input.createdAt,
    createdBy: input.createdBy,
    lastUpdatedAt: input.createdAt,
    lastUpdatedBy: input.createdBy,
  }
}

const is = P.obj({
  id: FlowPuzzleId.is,
  name: FlowPuzzleName.is,
  createdAt: Posix.is,
  createdBy: UserId.is,
  lastUpdatedAt: Posix.is,
  lastUpdatedBy: UserId.is,
  flow: FlowVariant.is,
})

export const FlowPuzzle = {
  is,
  create,
}
