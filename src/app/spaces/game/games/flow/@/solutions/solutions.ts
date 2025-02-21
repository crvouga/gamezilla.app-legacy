import { NonEmpty } from '~/@/array/non-empty'
import { ILogger } from '~/@/logger'
import { p } from '~/@/parser'
import { Flow } from '../flow'
import { SolutionHash } from './solution-hash/solution-hash'
import { Variant } from '../variant'
import { AlgoSolveAsync } from './algo-solve-async'
import { Solution } from './solution'

const parser = p.dict(SolutionHash, p.arr(Solution))

export type Solutions = p.Infer<typeof parser>

const init: Solutions = {}

const findOne = async (input: { model: Variant.Model; logger: ILogger }): Promise<Solutions> => {
  const found = await AlgoSolveAsync.solve(input)
  if (!found) {
    return {}
  }
  const hash = SolutionHash.init(found)
  return {
    [hash]: [Solution.fromFlow(found)],
  }
}

const of = (model: Variant.Model[]): Solutions => {
  const solved = model.filter((m) => Flow.isSolved(m))
  if (NonEmpty.is(solved)) {
    const first = solved[0]
    const hash = SolutionHash.init(first)
    return { [hash]: solved }
  }
  return {}
}

const find = async (input: { models: Variant.Model[]; logger: ILogger }): Promise<Solutions> => {
  const found = await Promise.all(input.models.map((m) => findOne({ model: m, logger: input.logger })))
  const solutions = found.reduce((acc, cur) => merge(acc, cur), init)
  return solutions
}

const merge = (a: Solutions, b: Solutions): Solutions => {
  const result: Solutions = { ...a }

  for (const [key, value] of Object.entries(b)) {
    if (!SolutionHash.is(key)) {
      continue
    }

    if (result[key]) {
      result[key] = [...result[key], ...value]
      continue
    }

    result[key] = value
  }

  return result
}

const limit = (solutions: Solutions, hash: SolutionHash): Solutions => {
  return {
    [hash]: (solutions[hash]?.slice(0, 1) ?? []).map(
      (s): Solution => ({
        pipesBySourceId: s.pipesBySourceId,
        terminalsByGroupId: s.terminalsByGroupId,
      }),
    ),
  }
}

const iter = function* (solutions: Solutions): Iterable<[SolutionHash, Solution[]]> {
  for (const [hash, sols] of Object.entries(solutions)) {
    if (!SolutionHash.is(hash)) {
      continue
    }

    yield [hash, sols]
  }
}

export const Solutions = {
  ...parser,
  find,
  merge,
  limit,
  of,
  iter,
  init,
}
