import { Eff } from "./eff";
import { Sub } from "./sub";
import { Posix } from "./data";

export type Ctx = { now: Posix };

type Subscriber<Model, Msg> = (
  model: Model,
  ctx: Ctx,
  msg: Msg | null
) => Promise<void> | void;

export type Program<Model, Msg> = {
  dispatch: (msg: Msg) => void;
  subscribe: (subscriber: Subscriber<Model, Msg>) => () => void;
  start: () => Promise<() => void>;
  getModel: () => Model;
  setModel: (model: Model) => void;
};

type MaybePromise<T> = T | Promise<T>;

type ProgramConfig<Model, Msg, TCtx = Ctx> = {
  getCtx?: () => MaybePromise<TCtx>;
  init: (input: {
    ctx: TCtx;
  }) => MaybePromise<{ model: Model; eff?: Eff<Msg> }>;
  update: (input: {
    ctx: TCtx;
    msg: Msg;
    model: Model;
  }) => MaybePromise<{ model: Model; eff?: Eff<Msg> }>;
  subscriptions: (input: {
    intervalId: string;
    ctx: TCtx;
    model: Model;
  }) => MaybePromise<Sub<Msg>>;
};

export function create<Model, Msg>(
  input: ProgramConfig<Model, Msg>
): Program<Model, Msg> {
  const programId = `program:${Math.random().toString(36).slice(2)}`;
  const subscribers = new Map<number, Subscriber<Model, Msg>>();
  let isProcessing = false;
  const messageQueue: Msg[] = [];
  let unsubscribe: () => void = () => {};
  let state: { model: Model; eff?: Eff<Msg> } | null = null;

  function publish(model: Model, ctx: Ctx, msg: Msg | null) {
    for (const subscriber of subscribers.values()) {
      subscriber(model, ctx, msg);
    }
  }

  const onMsg = async (msg: Msg) => {
    const ctx = { now: Posix.now$() };
    const updated = await input.update({ ctx, msg, model: state!.model });
    setState(updated, ctx, msg);
  };

  const setState = async (
    newState: { model: Model; eff?: Eff<Msg> },
    ctx: Ctx,
    msg: Msg | null
  ) => {
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

    unsubscribe = sub.subscribe(dispatch);

    if (state.eff) {
      state.eff(dispatch);
    }
  };

  const dispatch = (msg: Msg) => {
    messageQueue.push(msg);
    processQueue();
  };

  const processQueue = async () => {
    if (isProcessing || messageQueue.length === 0) {
      return;
    }
    isProcessing = true;
    const msg = messageQueue.shift();
    if (msg) {
      await onMsg(msg);
    }
    isProcessing = false;
    processQueue();
  };

  //
  //
  //
  //

  let runningSubscriberId = 0;
  const subscribe = (subscriber: Subscriber<Model, Msg>): (() => void) => {
    subscribers.set(++runningSubscriberId, subscriber);

    const unsubscribe = () => {
      subscribers.delete(runningSubscriberId);
    };

    return unsubscribe;
  };

  const start = async () => {
    const ctx = { now: Posix.now$() };

    const init = await input.init({ ctx });

    setState(init, ctx, null);

    const stop = () => {
      if (unsubscribe) {
        unsubscribe();
      }
      subscribers.clear();
    };

    return stop;
  };

  //
  //
  //
  //
  //

  const getModel = () => {
    return state!.model;
  };

  const setModel = (newState: Model) => {
    const ctx = { now: Posix.now$() };
    state = { model: newState };
    publish(state.model, ctx, null);
  };

  //
  //
  //
  //
  //

  return {
    start,
    dispatch,
    subscribe,
    setModel,
    getModel,
  };
}

export const Program = {
  create,
};
