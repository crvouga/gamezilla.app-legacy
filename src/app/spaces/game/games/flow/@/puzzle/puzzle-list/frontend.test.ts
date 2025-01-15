import { describe, expect, it } from 'bun:test'
import { isRequesting, RequestResponse } from '~/@/request-response/request-response'
import { Err, Ok } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { didSendToBackend, didShowErrorSm } from '~/app/@/frontend/cmd'
import { testFlowFrontendCtx } from '../../../builder/@/testing/frontend'
import { FlowFrontendCtx } from '../../frontend/ctx'
import { Solutions } from '../../solutions/solutions'
import { Variant, VariantDimensions } from '../../variant'
import { Puzzle } from '../puzzle'
import { PuzzleListFrontend } from './frontend'
import { type ModelFrontend, initFrontend } from './types'

const initial = {
  model: initFrontend,
}

const loadCmd = (ctx: FlowFrontendCtx) => (model: ModelFrontend) => {
  return PuzzleListFrontend.update({
    ctx,
    model,
    msgCmd: {
      t: 'puzzle-list',
      c: {
        t: 'load',
      },
    },
  })
}

const backendListedPuzzlesOk = (ctx: FlowFrontendCtx, puzzles: Puzzle[]) => (model: ModelFrontend) => {
  return PuzzleListFrontend.update({
    ctx,
    model,
    msgBackend: {
      t: 'listed-puzzle',
      listed: Ok({
        solutions: Solutions.init,
        puzzles: {
          items: puzzles,
          limit: 25,
          offset: 0,
          total: puzzles.length,
        },
      }),
    },
  })
}

const backendListedPuzzlesErr = (ctx: FlowFrontendCtx, error: string) => (model: ModelFrontend) => {
  return PuzzleListFrontend.update({
    ctx,
    model,
    msgBackend: {
      t: 'listed-puzzle',
      listed: Err(error),
    },
  })
}

const elapsed = (ctx: FlowFrontendCtx, timeSpan: TimeSpan) => (model: ModelFrontend) => {
  return PuzzleListFrontend.update({
    ctx: {
      ...ctx,
      now: Posix.future(ctx.now, timeSpan),
    },
    model,
    msg: {
      t: 'time-passed',
    },
  })
}

describe.skip(import.meta.file, () => {
  it.skip('should it be requesting when the load cmd inputs', async () => {
    const ctx = await testFlowFrontendCtx()
    const output = AppFrontendModule.andThen(initial, loadCmd(ctx))
    expect(isRequesting(output.model.request)).toBe(true)
  })

  it('should send a list puzzles message to backend when the user observes the end of the list', async () => {
    const ctx = await testFlowFrontendCtx()
    const output = AppFrontendModule.andThen(initial, loadCmd(ctx))
    expect(didSendToBackend(output, (msg) => msg.t === 'list-puzzles')).toBe(true)
  })

  it('should record puzzles received from backend', async () => {
    const ctx = await testFlowFrontendCtx()
    const puzzle = await Puzzle.create({
      count: 1,
      createdAt: ctx.now,
      createdBy: ctx.currentUserId,
      flow: Variant.init({
        dimensions: VariantDimensions.init({ t: 'flow-grid', height: 5, width: 5 }),
        terminalsByGroupId: {},
      }),
    })

    const output = AppFrontendModule.andThen(initial, backendListedPuzzlesOk(ctx, [puzzle]))

    expect(output.msgCmd?.some((c) => c.t === 'flow-cmd.add-puzzles')).toBe(true)
  })

  it('should show error when receiving list error fro backend', async () => {
    const ctx = await testFlowFrontendCtx()
    const error = 'Something went wrong'
    const output = AppFrontendModule.andThen(initial, backendListedPuzzlesErr(ctx, error))
    expect(didShowErrorSm(output)).toBe(true)
  })

  it('should show error after no backend response', async () => {
    const ctx = await testFlowFrontendCtx()
    const output = AppFrontendModule.andThen(initial, loadCmd(ctx), elapsed(ctx, TimeSpan.minutes(5)))
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBe(true)
  })
})
