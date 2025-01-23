import { describe, expect, it } from 'bun:test'
import { Sub } from '../sub'
import { Program } from './program'

type Model = { count: number }
type Msg = { t: 'inc' } | { t: 'dec' }
type Ctx = {}

const Fixture = async () => {
  const program = await Program.run<Model, Msg, Ctx>({
    crash: (input) => console.error('Crash!', input),
    initCtx: () => ({}),
    updateCtx: (ctx) => ctx,
    init: () => ({ model: { count: 0 } }),
    subscriptions: () => Sub.None,
    update: ({ model, msg }) => {
      switch (msg.t) {
        case 'inc':
          return { model: { count: model.count + 1 } }
        case 'dec':
          return { model: { count: model.count - 1 } }
      }
    },
  })

  return {
    program,
  }
}

describe.only(import.meta.file, () => {
  it('should work', async () => {
    const f = await Fixture()
    expect(f.program.getModel()).toEqual({ count: 0 })
    await f.program.dispatch({ t: 'inc' })
    expect(f.program.getModel()).toEqual({ count: 1 })
    await f.program.dispatch({ t: 'inc' })
    expect(f.program.getModel()).toEqual({ count: 2 })
    await f.program.dispatch({ t: 'dec' })
    expect(f.program.getModel()).toEqual({ count: 1 })
  })

  it('should ignore crashing message and continue to work', async () => {
    const f = await Fixture()

    expect(f.program.getModel()).toEqual({ count: 0 })
    await f.program.dispatch({ t: 'inc' })
    expect(f.program.getModel()).toEqual({ count: 1 })
    await f.program.dispatch(
      // @ts-expect-error testing invalid message
      { t: 'invalid-message' },
    )
    expect(f.program.getModel()).toEqual({ count: 1 })
    await f.program.dispatch({ t: 'inc' })
    expect(f.program.getModel()).toEqual({ count: 2 })
  })
})
