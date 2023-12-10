import { Eff, batchMsgs } from "gamezilla/@SHARED/core";

type Output<TModel, TMsg, TOutMsg> = {
  model: TModel;
  eff?: Eff<TMsg>;
  msg?: TOutMsg[];
};

/**
 * @description
 * A helper function used for chaining together update functions together.
 * @example
 * const updated = composeUpdates(
 * { model: 0 },
 * (model) => ({ model: model + 1, evt: [someEvent] }),
 * (model) => ({ model: model + 1, eff: someEff }),
 * (model) => ({ model: model + 1, cmd: [someCmd] }),
 * )
 * //=> { model: 3, evt: [someEvt], eff: someEff, cmd: [someCmd] }
 *
 * @param acc - the model to start with
 * @param updates - a list of update functions to apply to the model
 * @returns Accumulated output from all the update functions
 */
export const chainUpdates = <TModel, TMsg, TOutMsg>(
  acc: Output<TModel, TMsg, TOutMsg>,
  updates: ((input: TModel) => Output<TModel, TMsg, TOutMsg>)[]
): Output<TModel, TMsg, TOutMsg> => {
  const [update, ...rest] = updates;

  if (!update) {
    return acc;
  }

  const updated = update(acc.model);

  const accNew: Output<TModel, TMsg, TOutMsg> = {
    ...acc,
    model: updated.model,
    eff: Eff.batch([acc.eff, updated.eff]),
    msg: batchMsgs([updated.msg, updated.msg]),
  };

  return chainUpdates(accNew, rest);
};
