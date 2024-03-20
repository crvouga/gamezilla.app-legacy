import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Posix } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/parser"
import { FlowPuzzleId } from "../flow-puzzle/flow-puzzle-id"
import { FlowPackId } from "./flow-pack-id"
import { FlowPackName } from "./flow-pack-name"

const parser = p.obj({
  id: p.custom(FlowPackId.is, "Invalid flow pack id"),
  createdBy: p.custom(UserId.is, "Invalid user id"),
  createdAt: p.custom(Posix.is, "Invalid posix"),
  lastUpdatedBy: p.custom(UserId.is, "Invalid user id"),
  lastUpdatedAt: p.custom(Posix.is, "Invalid posix"),
  name: p.custom(FlowPackName.is, "Invalid flow pack name"),
  puzzleIds: p.arr(p.custom(FlowPuzzleId.is, "Invalid flow puzzle id")),
})

export type FlowPack = p.Infer<typeof parser>

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
  parser,
}
