import type { Sub } from './sub'

//
//
//
//
//
//

type MaybePromise<T> = T | Promise<T>

export type ProgramImpure<TMsg, TCtx> = {
  ctx: () => MaybePromise<TCtx>
  init: (input: { ctx: TCtx }) => MaybePromise<{}>
  update: (input: { ctx: TCtx; msg: TMsg }) => MaybePromise<{}>
  subscriptions: (input: { intervalId: string; ctx: TCtx }) => MaybePromise<Sub<TMsg>>
  crash?: (input: { error: unknown }) => void
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

export async function run<TMsg, TCtx>(program: ProgramImpure<TMsg, TCtx> & {}) {
  //
  //
  //
  //
  //
  //

  const intervalId = generateProgramId()
  let cleanUpSubscriptions = () => {}
  async function updateSubscriptions(ctx: TCtx) {
    const sub = await program.subscriptions({
      intervalId,
      ctx
    })
    cleanUpSubscriptions()
    cleanUpSubscriptions = sub.sub(dispatch)
  }

  async function dispatch(msg: TMsg) {
    try {
      const ctx = await program.ctx()

      await program.update({
        ctx,
        msg
      })

      updateSubscriptions(ctx)
    } catch (error) {
      program.crash?.({
        error
      })
    }
  }

  const ctx = await program.ctx()

  await program.init({ ctx })

  updateSubscriptions(ctx)
}

export const ProgramImpure = {
  run
}
