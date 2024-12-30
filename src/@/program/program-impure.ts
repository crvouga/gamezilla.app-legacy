import { Sub } from './sub'

export type ProgramImpure<TMsg, TCtx> = {
  initCtx: () => Promise<TCtx>
  updateCtx: (ctx: TCtx) => TCtx
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

  const ctx = await program.initCtx()

  async function dispatch(msg: TMsg) {
    try {
      await program.update({
        ctx: program.updateCtx(ctx),
        msg
      })

      updateSubscriptions(ctx)
    } catch (error) {
      program.crash?.({
        error
      })
    }
  }

  await program.init({ ctx })

  await updateSubscriptions(ctx)
}

export const ProgramImpure = {
  run
}
