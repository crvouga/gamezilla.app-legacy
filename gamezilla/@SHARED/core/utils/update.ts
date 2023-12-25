import { Eff } from "../eff";

/**
 *
 */
type Output<Model, Msg, Event, Cmd> = {
  model: Model;
  eff?: Eff<Msg>;
  event?: Event[];
  cmd?: Cmd[];
};

/**
 * @description
 * A helper function used for composing update functions together.
 * @example
 * const updated = p(
 *  andThen((model) => ({ model, eff: () => {} })),
 *  andThen((model) => ({ model, cmd: [] })),
 *  andThen((model) => ({ model, event: [] })),
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
      event: [...(output.event ?? []), ...(updated.event ?? [])],
      cmd: [...(output.cmd ?? []), ...(updated.cmd ?? [])],
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
 * (model) => ({ model: model + 1, event: [someEvent] }),
 * (model) => ({ model: model + 1, eff: someEff }),
 * (model) => ({ model: model + 1, cmd: [someCmd] }),
 * )
 * //=> { model: 3, event: [someEvent], eff: someEff, cmd: [someCmd] }
 *
 * @param initial - the model to start with
 * @param updaters - a list of update functions to apply to the model
 * @returns Accumulated output from all the update functions
 */
export const chainAwait = async <Model, Msg, Event, Cmd>(
  initial: Output<Model, Msg, Event, Cmd>,
  ...updaters: ((
    input: Model
  ) => Output<Model, Msg, Event, Cmd> | Promise<Output<Model, Msg, Event, Cmd>>)[]
): Promise<Output<Model, Msg, Event, Cmd>> => {
  const cmd: Cmd[] = [...(initial.cmd ?? [])];
  const event: Event[] = [...(initial.event ?? [])];
  const eff: Eff<Msg>[] = initial.eff ? [initial.eff] : [];
  let model: Model = {...initial.model};

  for (let i = 0, len = updaters.length; i < len; ++i) {
    const updated = await updaters[i]!(model);
    model = updated.model;

    if (updated.eff) {
      eff.push(updated.eff);
    }

    if (updated.event) {
      for (let j = 0, len = updated.event.length; j < len; ++j) {
        event.push(updated.event[j]!);
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
    event,
    cmd,
  };
};
