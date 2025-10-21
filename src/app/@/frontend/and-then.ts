import { Eff } from '~/@/eff'

type Output<TModel, TMsg> = {
  model: TModel
  eff?: Eff<TMsg>
}

/**
 * Chains update functions together, merging outputs.
 * Each update receives previous model and effects are batched.
 */
export const andThen = <TModel, TMsg>(
  { model }: { model: TModel },
  ...updates: ((model: TModel) => Output<TModel, TMsg>)[]
): Output<TModel, TMsg> => {
  let currentModel = model
  let currentEff: Eff<TMsg> | undefined

  for (let i = 0; i < updates.length; i++) {
    const { model: updatedModel, eff } = updates[i]!(currentModel)
    currentModel = updatedModel
    currentEff = currentEff ? Eff.batch(currentEff, eff) : eff
  }

  return { model: currentModel, eff: currentEff }
}
