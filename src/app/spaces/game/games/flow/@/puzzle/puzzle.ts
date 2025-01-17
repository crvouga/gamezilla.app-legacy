import { p } from '~/@/parser'
import { Posix } from '~/@/time/posix'
import { UserId } from '~/app/@/data/user-id'
import { Flow } from '../flow'
import { VariantGridShorthand } from '../variant/grid/grid-shorthand'
import * as FlowVariant from '../variant/variant'
import { PuzzleId } from './puzzle-id'
import { PuzzleName } from './puzzle-name'

const parser = p.obj({
  id: PuzzleId,
  name: PuzzleName,
  createdAt: Posix,
  createdBy: UserId,
  lastUpdatedAt: Posix,
  lastUpdatedBy: UserId,
  flow: FlowVariant.Model,
  solutions: p.arr(Flow.Model),
})

export type Puzzle = p.Infer<typeof parser>

const create = async (input: {
  count: number
  flow: FlowVariant.Model
  createdAt: Posix
  createdBy: UserId
}): Promise<Puzzle> => {
  return {
    flow: input.flow,
    name: await PuzzleName.generate({
      count: input.count,
    }),
    id: PuzzleId.generate(),
    createdAt: input.createdAt,
    createdBy: input.createdBy,
    lastUpdatedAt: input.createdAt,
    lastUpdatedBy: input.createdBy,
    solutions: [],
  }
}

const random = async (input?: { flow?: FlowVariant.Model; createdBy?: UserId; createdAt?: Posix }): Promise<Puzzle> => {
  const createdBy = input?.createdBy ?? UserId.generate()
  const createdAt = input?.createdAt ?? Posix.now()
  const flow =
    input?.flow ??
    VariantGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])
  // const solutions = AlgoSolve.solutions(flow)
  // const solution = next(solutions)
  return {
    createdAt,
    createdBy,
    name: await PuzzleName.generate({
      count: 0,
    }),
    lastUpdatedAt: Posix.now(),
    lastUpdatedBy: createdBy,
    id: PuzzleId.generate(),
    solutions: [],
    // solutions: solution ? [solution] : [],
    flow,
  }
}

export const Puzzle = {
  ...parser,
  create,
  random,
}
