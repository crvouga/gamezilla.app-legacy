import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'

type Output<TModel, TMsg> = {
  model: TModel
  eff?: Eff<TMsg>
  msgOut?: unknown[]
  msg?: unknown[]
}

/**
 * Chains multiple update functions together, merging their outputs.
 * Each update function receives the model from the previous update.
 * Effects and messages are batched together.
 *
 * @param input - Object containing the initial model
 * @param updates - Array of update functions that each take a model and return an Output
 * @returns Combined Output containing merged model, effects and messages
 *
 * @example
 * ```ts
 * const update = (input) => {
 *   return andThen(
 *     { model: input.model },
 *     (model) => updateFromMsg({ ...input, model }),
 *     (model) => updateFromMsgIn({ ...input, model })
 *   )
 * }
 * ```
 */
export const andThen = <TModel, TMsg>(
  input: { model: TModel },
  ...updates: ((model: TModel) => Output<TModel, TMsg>)[]
): Output<TModel, TMsg> => {
  const output: Output<TModel, TMsg> = input

  for (const update of updates) {
    const updated = update(output.model)
    output.model = updated.model
    output.eff = Eff.batch(output.eff, updated.eff)
    output.msgOut = Msg.batch(output.msgOut, updated.msgOut)
    output.msg = Msg.batch(output.msg, updated.msg)
  }

  return output
}
