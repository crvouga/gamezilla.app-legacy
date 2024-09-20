import type { Sub } from './sub'

export type ProgramImpure<TMsg, TCtx> = {
  initCtx: () => TCtx
  init: (input: { ctx: TCtx }) => Promise<{}>
  update: (input: { ctx: TCtx; msg: TMsg }) => Promise<{}>
  subscriptions: (input: { intervalId: string; ctx: TCtx }) => Promise<Sub<TMsg>>
  crash?: (input: { error: unknown }) => void
}

function generateProgramId() {
  return `program:${Math.random().toString(36).slice(2)}`
}

export async function run<TMsg, TCtx>(program: ProgramImpure<TMsg, TCtx> & {}) {
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
      const ctx = await program.initCtx()

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

  const ctx = await program.initCtx()

  await program.init({ ctx })

  updateSubscriptions(ctx)
}

export const ProgramImpure = {
  run
}
