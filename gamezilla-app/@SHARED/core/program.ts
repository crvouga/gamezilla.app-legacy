import { Eff } from "./eff"
import { Sub } from "./sub"

//
//
//
//
//
//

type MaybePromise<T> = T | Promise<T>

export type Program<TModel, TMsg, TCtx> = {
  ctx: () => MaybePromise<TCtx>

  init: (input: {
    ctx: TCtx
  }) => MaybePromise<{ model: TModel; eff?: Eff<TMsg> }>

  update: (input: {
    ctx: TCtx
    msg: TMsg
    model: TModel
  }) => MaybePromise<{ model: TModel; eff?: Eff<TMsg> }>

  subscriptions: (input: {
    intervalId: string
    ctx: TCtx
    model: TModel
  }) => MaybePromise<Sub<TMsg>>

  debugger?: ProgramDebugger

  crash?: (input: { error: unknown }) => void

  render?: (input: {
    model: TModel
    ctx: TCtx
    dispatch: (msg: TMsg) => void
  }) => void
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
  initialModel: any,
  setModel: (model: any, msg?: any) => MaybePromise<void>,
) => MaybePromise<(model: any, msg?: any) => void>

export async function run<TModel, TMsg, TCtx>(
  program: Program<TModel, TMsg, TCtx> & {},
) {
  let model: TModel | null = null

  //
  //
  //
  //
  //
  //

  function updateUI(model: TModel, ctx: TCtx) {
    program.render?.({ model, ctx, dispatch })
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
    cleanUpSubscriptions = sub.subscribe(dispatch)
  }

  async function dispatch(msg: TMsg) {
    try {
      const ctx = await program.ctx()

      const updated = await program.update({
        ctx,
        msg,
        model: model!,
      })

      model = updated.model
      updateUI(model, ctx)
      updateEff(updated.eff)
      updateSubscriptions(model, ctx)
      updateDebugger?.(model, msg)
    } catch (error) {
      program.crash?.({ error })
    }
  }

  const ctx = await program.ctx()

  const init = await program.init({ ctx })

  model = init.model
  updateUI(model, ctx)
  updateEff(init.eff)
  updateSubscriptions(model, ctx)

  const updateDebugger = await program.debugger?.(
    model,
    async function debuggerSetModel(modelNew) {
      const ctx = await program.ctx()

      model = modelNew

      program.render?.({ model: model!, ctx, dispatch })
    },
  )

  updateDebugger?.(model, "@INIT")
}

export const Program = {
  run,
}
