import { Eff } from "./eff";
import { Sub } from "./sub";
import { Posix } from "./unix-time";

export type Ctx = { now: Posix };

type Subscriber<Model, Msg> = (
  model: Model,
  ctx: Ctx,
  msg: Msg | null
) => Promise<void> | void;

export type Program<Model, Msg> = {
  dispatch: (msg: Msg) => void;
  subscribe: (subscriber: Subscriber<Model, Msg>) => () => void;
  getState: () => Model;
  setState: (state: Model) => void;
  start: () => () => void;
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
    ctx: Ctx;
    model: Model;
  }) => Sub<Msg> | Promise<Sub<Msg>>;
}): Program<Model, Msg> {
  let subscriberId = 0;

  const subscribers = new Map<number, Subscriber<Model, Msg>>();
  const subscribe = (subscriber: Subscriber<Model, Msg>): (() => void) => {
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
  let isProcessing = false;
  const messageQueue: Msg[] = [];

  function enqueueMsg(msg: Msg) {
    messageQueue.push(msg);
    processQueue();
  }

  async function processQueue() {
    if (isProcessing || messageQueue.length === 0) {
      return;
    }

    isProcessing = true;

    const msg = messageQueue.shift();
    if (msg) {
      await dispatch(msg);
    }

    isProcessing = false;

    processQueue();
  }

  let unsubscribe: () => void = () => {};

  async function dispatch(msg: Msg) {
    const ctx: Ctx = {
      now: Posix.fromNumber(Date.now()),
    };

    const updated = input.update({
      model: state.model,
      msg,
      ctx,
    });

    const awaited = await updated;

    setState(awaited, ctx, msg);
  }

  async function setState(
    stateNew: { model: Model; eff?: Eff<Msg> },
    ctx: Ctx,
    msg: Msg | null
  ) {
    state = stateNew;

    await publish(stateNew.model, ctx, msg);

    const sub = await input.subscriptions({
      ctx,
      model: state.model,
    });

    if (unsubscribe) {
      unsubscribe();
    }
    unsubscribe = sub.subscribe(enqueueMsg);

    if (state.eff) {
      state.eff(enqueueMsg);
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

  return {
    start,
    dispatch: enqueueMsg,
    subscribe,
    getState: () => {
      return state.model;
    },
    setState: (state) => {
      publish(state, { now: Posix.fromNumber(Date.now()) }, null);
      if (unsubscribe) {
        unsubscribe();
      }
    },
  };
}
