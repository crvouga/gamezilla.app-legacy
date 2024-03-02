import { Eff } from "./eff"
import { Sub } from "./sub"

//
//
//
//
//
//

type Subscriber<Model, Msg, TCtx> = (
  model: Model,
  ctx: TCtx,
  msg: Msg | null,
) => Promise<void> | void

export type Program<TModel, TMsg, TCtx> = {
  dispatch: (msg: TMsg) => void
  subscribe: (subscriber: Subscriber<TModel, TMsg, TCtx>) => () => void
  start: () => Promise<() => void>
  getModel: () => TModel
  setModel: (model: TModel) => Promise<void>
}

type MaybePromise<T> = T | Promise<T>

type ProgramConfig<Model, Msg, TCtx> = {
  ctx: () => MaybePromise<TCtx>
  init: (input: { ctx: TCtx }) => MaybePromise<{ model: Model; eff?: Eff<Msg> }>
  update: (input: {
    ctx: TCtx
    msg: Msg
    model: Model
  }) => MaybePromise<{ model: Model; eff?: Eff<Msg> }>
  subscriptions: (input: {
    intervalId: string
    ctx: TCtx
    model: Model
  }) => MaybePromise<Sub<Msg>>
  onCrash?(input: { error: unknown }): void
}

//
//
//
//
//
//
//
//

export function create<TModel, TMsg, TCtx>(
  config: ProgramConfig<TModel, TMsg, TCtx>,
): Program<TModel, TMsg, TCtx> {
  const programId = `program:${Math.random().toString(36).slice(2)}`
  const subscribers = new Map<number, Subscriber<TModel, TMsg, TCtx>>()
  let isProcessing = false
  const messageQueue: TMsg[] = []
  let unsubscribe: () => void = () => {}
  let state: { model: TModel; eff?: Eff<TMsg> } | null = null

  function publish(model: TModel, ctx: TCtx, msg: TMsg | null) {
    for (const subscriber of subscribers.values()) {
      subscriber(model, ctx, msg)
    }
  }

  const setState = async (
    newState: { model: TModel; eff?: Eff<TMsg> },
    ctx: TCtx,
    msg: TMsg | null,
  ) => {
    state = newState

    publish(state.model, ctx, msg)

    const sub = await config.subscriptions({
      intervalId: programId,
      ctx,
      model: state.model,
    })

    if (unsubscribe) {
      unsubscribe()
    }

    unsubscribe = sub.subscribe(dispatch)

    if (state.eff) {
      state.eff(dispatch)
    }
  }

  const dispatch = (msg: TMsg) => {
    try {
      messageQueue.push(msg)
      processQueue()
    } catch (error) {
      console.error("Program crashed!", error)
    }
  }

  const processQueue = async () => {
    if (isProcessing || messageQueue.length === 0) {
      return
    }
    isProcessing = true
    const msg = messageQueue.shift()!
    const ctx = await config.ctx()
    const updated = await config.update({ ctx, msg, model: state!.model })
    setState(updated, ctx, msg)
    isProcessing = false
    processQueue()
  }

  //
  //
  //
  //

  let runningSubscriberId = 0
  const subscribe = (
    subscriber: Subscriber<TModel, TMsg, TCtx>,
  ): (() => void) => {
    subscribers.set(++runningSubscriberId, subscriber)

    const unsubscribe = () => {
      subscribers.delete(runningSubscriberId)
    }

    return unsubscribe
  }

  const start = async () => {
    const ctx = await config.ctx()

    const init = await config.init({ ctx })

    setState(init, ctx, null)

    const stop = () => {
      if (unsubscribe) {
        unsubscribe()
      }
      subscribers.clear()
    }

    return stop
  }

  //
  //
  //
  //
  //

  const getModel = () => {
    const model = state?.model

    if (!model) {
      throw new Error("Program has not been started yet.")
    }

    return model
  }

  const setModel = async (newState: TModel) => {
    const ctx = await config.ctx()
    state = { model: newState }
    publish(state.model, ctx, null)
  }

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
  }
}

export const Program = {
  create,
}
