import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'

type Output<TModel, TMsg> = {
  model: TModel
  eff?: Eff<TMsg>
  msgOut?: unknown[]
}

/**
 * Chains multiple update functions together, merging their outputs.
 * Each update function receives the model from the previous update.
 * Effects and messages are batched together.
 *
 * @example
 * ```ts
 * const update = (input) => {
 *   return AppFrontendModule.andThen(
 *     { model: input.model }, // initial output
 *     (model) => updateFromMsg({ ...input, model }), // first update
 *     (model) => watchForLogin({ ...input, model }), // second update
 *   )
 * }
 * ```
 */
export const andThen = <TModel, TMsg>(
  input: { model: TModel },
  ...updates: ((model: TModel) => Output<TModel, TMsg>)[]
): Output<TModel, TMsg> => {
  let acc: Output<TModel, TMsg> = { model: input.model }
  for (const update of updates) {
    const updated = update(acc.model)
    acc = {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgOut: Msg.batch(acc.msgOut, updated.msgOut),
    }
  }
  return acc
}
