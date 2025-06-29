import { describe, expect, test } from '~/@/test-runner'
import { Sub } from '../sub'
import { Program, ProgramCrashReport } from './program'
import { TimeSpan } from '../time/time-span'
import { sleep } from '../promise/sleep'

type Model = { counter: { count: number } }
type Msg = { t: 'inc' } | { t: 'dec' } | { t: 'set-model'; c: Model }

const Fixture = async () => {
  const crashes = Sub.create<ProgramCrashReport<Model, Msg>>()
  const program = await Program.run<Model, Msg>({
    crash: (crashReport) => {
      crashes.pub(crashReport)
    },
    init: () => ({ model: { counter: { count: 0 } } }),
    subscriptions: () => Sub.none(),
    update: ({ model, msg }) => {
      switch (msg.t) {
        case 'inc':
          return { model: { counter: { count: model.counter.count + 1 } } }
        case 'dec':
          return { model: { counter: { count: model.counter.count - 1 } } }
        case 'set-model':
          return { model: msg.c }
      }
    },
  })

  return {
    crashes,
    program,
  }
}

describe('Program', () => {
  test('should work', async () => {
    const f = await Fixture()
    expect(f.program.getModel()).toEqual({ counter: { count: 0 } })
    await f.program.dispatch({ t: 'inc' })
    expect(f.program.getModel()).toEqual({ counter: { count: 1 } })
    await f.program.dispatch({ t: 'inc' })
    expect(f.program.getModel()).toEqual({ counter: { count: 2 } })
    await f.program.dispatch({ t: 'dec' })
    expect(f.program.getModel()).toEqual({ counter: { count: 1 } })
  })

  test('should ignore crashing message and continue to work', async () => {
    const f = await Fixture()

    expect(f.program.getModel()).toEqual({ counter: { count: 0 } })
    await f.program.dispatch({ t: 'inc' })
    expect(f.program.getModel()).toEqual({ counter: { count: 1 } })
    await f.program.dispatch(
      // @ts-expect-error corrupting model on purpose
      { t: 'set-model', c: { some_invalid_model: true } },
    )
    let crashReport: ProgramCrashReport<Model, Msg> | undefined
    f.crashes.sub((m) => {
      crashReport = m
    })
    await f.program.dispatch({ t: 'inc' })

    await sleep(TimeSpan.milliseconds(100))

    expect(Boolean(crashReport)).toEqual(true)
  })
})
