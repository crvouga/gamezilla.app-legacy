import { describe, expect, it } from 'bun:test'
import { RequestResponse } from '~/@/request-response/request-response'
import { Err, Ok } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { didSendToBackend, didShowErrorSm } from '~/app/@/client/cmd'
import { testFlowClientCtx } from '../../../builder/@/testing/client'
import type { FlowClientCtx } from '../../client/ctx'
import { Pack } from '../pack'
import { PackListClient } from './client'
import { initClient, type ModelClient } from './types'

const initial = {
  model: initClient,
}

const observedEndOfList = (ctx: FlowClientCtx) => (model: ModelClient) => {
  return PackListClient.update({
    ctx,
    model,
    msg: {
      t: 'user-observed-end-of-list',
    },
  })
}

const elapsed = (ctx: FlowClientCtx, timeSpan: TimeSpan) => (model: ModelClient) => {
  return PackListClient.update({
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

const serverListedPacksOk =
  (ctx: FlowClientCtx, ...packs: Pack[]) =>
  (model: ModelClient) => {
    return PackListClient.update({
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

const serverListedPacksErr = (ctx: FlowClientCtx, errorMessage: string) => (model: ModelClient) => {
  return PackListClient.update({
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
    const ctx = await testFlowClientCtx()
    const output = AppClientModule.andThen(initial, observedEndOfList(ctx))
    expect(RequestResponse.isRequesting(output.model.request)).toBe(true)
  })

  it('should send request to server when user observes end of list', async () => {
    const ctx = await testFlowClientCtx()
    const output = AppClientModule.andThen(initial, observedEndOfList(ctx))
    expect(didSendToBackend(output, (msg) => msg.t === 'list-packs')).toBe(true)
  })

  it('should timeout request', async () => {
    const ctx = await testFlowClientCtx()
    const output = AppClientModule.andThen(initial, observedEndOfList(ctx), elapsed(ctx, TimeSpan.minutes(5)))
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBe(true)
  })

  it('should add packs listed from server', async () => {
    const ctx = await testFlowClientCtx()
    const pack = await Pack.create({
      createdBy: ctx.currentUserId,
      now: ctx.now,
      puzzleIds: [],
    })
    const output = AppClientModule.andThen(initial, serverListedPacksOk(ctx, pack))
    expect(Object.values(output.model.packs)).toEqual([pack])
  })

  it('should show error when packs listed from server errors', async () => {
    const ctx = await testFlowClientCtx()
    const output = AppClientModule.andThen(initial, serverListedPacksErr(ctx, 'Something went wrong'))
    expect(didShowErrorSm(output)).toBe(true)
  })
})
