import type { Eff } from './eff'
import type { Sub } from './sub'

//
//
//
//
//
//

type MaybePromise<T> = T | Promise<T>

export type Program<TModel, TMsg, TCtx> = {
  initCtx: () => MaybePromise<TCtx>

  updateCtx: (ctx: TCtx) => MaybePromise<TCtx>

  init: (input: { ctx: TCtx }) => MaybePromise<{ model: TModel; eff?: Eff<TMsg> }>

  update: (input: { ctx: TCtx; msg: TMsg; model: TModel }) => MaybePromise<{ model: TModel; eff?: Eff<TMsg> }>

  subscriptions: (input: { intervalId: string; ctx: TCtx; model: TModel }) => MaybePromise<Sub<TMsg>>

  debugger?: ProgramDebugger

  crash: (input: { error: unknown }) => void

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
  setModel: (model: unknown, msg?: unknown) => MaybePromise<void>
) => MaybePromise<(model: unknown, msg?: unknown) => void>

export async function run<TModel, TMsg, TCtx>(program: Program<TModel, TMsg, TCtx> & {}) {
  let model: TModel | null = null

  //
  //
  //
  //
  //
  //

  function updateUI(model: TModel, ctx: TCtx) {
    program.render?.({
      model,
      ctx,
      dispatch
    })
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
      model
    })
    cleanUpSubscriptions()
    cleanUpSubscriptions = sub.sub(dispatch)
  }

  let isUpdating = false
  const queue: TMsg[] = []

  const ctx = await program.initCtx()

  async function dispatch(msg: TMsg) {
    if (!model) {
      return
    }
    try {
      const ctxNew = await program.updateCtx(ctx)

      // This is so we don't overwrite ongoing updates
      if (isUpdating) {
        queue.push(msg)
        return
      }

      isUpdating = true
      const updated = await program.update({
        ctx: ctxNew,
        msg,
        model
      })
      isUpdating = false

      model = updated.model
      updateUI(model, ctxNew)
      updateEff(updated.eff)
      updateSubscriptions(model, ctxNew)
      updateDebugger?.(model, msg)

      if (queue.length > 0) {
        const msg = queue.shift()
        if (!msg) {
          return
        }
        dispatch(msg)
      }
    } catch (error) {
      program.crash({
        error
      })
    }
  }

  const init = await program.init({ ctx })

  model = init.model
  updateUI(model, ctx)
  updateEff(init.eff)
  updateSubscriptions(model, ctx)

  const updateDebugger = await program.debugger?.(model, async function debuggerSetModel(modelNew) {
    const ctxNew = await program.updateCtx(ctx)

    // @ts-expect-error
    model = modelNew

    if (!model) {
      return
    }

    program.render?.({
      model,
      ctx: ctxNew,
      dispatch
    })
  })
  updateDebugger?.(model, '@INIT')

  return {
    getModel() {
      return model
    }
  }
}

export const Program = {
  run
}
