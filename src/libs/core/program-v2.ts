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
  let id = 0;
  const subscribers = new Map<
    number,
    (ctx: Ctx, model: Model) => Promise<void>
  >();
  const subscribe = (
    cb: (ctx: Ctx, model: Model) => Promise<void>
  ): (() => void) => {
    subscribers.set(id, cb);
    id++;
    return () => {
      subscribers.delete(id);
    };
  };

  async function callSubscribers(ctx: Ctx, model: Model) {
    for (const cb of subscribers.values()) {
      await cb(ctx, model);
    }
  }

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

  async function setState(
    ctx: Ctx,
    stateNew: { model: Model; cmd?: Cmd<Msg> }
  ) {
    state = stateNew;

    await callSubscribers(ctx, stateNew.model);

    if (subscribed) {
      subscribed.unsubscribe();
    }

    subscribed = input
      .subscriptions({
        ctx,
        model: state.model,
      })
      .subscribe(dispatch);

    if (state.cmd) {
      state.cmd(dispatch);
    }
  }

  function start() {
    const ctx: Ctx = {
      now: Posix.fromNumber(Date.now()),
    };
    setState(ctx, state);

    return function stop() {
      if (subscribed) {
        subscribed.unsubscribe();
      }
      subscribers.clear();
    };
  }

  return {
    start,
    dispatch,
    subscribe,
  };
}
