import { NonEmpty } from '~/@/array/non-empty'
import { ILogger } from '~/@/logger'
import { p } from '~/@/parser'
import { unwrapOr } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'
import { Variant } from '../variant'
import { AlgoIsSolved } from './algo-is-solved/algo-is-solved'
import { AlgoSolveAsync } from './algo-solve-async'
import { Solution } from './solution'
import { SolutionHash } from './solution-hash/solution-hash'

const parser = p.arr(Solution)

export type Solutions = p.Infer<typeof parser>

const init: Solutions = []

const MAX_DURATION = TimeSpan.seconds(10)

const findOne = async (input: { model: Variant.Model; logger: ILogger }): Promise<Solutions> => {
  const found = unwrapOr(await AlgoSolveAsync.solve({ ...input, maxDuration: MAX_DURATION }), null)
  if (!found) {
    return init
  }
  return of([found])
}

const of = (model: Variant.Model[]): Solutions => {
  const solved = model.filter((m) => AlgoIsSolved.isSolved(m))
  if (!NonEmpty.is(solved)) {
    return init
  }
  return solved.map(Solution.fromFlow)
}

const find = async (input: { models: Variant.Model[]; logger: ILogger }): Promise<Solutions> => {
  const found = await Promise.all(input.models.map((m) => findOne({ model: m, logger: input.logger })))
  const solutions: Solutions = found.reduce((acc, cur) => merge(acc, cur), init)
  return solutions
}

const merge = (a: Solutions, b: Solutions): Solutions => {
  const solutionsNew: Solutions = [...a, ...b]
  return solutionsNew
}

const groupByHash = (solutions: Solutions): Map<SolutionHash, Solution[]> => {
  const byHash = new Map<SolutionHash, Solution[]>()
  for (const solution of solutions) {
    const existing = byHash.get(SolutionHash.init(solution)) || []
    byHash.set(SolutionHash.init(solution), [...existing, solution])
  }
  return byHash
}

const selectOne = (solutions: Solutions, hash: SolutionHash): Solution | null => {
  const group = groupByHash(solutions)
  const s = group.get(hash)
  if (!s) return null
  return s[0] ?? null
}

const limit = (solutions: Solutions, hash: SolutionHash): Solutions => {
  const found = solutions.filter((s) => SolutionHash.init(s) === hash).slice(0, 1)
  return found
}

const isEmpty = (solutions: Solutions): boolean => {
  return solutions.length === 0
}

export const Solutions = {
  ...parser,
  limit,
  find,
  merge,
  of,
  groupByHash,
  init,
  selectOne,
  isEmpty,
}
