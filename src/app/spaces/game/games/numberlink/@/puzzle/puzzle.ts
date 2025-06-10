import { s } from '~/@/schema'
import { UnixMs } from '~/@/time/unix-ms'
import { UserId } from '~/app/@/data/user-id'
import { Numberlink } from '../numberlink'
import { NumberlinkVariant } from '../variant'
import { VariantGridShorthand } from '../variant/grid/grid-shorthand'
import { PuzzleId } from './puzzle-id'
import { PuzzleName } from './puzzle-name'

const schema = s.obj({
  id: PuzzleId,
  name: PuzzleName,
  createdAt: UnixMs,
  createdBy: UserId,
  lastUpdatedAt: UnixMs,
  lastUpdatedBy: UserId,
  model: NumberlinkVariant.Model,
  solutions: s.arr(Numberlink.Model),
})

export type Puzzle = s.Infer<typeof schema>

const create = async (input: {
  count?: number
  numberlink: NumberlinkVariant.Model
  createdAt: UnixMs
  createdBy: UserId
}): Promise<Puzzle> => {
  return {
    model: input.numberlink,
    name: await PuzzleName.generate({
      // count: input.count,
    }),
    id: PuzzleId.generate(),
    createdAt: input.createdAt,
    createdBy: input.createdBy,
    lastUpdatedAt: input.createdAt,
    lastUpdatedBy: input.createdBy,
    solutions: [],
  }
}

const random = async (input?: {
  numberlink?: NumberlinkVariant.Model
  createdBy?: UserId
  createdAt?: UnixMs
}): Promise<Puzzle> => {
  const createdBy = input?.createdBy ?? UserId.generate()
  const createdAt = input?.createdAt ?? UnixMs.now()
  const numberlink =
    input?.numberlink ??
    VariantGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])

  return {
    createdAt,
    createdBy,
    name: await PuzzleName.generate({
      count: 0,
    }),
    lastUpdatedAt: UnixMs.now(),
    lastUpdatedBy: createdBy,
    id: PuzzleId.generate(),
    model: numberlink,
    solutions: [],
  }
}

export const Puzzle = {
  ...schema,
  create,
  random,
}
