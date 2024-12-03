import { describe, expect, it } from 'bun:test'
import { Err, Ok, Posix, RequestResponse, TimeSpan, isRequesting } from '@/core'
import { andThen } from 'app/@/architecture/app-client'
import { didSendToServer, didShowErrorSm } from 'app/@/client'
import { testSpaceClientCtx } from '../../../../@/testing/client'
import { testFlowClientCtx } from '../../../builder/@/testing/client'
import { FlowVariant, FlowVariantDimensions } from '../../flow'
import type { FlowClientCtx } from '../../flow-client-ctx'
import { FlowPuzzle } from '../puzzle'
import { PuzzleListClient } from './client'
import { type ModelClient, initClient } from './types'
import { SpaceClientCtx } from 'app/spaces/@/space-client-ctx'

const initial = {
  model: initClient
}

const loadCmd = (ctx: SpaceClientCtx) => (model: ModelClient) => {
  return PuzzleListClient.update({
    ctx,
    model,
    msgCmd: {
      t: 'flow-puzzle-list',
      c: {
        t: 'load'
      }
    }
  })
}

const serverListedPuzzlesOk = (ctx: FlowClientCtx, puzzles: FlowPuzzle[]) => (model: ModelClient) => {
  return PuzzleListClient.update({
    ctx,
    model,
    msgServer: {
      t: 'flow-puzzle-list.listed-puzzle',
      listed: Ok({
        items: puzzles,
        limit: 25,
        offset: 0,
        total: puzzles.length
      })
    }
  })
}

const serverListedPuzzlesErr = (ctx: FlowClientCtx, error: string) => (model: ModelClient) => {
  return PuzzleListClient.update({
    ctx,
    model,
    msgServer: {
      t: 'flow-puzzle-list.listed-puzzle',
      listed: Err(error)
    }
  })
}

const elapsed = (ctx: FlowClientCtx, timeSpan: TimeSpan) => (model: ModelClient) => {
  return PuzzleListClient.update({
    ctx: {
      ...ctx,
      now: Posix.future(ctx.now, timeSpan)
    },
    model,
    msg: {
      t: 'flow-puzzle-list.time-passed'
    }
  })
}

describe(import.meta.file, () => {
  it('should it be requesting when the load cmd inputs', async () => {
    const ctx = await testSpaceClientCtx()
    const output = andThen(initial, loadCmd(ctx))
    expect(isRequesting(output.model.request)).toBe(true)
  })

  it('should send a list puzzles message to server when the user observes the end of the list', async () => {
    const ctx = await testSpaceClientCtx()
    const output = andThen(initial, loadCmd(ctx))
    expect(didSendToServer(output, (msg) => msg.t === 'flow-puzzle-list.list-puzzles')).toBe(true)
  })

  it('should record puzzles recieved from server', async () => {
    const ctx = await testFlowClientCtx()
    const puzzle = await FlowPuzzle.create({
      count: 1,
      createdAt: ctx.now,
      createdBy: ctx.currentUserId,
      flow: FlowVariant.init({
        dimensions: FlowVariantDimensions.init({
          t: 'flow-grid',
          height: 5,
          width: 5
        }),
        terminalsByGroupId: {}
      })
    })

    const output = andThen(initial, serverListedPuzzlesOk(ctx, [puzzle]))

    expect(Object.values(output.model.puzzles)).not.toEqual([])
  })

  it('should show error when recieving list error fro server', async () => {
    const ctx = await testFlowClientCtx()
    const error = 'Something went wrong'
    const output = andThen(initial, serverListedPuzzlesErr(ctx, error))
    expect(didShowErrorSm(output)).toBe(true)
  })

  it('should show error after no server response', async () => {
    const ctx = await testFlowClientCtx()
    const output = andThen(initial, loadCmd(ctx), elapsed(ctx, TimeSpan.minutes(5)))
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBe(true)
  })
})
