import { p } from '~/@/parser'
import { AlgoSolveAsync } from '../algo/algo-solve-async'
import { Flow } from '../flow'
import { FlowHash } from '../flow/hash'
import { Variant } from '../variant'

const parser = p.dict(FlowHash, p.arr(Flow.Model))

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

export const Solutions = {
  ...parser,
  find,
  merge,
  init,
}
