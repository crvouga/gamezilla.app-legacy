import { Eff } from '../eff'
import { Sub } from '../sub'

type MaybePromise<T> = T | Promise<T>

export type CrashResolution =
  | {
      t: 'halt-program'
    }
  | {
      t: 'ignore-crashing-update'
    }

export type Program<TModel, TMsg, TCtx> = {
  initCtx: () => MaybePromise<TCtx>

  updateCtx: (ctx: TCtx) => MaybePromise<TCtx>

  init: (input: { ctx: TCtx }) => MaybePromise<{ model: TModel; eff?: Eff<TMsg> }>

  update: (input: { ctx: TCtx; msg: TMsg; model: TModel }) => MaybePromise<{ model: TModel; eff?: Eff<TMsg> }>

  subscriptions: (input: { intervalId: string; ctx: TCtx; model: TModel }) => MaybePromise<Sub<TMsg>>

  crash: (input: { error: unknown; msg: TMsg; model: TModel; ctx: TCtx }) => unknown

  debugger?: ProgramDebugger

  render?: (input: { model: TModel; ctx: TCtx; dispatch: (msg: TMsg) => void }) => void
}

function generateProgramId() {
  return `program:${Math.random().toString(36).slice(2)}`
}

//
//
//
//
//
//
//
//

export type ProgramDebugger = (
  initialModel: unknown,
  setModel: (model: unknown, msg?: unknown) => MaybePromise<void>,
) => MaybePromise<(model: unknown, msg?: unknown) => void>

export async function run<TModel, TMsg, TCtx>(program: Program<TModel, TMsg, TCtx> & {}) {
  const ctx = await program.initCtx()
  const init = await program.init({ ctx })
  let model: TModel = init.model

  let isUpdating = false
  const queue: TMsg[] = []
  async function dispatch(msg: TMsg) {
    if (!model) {
      return
    }
    try {
      // This is so we don't overwrite ongoing updates
      if (isUpdating) {
        queue.push(msg)
        return
      }

      isUpdating = true

      const ctxNew = await program.updateCtx(ctx)

      const updated = await program.update({
        ctx: ctxNew,
        msg,
        model,
      })
      isUpdating = false

      model = updated.model
      updateDebugger?.(model, msg)
      program.render?.({
        model,
        ctx: ctxNew,
        dispatch,
      })
      updateEff(updated.eff)
      updateSubscriptions(model, ctxNew)

      if (queue.length > 0) {
        const msg = queue.shift()
        if (!msg) {
          return
        }
        dispatch(msg)
      }
    } catch (error) {
      program.crash({
        error,
        msg,
        ctx,
        model,
      })
    }
  }

  function updateEff(eff?: Eff<TMsg> | null) {
    if (eff) {
      Promise.resolve().then(function runEffect() {
        eff(dispatch)
      })
    }
  }

  const intervalId = generateProgramId()
  let cleanUpSubscriptions = () => {}
  async function updateSubscriptions(model: TModel, ctx: TCtx) {
    const sub = await program.subscriptions({
      intervalId,
      ctx,
      model,
    })
    cleanUpSubscriptions()
    cleanUpSubscriptions = sub.sub(dispatch)
  }

  const updateDebugger = await program.debugger?.(model, async function debuggerSetModel(modelNew) {
    const ctxNew = await program.updateCtx(ctx)

    model = modelNew as TModel

    if (!model) {
      return
    }

    program.render?.({ model, ctx: ctxNew, dispatch })
  })

  updateDebugger?.(model, '@INIT')
  program.render?.({ model, ctx, dispatch })
  updateEff(init.eff)
  updateSubscriptions(model, ctx)

  return {
    getModel() {
      return model
    },
    dispatch,
  }
}

export const Program = {
  run,
}
