import { unwrap } from '~/@/result'
import { p } from '~/@/schema'
import { Posix } from '~/@/time/posix'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleId } from '../puzzle/puzzle-id'
import { PackId } from './pack-id'
import { PackName } from './pack-name'

const parser = p.obj({
  id: PackId,
  createdBy: UserId,
  createdAt: Posix,
  lastUpdatedBy: UserId,
  lastUpdatedAt: Posix,
  name: PackName,
  puzzleIds: p.arr(PuzzleId),
  isOfficial: p.maybe(p.bool),
})

export type Pack = p.Infer<typeof parser>

const create = async (input: {
  count?: number
  createdBy: UserId
  puzzleIds: PuzzleId[]
  now: Posix
}): Promise<Pack> => {
  return {
    id: PackId.generate(),
    createdBy: input.createdBy,
    createdAt: input.now,
    lastUpdatedBy: input.createdBy,
    lastUpdatedAt: input.now,
    name: await PackName.generate(),
    puzzleIds: input.puzzleIds,
    isOfficial: false,
  }
}

const includes = (pack: Pack, puzzleId: PuzzleId): boolean => {
  return pack.puzzleIds.includes(puzzleId)
}

const add = (pack: Pack, puzzleId: PuzzleId[]): Pack => {
  return {
    ...pack,
    puzzleIds: [...pack.puzzleIds, ...puzzleId],
  }
}

const remove = (pack: Pack, index: number): Pack => {
  return {
    ...pack,
    puzzleIds: pack.puzzleIds.filter((_, i) => i !== index),
  }
}

const removePuzzleAtIndex = (pack: Pack, index: number): Pack => {
  return {
    ...pack,
    puzzleIds: [...pack.puzzleIds.slice(0, index), ...pack.puzzleIds.slice(index + 1)],
  }
}

const canGoPrevious = (_pack: Pack, puzzleIndex: number): boolean => {
  return puzzleIndex > 0
}

const canGoNext = (pack: Pack, puzzleIndex: number): boolean => {
  return puzzleIndex < pack.puzzleIds.length - 1
}

const randomSync = (input?: { createdBy?: UserId; puzzleIds?: PuzzleId[] }): Pack => {
  const createdBy = input?.createdBy ?? UserId.generate()
  return {
    createdAt: Posix.now(),
    createdBy: createdBy,
    id: PackId.generate(),
    lastUpdatedAt: Posix.now(),
    lastUpdatedBy: createdBy,
    name: unwrap(PackName.parse(`Pack 0`)),
    puzzleIds: input?.puzzleIds ?? [],
    isOfficial: false,
  }
}

const random = async (input?: { createdBy?: UserId; puzzleIds?: PuzzleId[] }): Promise<Pack> => {
  const createdBy = input?.createdBy ?? UserId.generate()
  return {
    createdAt: Posix.now(),
    createdBy: createdBy,
    id: PackId.generate(),
    lastUpdatedAt: Posix.now(),
    lastUpdatedBy: createdBy,
    name: await PackName.generate(),
    puzzleIds: input?.puzzleIds ?? Array.from({ length: 3 }, () => PuzzleId.generate()),
    isOfficial: false,
  }
}

export const Pack = {
  ...parser,
  randomSync,
  create,
  add,
  includes,
  canGoPrevious,
  canGoNext,
  remove,
  removePuzzleAtIndex,
  random,
}
