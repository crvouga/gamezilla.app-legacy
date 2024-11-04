import { Posix } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import { UserId } from 'gamezilla-app/app/@/data'
import { Flow } from '../flow/flow'
import { FlowAlgoSolve } from '../flow/flow-algo/flow-algo-solve'
import { FlowAlgoSolveAsync } from '../flow/flow-algo/flow-algo-solve-async'
import { FlowGridShorthand } from '../flow/flow-variant/flow-grid/flow-grid-shorthand'
import * as FlowVariant from '../flow/flow-variant/flow-variant'
import { FlowPuzzleId } from './puzzle-id'
import { FlowPuzzleName } from './puzzle-name'

const parser = p.obj({
  id: FlowPuzzleId,
  name: FlowPuzzleName,
  createdAt: Posix,
  createdBy: UserId,
  lastUpdatedAt: Posix,
  lastUpdatedBy: UserId,
  flow: FlowVariant.Model,
  solutions: p.arr(Flow.Model)
})

export type FlowPuzzle = p.Infer<typeof parser>

const create = async (input: {
  count: number
  flow: FlowVariant.Model
  createdAt: Posix
  createdBy: UserId
}): Promise<FlowPuzzle> => {
  const solution = await FlowAlgoSolveAsync.solve(input.flow)
  return {
    flow: input.flow,
    name: await FlowPuzzleName.generate({
      count: input.count
    }),
    id: FlowPuzzleId.generate(),
    createdAt: input.createdAt,
    createdBy: input.createdBy,
    lastUpdatedAt: input.createdAt,
    lastUpdatedBy: input.createdBy,
    solutions: solution ? [solution] : []
  }
}

const random = async (input?: {
  flow?: FlowVariant.Model
  createdBy?: UserId
  createdAt?: Posix
}): Promise<FlowPuzzle> => {
  const createdBy = input?.createdBy ?? UserId.generate()
  const createdAt = input?.createdAt ?? Posix.now()
  const flow =
    input?.flow ??
    FlowGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A']
    ])
  const solutions = FlowAlgoSolve.solutions(flow)
  const solution = next(solutions)
  return {
    createdAt,
    createdBy,
    name: await FlowPuzzleName.generate({
      count: 0
    }),
    lastUpdatedAt: Posix.now(),
    lastUpdatedBy: createdBy,
    id: FlowPuzzleId.generate(),
    solutions: solution ? [solution] : [],
    flow
  }
}

const next = <T>(iter: Iterable<T>): T | undefined => {
  for (const item of iter) {
    return item
  }
  return undefined
}

export const FlowPuzzle = {
  ...parser,
  create,
  random
}
