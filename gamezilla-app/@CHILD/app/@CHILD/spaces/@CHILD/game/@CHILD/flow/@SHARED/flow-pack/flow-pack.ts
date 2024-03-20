import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Posix } from "gamezilla-app/@SHARED/core"
import { FlowPuzzleId } from "../flow-puzzle/flow-puzzle-id"
import { FlowPackId } from "./flow-pack-id"
import { FlowPackName } from "./flow-pack-name"
import { p } from "gamezilla-app/@SHARED/parsing"

export type FlowPack = {
  id: FlowPackId
  createdBy: UserId
  createdAt: Posix
  lastUpdatedBy: UserId
  lastUpdatedAt: Posix
  name: FlowPackName
  puzzleIds: FlowPuzzleId[]
}

const is: (x: unknown) => x is FlowPack = p.obj({
  id: FlowPackId.is,
  createdBy: UserId.is,
  createdAt: Posix.is,
  lastUpdatedBy: UserId.is,
  lastUpdatedAt: Posix.is,
  name: FlowPackName.is,
  puzzleIds: p.arr(FlowPuzzleId.is),
})

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

const removePuzzleAtIndex = (pack: FlowPack, index: number): FlowPack => {
  return {
    ...pack,
    puzzleIds: [
      ...pack.puzzleIds.slice(0, index),
      ...pack.puzzleIds.slice(index + 1),
    ],
  }
}

const canGoPrevious = (_pack: FlowPack, puzzleIndex: number): boolean => {
  return puzzleIndex > 0
}

const canGoNext = (pack: FlowPack, puzzleIndex: number): boolean => {
  return puzzleIndex < pack.puzzleIds.length - 1
}

export const FlowPack = {
  create,
  add,
  includes,
  canGoPrevious,
  canGoNext,
  removePuzzleAtIndex,
  is,
}
