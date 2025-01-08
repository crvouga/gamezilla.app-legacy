import { p } from '~/@/parser'
import { AlgoSolveAsync } from '../algo/algo-solve-async'
import { FlowHash } from '../flow/hash'
import { Variant } from '../variant'
import { Solution } from './solution'

const parser = p.dict(FlowHash, p.arr(Solution))

export type Solutions = p.Infer<typeof parser>

const init: Solutions = {}

const findOne = async (model: Variant.Model): Promise<Solutions> => {
  const found = await AlgoSolveAsync.solve(model)
  if (!found) {
    return {}
  }
  const hash = FlowHash.init(found)
  return {
    [hash]: [found],
  }
}

const find = async (models: Variant.Model[]): Promise<Solutions> => {
  const found = await Promise.all(models.map((m) => findOne(m)))
  const solutions = found.reduce((acc, cur) => merge(acc, cur), init)
  return solutions
}

const merge = (a: Solutions, b: Solutions): Solutions => {
  const result: Solutions = { ...a }

  for (const [key, value] of Object.entries(b)) {
    if (!FlowHash.is(key)) {
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

const limit = (solutions: Solutions, hash: FlowHash): Solutions => {
  return {
    [hash]: (solutions[hash]?.slice(0, 1) ?? []).map(
      (s): Solution => ({
        pipesBySourceId: s.pipesBySourceId,
        terminalsByGroupId: s.terminalsByGroupId,
      }),
    ),
  }
}

export const Solutions = {
  ...parser,
  find,
  merge,
  limit,
  init,
}
