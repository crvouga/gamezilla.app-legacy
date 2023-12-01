import { Eff } from "../eff";

/**
 *
 */
type Output<Model, Msg, Evt, Cmd> = {
  model: Model;
  eff?: Eff<Msg>;
  evt?: Evt[];
  cmd?: Cmd[];
};

/**
 * @description
 * A helper function used for composing update functions together.
 * @example
 * const updated = p(
 *  andThen((model) => ({ model, eff: () => {} })),
 *  andThen((model) => ({ model, cmd: [] })),
 *  andThen((model) => ({ model, evt: [] })),
 * )
 */
export const andThen =
  <Model, Msg, Evt, Cmd>(
    updateStep: (input: Model) => Output<Model, Msg, Evt, Cmd>
  ) =>
  (output: Output<Model, Msg, Evt, Cmd>) => {
    const updated = updateStep(output.model);

    return {
      model: updated.model,
      eff: Eff.batch([output.eff, updated.eff]),
      evt: [...(output.evt ?? []), ...(updated.evt ?? [])],
      cmd: [...(output.cmd ?? []), ...(updated.cmd ?? [])],
    };
  };

/**
 * @description
 * A helper function used for chaining together update functions together.
 * @example
 * const updated = chain(
 * { model: 0 },
 * (model) => ({ model: model + 1, evt: [someEvent] }),
 * (model) => ({ model: model + 1, eff: someEff }),
 * (model) => ({ model: model + 1, cmd: [someCmd] }),
 * )
 * //=> { model: 3, evt: [someEvt], eff: someEff, cmd: [someCmd] }
 *
 * @param initial - the model to start with
 * @param updaters - a list of update functions to apply to the model
 * @returns Accumulated output from all the update functions
 */
export const chain = <Model, Msg, Evt, Cmd>(
  initial: Output<Model, Msg, Evt, Cmd>,
  ...updaters: ((input: Model) => Output<Model, Msg, Evt, Cmd>)[]
): Output<Model, Msg, Evt, Cmd> => {
  const cmd: Cmd[] = [...(initial.cmd ?? [])];
  const evt: Evt[] = [...(initial.evt ?? [])];
  const eff: Eff<Msg>[] = initial.eff ? [initial.eff] : [];
  let model = { ...initial.model };
  let i = 0;
  let len = updaters.length;

  for (i = 0; i < len; ++i) {
    const updated = updaters[i]!(model);

    model = updated.model;

    if (updated.eff) {
      eff.push(updated.eff);
    }
    if (updated.evt) {
      let j = 0;
      let len = updated.evt.length;
      for (j = 0; j < len; ++j) {
        evt.push(updated.evt[j]!);
      }
    }
    if (updated.cmd) {
      let j = 0;
      let len = updated.cmd.length;
      for (j = 0; j < len; ++j) {
        cmd.push(updated.cmd[j]!);
      }
    }
  }

  return {
    model,
    eff: Eff.batch(eff),
    evt,
    cmd,
  };
};

type NullishItems<T> = T | null | undefined | Array<NullishItems<T>>;

/**
 * @description
 * A helper function used for composing update functions together.
 */
export function batchMsgs<T>(...msgs: Array<NullishItems<T>>): Array<T> {
  const flattened: Array<T> = [];

  const stack = [...msgs];

  while (stack.length > 0) {
    const item = stack.pop();

    if (Array.isArray(item)) {
      stack.push(...item);
    } else if (item !== null && item !== undefined) {
      flattened.push(item);
    }
  }

  return flattened.reverse();
}

/**
 * @description
 * A helper function used for composing update functions together.
 * @example
 * const updated = chain(
 * { model: 0 },
 * (model) => ({ model: model + 1, evt: [someEvent] }),
 * (model) => ({ model: model + 1, eff: someEff }),
 * (model) => ({ model: model + 1, cmd: [someCmd] }),
 * )
 * //=> { model: 3, evt: [someEvt], eff: someEff, cmd: [someCmd] }
 *
 * @param initial - the model to start with
 * @param updaters - a list of update functions to apply to the model
 * @returns Accumulated output from all the update functions
 */
export const chainAwait = async <Model, Msg, Evt, Cmd>(
  initial: Output<Model, Msg, Evt, Cmd>,
  ...updaters: ((
    input: Model
  ) => Output<Model, Msg, Evt, Cmd> | Promise<Output<Model, Msg, Evt, Cmd>>)[]
): Promise<Output<Model, Msg, Evt, Cmd>> => {
  const cmd: Cmd[] = initial.cmd ?? [];
  const evt: Evt[] = initial.evt ?? [];
  const eff: Eff<Msg>[] = initial.eff ? [initial.eff] : [];
  let model: Model = initial.model;

  for (let i = 0, len = updaters.length; i < len; ++i) {
    const updated = await updaters[i]!(model);
    model = updated.model;

    if (updated.eff) {
      eff.push(updated.eff);
    }

    if (updated.evt) {
      for (let j = 0, len = updated.evt.length; j < len; ++j) {
        evt.push(updated.evt[j]!);
      }
    }

    if (updated.cmd) {
      for (let j = 0, len = updated.cmd.length; j < len; ++j) {
        cmd.push(updated.cmd[j]!);
      }
    }
  }

  return {
    model,
    eff: Eff.batch(eff),
    evt,
    cmd,
  };
};
