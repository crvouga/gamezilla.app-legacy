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
  let subscriberId = 0;

  type Subscriber = (
    model: Model,
    ctx: Ctx,
    msg: Msg | null
  ) => Promise<void> | void;

  const subscribers = new Map<number, Subscriber>();
  const subscribe = (subscriber: Subscriber): (() => void) => {
    subscribers.set(subscriberId++, subscriber);
    return () => {
      subscribers.delete(subscriberId);
    };
  };

  async function publish(model: Model, ctx: Ctx, msg: Msg | null) {
    for (const subscriber of subscribers.values()) {
      await subscriber(model, ctx, msg);
    }
  }

  let state = input.init({
    ctx: {
      now: Posix.fromNumber(Date.now()),
    },
  });

  let unsubscribe: () => void = () => {};

  function dispatch(msg: Msg) {
    const ctx: Ctx = {
      now: Posix.fromNumber(Date.now()),
    };

    const updated = input.update({
      model: state.model,
      msg,
      ctx,
    });

    setState(updated, ctx, msg);
  }

  async function setState(
    stateNew: { model: Model; cmd?: Cmd<Msg> },
    ctx: Ctx,
    msg: Msg | null
  ) {
    state = stateNew;

    await publish(stateNew.model, ctx, msg);

    const sub = input.subscriptions({
      ctx,
      model: state.model,
    });

    if (unsubscribe) {
      unsubscribe();
    }
    unsubscribe = sub.subscribe(dispatch);

    if (state.cmd) {
      state.cmd(dispatch);
    }
  }

  function start() {
    const ctx: Ctx = {
      now: Posix.fromNumber(Date.now()),
    };
    setState(state, ctx, null);

    return function stop() {
      if (unsubscribe) {
        unsubscribe();
      }
      subscribers.clear();
    };
  }

  function _debugSetState(model: Model) {
    console.log({ model });
  }

  return {
    start,
    dispatch,
    subscribe,
    _debugSetState,
  };
}
