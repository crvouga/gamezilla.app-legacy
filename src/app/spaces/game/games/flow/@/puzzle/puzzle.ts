import { p } from '~/@/parser'
import { Posix } from '~/@/time/posix'
import { UserId } from '~/app/@/data/user-id'
import { Flow } from '../flow/flow'
import { FlowAlgoSolve } from '../flow/flow-algo/flow-algo-solve'
import { FlowAlgoSolveAsync } from '../flow/flow-algo/flow-algo-solve-async'
import { FlowGridShorthand } from '../flow/flow-variant/flow-grid/flow-grid-shorthand'
import * as FlowVariant from '../flow/flow-variant/variant'
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
  const solution = await FlowAlgoSolveAsync.solve(input.flow)
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
    solutions: solution ? [solution] : [],
  }
}

const random = async (input?: { flow?: FlowVariant.Model; createdBy?: UserId; createdAt?: Posix }): Promise<Puzzle> => {
  const createdBy = input?.createdBy ?? UserId.generate()
  const createdAt = input?.createdAt ?? Posix.now()
  const flow =
    input?.flow ??
    FlowGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])
  const solutions = FlowAlgoSolve.solutions(flow)
  const solution = next(solutions)
  return {
    createdAt,
    createdBy,
    name: await PuzzleName.generate({
      count: 0,
    }),
    lastUpdatedAt: Posix.now(),
    lastUpdatedBy: createdBy,
    id: PuzzleId.generate(),
    solutions: solution ? [solution] : [],
    flow,
  }
}

const next = <T>(iter: Iterable<T>): T | undefined => {
  for (const item of iter) {
    return item
  }
  return undefined
}

export const Puzzle = {
  ...parser,
  create,
  random,
}
