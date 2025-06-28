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

export type ProgramCrashReport<TModel, TMsg> = {
  message: string
  error: unknown
  msg: TMsg
  model: TModel
}

export type Program<TModel, TMsg> = {
  init: () => MaybePromise<{ model: TModel; eff?: Eff<TMsg> }>

  update: (input: { msg: TMsg; model: TModel }) => MaybePromise<{ model: TModel; eff?: Eff<TMsg> }>

  subscriptions: (input: { intervalId: string; model: TModel }) => MaybePromise<Sub<TMsg>>

  crash?: (input: ProgramCrashReport<TModel, TMsg>) => MaybePromise<unknown>

  debugger?: ProgramDebugger

  render?: (input: { model: TModel; dispatch: (msg: TMsg) => void }) => void
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

export async function run<TModel, TMsg>(program: Program<TModel, TMsg> & {}) {
  const PROGRAM_ID = generateProgramId()

  const init = await program.init()

  let model: TModel = init.model
  let isUpdating = false
  const msgs: TMsg[] = []
  const queue: TMsg[] = []
  let cleanUpSubscriptions = () => {}

  async function dispatch(msg: TMsg) {
    try {
      msgs.push(msg)

      if (!model) return

      if (isUpdating) {
        queue.push(msg)
        return
      }

      isUpdating = true
      const updated = await program.update({ msg, model })
      isUpdating = false

      model = updated.model
      updateDebugger?.(model, msg)
      program.render?.({ model, dispatch })
      updateEff(updated.eff)
      updateSubscriptions(model)

      if (queue.length > 0) {
        const msg = queue.shift()
        if (!msg) {
          return
        }
        dispatch(msg)
      }
    } catch (error) {
      await program.crash?.({ message: 'Program crashed while dispatching message', error, msg, model })
    }
  }

  function updateEff(eff?: Eff<TMsg> | null) {
    if (eff) {
      Promise.resolve().then(function runEffect() {
        eff(dispatch)
      })
    }
  }

  async function updateSubscriptions(model: TModel) {
    const sub = await program.subscriptions({ intervalId: PROGRAM_ID, model })
    cleanUpSubscriptions()
    cleanUpSubscriptions = sub.sub(dispatch)
  }

  const updateDebugger = await program.debugger?.(model, async function debuggerSetModel(modelNew) {
    model = modelNew as TModel

    if (!model) return

    program.render?.({ model, dispatch })
  })

  updateDebugger?.(model, '@INIT')
  updateEff(init.eff)
  updateSubscriptions(model)
  program.render?.({ model, dispatch })

  return {
    dispatch,
    getModel() {
      return model
    },
    getMsgs() {
      return msgs
    },
    cleanUp() {
      cleanUpSubscriptions()
    },
  }
}

export const Program = {
  run,
}
