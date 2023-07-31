import { Subscription } from "rxjs";
import { Cmd } from "./cmd";
import { Sub } from "./sub";
import { Posix } from "./unix-time";

export type Ctx = { now: Posix };

export type Program<Model, Msg> = {
  dispatch: (msg: Msg) => void;
  subscribe: (cb: (model: Model) => void) => () => void;
};

export function create<Model, Msg>(input: {
  init: (input: { ctx: Ctx }) => { model: Model; cmd?: Cmd<Msg> };
  update: (input: { ctx: Ctx; msg: Msg; model: Model }) => {
    model: Model;
    cmd?: Cmd<Msg>;
  };
  subscriptions: (input: { ctx: Ctx; model: Model }) => Sub<Msg>;
}) {
  let state = input.init({
    ctx: {
      now: Posix.fromNumber(Date.now()),
    },
  });

  let subscribed: Subscription | null = null;

  function dispatch(msg: Msg) {
    const ctx: Ctx = {
      now: Posix.fromNumber(Date.now()),
    };

    const updated = input.update({
      model: state.model,
      msg,
      ctx,
    });

    setState(ctx, updated);
  }

  function setState(ctx: Ctx, stateNew: { model: Model; cmd?: Cmd<Msg> }) {
    if (subscribed) {
      subscribed.unsubscribe();
    }

    subscribed = input
      .subscriptions({
        ctx,
        model: stateNew.model,
      })
      .subscribe(dispatch);

    if (stateNew.cmd) {
      stateNew.cmd(dispatch);
    }

    state = stateNew;
  }

  const ctx: Ctx = {
    now: Posix.fromNumber(Date.now()),
  };
  setState(ctx, state);

  return {
    dispatch,
  };
}
