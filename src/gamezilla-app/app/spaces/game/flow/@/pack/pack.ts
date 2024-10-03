import { UserId } from 'gamezilla-app/app/@/data'
import { Posix } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { FlowPuzzleId } from '../puzzle/puzzle-id'
import { FlowPackId } from './pack-id'
import { FlowPackName } from './pack-name'

const parser = p.obj({
  id: p.custom(FlowPackId.is, 'Invalid flow pack id'),
  createdBy: p.custom(UserId.is, 'Invalid user id'),
  createdAt: p.custom(Posix.is, 'Invalid posix'),
  lastUpdatedBy: p.custom(UserId.is, 'Invalid user id'),
  lastUpdatedAt: p.custom(Posix.is, 'Invalid posix'),
  name: p.custom(FlowPackName.is, 'Invalid flow pack name'),
  puzzleIds: p.arr(p.custom(FlowPuzzleId.is, 'Invalid flow puzzle id'))
})

export type FlowPack = p.Infer<typeof parser>

const create = async (input: {
  count?: number
  createdBy: UserId
  puzzleIds: FlowPuzzleId[]
  now: Posix
}): Promise<FlowPack> => {
  return {
    id: FlowPackId.generate(),
    createdBy: input.createdBy,
    createdAt: input.now,
    lastUpdatedBy: input.createdBy,
    lastUpdatedAt: input.now,
    name: await FlowPackName.generate({
      count: input.count ?? 0
    }),
    puzzleIds: input.puzzleIds
  }
}

const includes = (pack: FlowPack, puzzleId: FlowPuzzleId): boolean => {
  return pack.puzzleIds.includes(puzzleId)
}

const add = (pack: FlowPack, puzzleId: FlowPuzzleId): FlowPack => {
  return {
    ...pack,
    puzzleIds: [...pack.puzzleIds, puzzleId]
  }
}

const remove = (pack: FlowPack, index: number): FlowPack => {
  return {
    ...pack,
    puzzleIds: pack.puzzleIds.filter((_, i) => i !== index)
  }
}

const removePuzzleAtIndex = (pack: FlowPack, index: number): FlowPack => {
  return {
    ...pack,
    puzzleIds: [...pack.puzzleIds.slice(0, index), ...pack.puzzleIds.slice(index + 1)]
  }
}

const canGoPrevious = (_pack: FlowPack, puzzleIndex: number): boolean => {
  return puzzleIndex > 0
}

const canGoNext = (pack: FlowPack, puzzleIndex: number): boolean => {
  return puzzleIndex < pack.puzzleIds.length - 1
}

const random = async (input?: { createdBy?: UserId; puzzleIds?: FlowPuzzleId[] }): Promise<FlowPack> => {
  const createdBy = input?.createdBy ?? UserId.generate()
  return {
    createdAt: Posix.now(),
    createdBy: createdBy,
    id: FlowPackId.generate(),
    lastUpdatedAt: Posix.now(),
    lastUpdatedBy: createdBy,
    name: await FlowPackName.generate({
      count: 0
    }),
    puzzleIds: input?.puzzleIds ?? []
  }
}

export const FlowPack = {
  ...parser,
  create,
  add,
  includes,
  canGoPrevious,
  canGoNext,
  remove,
  removePuzzleAtIndex,
  random
}
