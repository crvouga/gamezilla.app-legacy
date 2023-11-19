import { Eff } from "./eff";
import { Sub } from "./sub";
import { Posix } from "./time";

export type Ctx = { now: Posix };

type Subscriber<Model, Msg> = (
  model: Model,
  ctx: Ctx,
  msg: Msg | null
) => Promise<void> | void;

export type Program<Model, Msg> = {
  dispatch: (msg: Msg) => void;
  subscribe: (subscriber: Subscriber<Model, Msg>) => () => void;
  start: () => () => void;
  // internal functions for debuggers
  _getState: () => Model;
  _setState: (state: Model) => void;
};

export function create<Model, Msg>(input: {
  init: (input: { ctx: Ctx }) => { model: Model; eff?: Eff<Msg> };
  update: (input: { ctx: Ctx; msg: Msg; model: Model }) =>
    | {
        model: Model;
        eff?: Eff<Msg>;
      }
    | Promise<{
        model: Model;
        eff?: Eff<Msg>;
      }>;
  subscriptions: (input: {
    intervalId: string;
    ctx: Ctx;
    model: Model;
  }) => Sub<Msg> | Promise<Sub<Msg>>;
}): Program<Model, Msg> {
  const programId = `program:${Math.random().toString(36).slice(2)}`;

  let subscriberId = 0;
  const subscribers = new Map<number, Subscriber<Model, Msg>>();
  let state = input.init({
    ctx: {
      now: Posix.fromNumber(Date.now()),
    },
  });
  let isProcessing = false;
  const messageQueue: Msg[] = [];
  let unsubscribe: () => void = () => {};

  async function publish(model: Model, ctx: Ctx, msg: Msg | null) {
    for (const subscriber of subscribers.values()) {
      await subscriber(model, ctx, msg);
    }
  }

  async function dispatch(msg: Msg) {
    const ctx = {
      now: Posix.fromNumber(Date.now()),
    };
    const updated = await input.update({ ctx, msg, model: state.model });
    setState(updated, ctx, msg);
  }

  async function setState(
    newState: { model: Model; eff?: Eff<Msg> },
    ctx: Ctx,
    msg: Msg | null
  ) {
    state = newState;
    publish(state.model, ctx, msg);

    const sub = await input.subscriptions({
      intervalId: programId,
      ctx,
      model: state.model,
    });
    if (unsubscribe) {
      unsubscribe();
    }
    unsubscribe = sub.subscribe((msg) => enqueueMsg(msg));

    if (state.eff) {
      state.eff(enqueueMsg);
    }
  }

  function enqueueMsg(msg: Msg) {
    messageQueue.push(msg);
    processQueue();
  }

  async function processQueue() {
    if (isProcessing || messageQueue.length === 0) return;
    isProcessing = true;
    const msg = messageQueue.shift();
    if (msg) {
      await dispatch(msg);
    }
    isProcessing = false;
    processQueue();
  }

  const subscribe = (subscriber: Subscriber<Model, Msg>): (() => void) => {
    subscribers.set(++subscriberId, subscriber);
    return () => subscribers.delete(subscriberId);
  };

  const start = () => {
    const ctx = {
      now: Posix.fromNumber(Date.now()),
    };
    setState(state, ctx, null);
    return () => {
      if (unsubscribe) unsubscribe();
      subscribers.clear();
    };
  };

  return {
    start,
    dispatch: enqueueMsg,
    subscribe,
    _getState: () => state.model,
    _setState: (newState) => {
      const ctx = {
        now: Posix.fromNumber(Date.now()),
      };
      setState({ model: newState }, ctx, null);
    },
  };
}
