import { Eff } from "../eff";

/**
 *
 */
type Output<Model, Msg, Event, Cmd> = {
  model: Model;
  eff?: Eff<Msg>;
  msgEvent?: Event[];
  msgCmd?: Cmd[];
};

/**
 * @description
 * A helper function used for composing update functions together.
 * @example
 * const updated = p(
 *  andThen((model) => ({ model, eff: () => {} })),
 *  andThen((model) => ({ model, msgCmd: [] })),
 *  andThen((model) => ({ model, msgEvent: [] })),
 * )
 */
export const andThen =
  <Model, Msg, Event, Cmd>(
    updateStep: (input: Model) => Output<Model, Msg, Event, Cmd>
  ) =>
  (output: Output<Model, Msg, Event, Cmd>) => {
    const updated = updateStep(output.model);

    return {
      model: updated.model,
      eff: Eff.batch([output.eff, updated.eff]),
      msgEvent: [...(output.msgEvent ?? []), ...(updated.msgEvent ?? [])],
      msgCmd: [...(output.msgCmd ?? []), ...(updated.msgCmd ?? [])],
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
 * (model) => ({ model: model + 1, msgEvent: [someEvent] }),
 * (model) => ({ model: model + 1, eff: someEff }),
 * (model) => ({ model: model + 1, msgCmd: [someCmd] }),
 * )
 * //=> { model: 3, msgEvent: [someEvent], eff: someEff, msgCmd: [someCmd] }
 *
 * @param initial - the model to start with
 * @param updaters - a list of update functions to apply to the model
 * @returns Accumulated output from all the update functions
 */
export const chainAwait = async <Model, Msg, Event, Cmd>(
  initial: Output<Model, Msg, Event, Cmd>,
  ...updaters: ((
    input: Model
  ) =>
    | Output<Model, Msg, Event, Cmd>
    | Promise<Output<Model, Msg, Event, Cmd>>)[]
): Promise<Output<Model, Msg, Event, Cmd>> => {
  const msgCmd: Cmd[] = [...(initial.msgCmd ?? [])];
  const msgEvent: Event[] = [...(initial.msgEvent ?? [])];
  const eff: Eff<Msg>[] = initial.eff ? [initial.eff] : [];
  let model: Model = { ...initial.model };

  for (let i = 0, len = updaters.length; i < len; ++i) {
    const updated = await updaters[i]!(model);
    model = updated.model;

    if (updated.eff) {
      eff.push(updated.eff);
    }

    if (updated.msgEvent) {
      for (let j = 0, len = updated.msgEvent.length; j < len; ++j) {
        msgEvent.push(updated.msgEvent[j]!);
      }
    }

    if (updated.msgCmd) {
      for (let j = 0, len = updated.msgCmd.length; j < len; ++j) {
        msgCmd.push(updated.msgCmd[j]!);
      }
    }
  }

  return {
    model,
    eff: Eff.batch(eff),
    msgEvent,
    msgCmd,
  };
};
