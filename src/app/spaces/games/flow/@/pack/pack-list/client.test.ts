import { describe, expect, it } from 'bun:test'
import { Err, Ok, Posix, RequestResponse, TimeSpan } from '~/@/core'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { didSendToServer, didShowErrorSm } from '~/app/@/client'
import { testFlowClientCtx } from '../../../builder/@/testing/client'
import type { FlowClientCtx } from '../../flow-client-ctx'
import { FlowPack } from '../pack'
import { PackListClient } from './client'
import { initClient, type ModelClient } from './types'

const initial = {
  model: initClient
}

const observedEndOfList = (ctx: FlowClientCtx) => (model: ModelClient) => {
  return PackListClient.update({
    ctx,
    model,
    msg: {
      t: 'user-observed-end-of-list'
    }
  })
}

const elapsed = (ctx: FlowClientCtx, timeSpan: TimeSpan) => (model: ModelClient) => {
  return PackListClient.update({
    ctx: {
      ...ctx,
      now: Posix.future(ctx.now, timeSpan)
    },
    model,
    msg: {
      t: 'elapsed'
    }
  })
}

const serverListedPacksOk =
  (ctx: FlowClientCtx, ...packs: FlowPack[]) =>
  (model: ModelClient) => {
    return PackListClient.update({
      ctx: ctx,
      model,
      msgServer: {
        t: 'listed-packs',
        listed: Ok({
          items: packs,
          limit: 25,
          offset: 0,
          total: packs.length
        })
      }
    })
  }

const serverListedPacksErr = (ctx: FlowClientCtx, errorMessage: string) => (model: ModelClient) => {
  return PackListClient.update({
    ctx,
    model,
    msgServer: {
      t: 'listed-packs',
      listed: Err(errorMessage)
    }
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
    expect(didSendToServer(output, (msg) => msg.t === 'list-packs')).toBe(true)
  })

  it('should timeout request', async () => {
    const ctx = await testFlowClientCtx()
    const output = AppClientModule.andThen(initial, observedEndOfList(ctx), elapsed(ctx, TimeSpan.minutes(5)))
    expect(RequestResponse.didRequestTimeout(output.model.request)).toBe(true)
  })

  it('should add packs listed from server', async () => {
    const ctx = await testFlowClientCtx()
    const pack = await FlowPack.create({
      createdBy: ctx.currentUserId,
      now: ctx.now,
      puzzleIds: []
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
