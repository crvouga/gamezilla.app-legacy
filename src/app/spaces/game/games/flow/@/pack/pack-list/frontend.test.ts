import { describe, expect, it } from 'bun:test'
import { RequestResponse } from '~/@/request-response/request-response'
import { Err, Ok } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { didSendToBackend, didShowErrorSm } from '~/app/@/frontend/cmd'
import { testFlowFrontendCtx } from '../../../builder/@/testing/frontend'
import type { FlowFrontendCtx } from '../../frontend/ctx'
import { Pack } from '../pack'
import { PackListFrontend } from './frontend'
import { initFrontend, type ModelFrontend } from './types'

const initial = {
  model: initFrontend,
}

const observedEndOfList = (ctx: FlowFrontendCtx) => (model: ModelFrontend) => {
  return PackListFrontend.update({
    ctx,
    model,
    msg: {
      t: 'user-observed-end-of-list',
    },
  })
}

const elapsed = (ctx: FlowFrontendCtx, timeSpan: TimeSpan) => (model: ModelFrontend) => {
  return PackListFrontend.update({
    ctx: {
      ...ctx,
      now: Posix.future(ctx.now, timeSpan),
    },
    model,
    msg: {
      t: 'elapsed',
    },
  })
}

const backendListedPacksOk =
  (ctx: FlowFrontendCtx, ...packs: Pack[]) =>
  (model: ModelFrontend) => {
    return PackListFrontend.update({
      ctx: ctx,
      model,
      msgBackend: {
        t: 'listed-packs',
        listed: Ok({
          items: packs,
          limit: 25,
          offset: 0,
          total: packs.length,
        }),
      },
    })
  }

const backendListedPacksErr = (ctx: FlowFrontendCtx, errorMessage: string) => (model: ModelFrontend) => {
  return PackListFrontend.update({
    ctx,
    model,
    msgBackend: {
      t: 'listed-packs',
      listed: Err(errorMessage),
    },
  })
}

describe(import.meta.file, () => {
  it('should be request when user observes end of list', async () => {
    const ctx = await testFlowFrontendCtx()
    const output = AppFrontendModule.andThen(initial, observedEndOfList(ctx))
    expect(RequestResponse.isRequesting(output.model.request)).toBe(true)
  })

  it('should send request to backend when user observes end of list', async () => {
    const ctx = await testFlowFrontendCtx()
    const output = AppFrontendModule.andThen(initial, observedEndOfList(ctx))
    expect(didSendToBackend(output, (msg) => msg.t === 'list-packs')).toBe(true)
  })

  it('should timeout request', async () => {
    const ctx = await testFlowFrontendCtx()
    const output = AppFrontendModule.andThen(initial, observedEndOfList(ctx), elapsed(ctx, TimeSpan.minutes(5)))
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBe(true)
  })

  it.skip('should add packs listed from backend', async () => {
    const ctx = await testFlowFrontendCtx()
    const pack = await Pack.create({
      createdBy: ctx.currentUserId,
      now: ctx.now,
      puzzleIds: [],
    })
    AppFrontendModule.andThen(initial, backendListedPacksOk(ctx, pack))
    // expect(Object.values(output.ctx.packs)).toEqual([pack])
  })

  it('should show error when packs listed from backend errors', async () => {
    const ctx = await testFlowFrontendCtx()
    const output = AppFrontendModule.andThen(initial, backendListedPacksErr(ctx, 'Something went wrong'))
    expect(didShowErrorSm(output)).toBe(true)
  })
})
