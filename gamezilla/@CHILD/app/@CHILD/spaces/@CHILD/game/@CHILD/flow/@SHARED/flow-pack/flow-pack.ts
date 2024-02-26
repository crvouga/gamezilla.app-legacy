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

const includes = (pack: FlowPack, puzzleId: FlowPuzzleId): boolean => {
  return pack.puzzleIds.includes(puzzleId)
}

const add = (pack: FlowPack, puzzleId: FlowPuzzleId): FlowPack => {
  return {
    ...pack,
    puzzleIds: [...pack.puzzleIds, puzzleId],
  }
}

const canGoPrevious = (_pack: FlowPack, puzzleIndex: number): boolean => {
  return puzzleIndex >= 0
}

const canGoNext = (pack: FlowPack, puzzleIndex: number): boolean => {
  return puzzleIndex <= pack.puzzleIds.length - 1
}

export const FlowPack = {
  create,
  add,
  includes,
  canGoPrevious,
  canGoNext,
}
