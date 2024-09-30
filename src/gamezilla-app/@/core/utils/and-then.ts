import { Eff } from '../eff'

export const andThen = <TModel, TOutput extends { model: TModel }>(
  initial: TOutput,
  ...updates: ((model: TModel) => TOutput)[]
): TOutput => {
  let acc: TOutput = initial
  for (const update of updates) {
    const updated = update(acc.model)

    for (const key in updated) {
      const value = updated[key]
      if (!value) {
        continue
      }
      switch (key) {
        case 'model': {
          acc[key] = value
          break
        }
        case 'eff': {
          // @ts-ignore
          acc[key] = Eff.batch(acc['eff'], value)
          break
        }
        default: {
          if (Array.isArray(acc[key]) && Array.isArray(value)) {
            // @ts-ignore
            acc[key] = acc[key].concat(value)
          }
          break
        }
      }
    }
  }

  return acc
}
