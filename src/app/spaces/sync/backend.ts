import { call, takeEvery } from 'typed-redux-saga'
import { EventSourced } from '~/@/event-sourced'
import { isErr, unwrapOr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Space } from '../core/space'
import { BackendCtxModule } from '../types'
import { rpcContract } from './types'
import { Sub } from '~/@/sub'

const rpc = (config: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    async sync(input) {
      const merged = await config.ctx.spacesCoreA.merge(input.space)

      if (isErr(merged)) {
        return { space: input.space }
      }

      const spaceId = Space.toSpaceId(input.space)

      if (!spaceId) {
        return { space: input.space }
      }

      const spaceNew = unwrapOr(await config.ctx.spacesCoreA.get(spaceId), null)

      if (!spaceNew) {
        return { space: input.space }
      }

      const starting = EventSourced.startFromLatestSnapshot(spaceNew)

      return { space: starting }
    },
  })
}

const saga = function* (ctx: BackendCtxModule) {
  const msgSpaceChan = Sub.chan(ctx.topic.sync.msgSpaceAll.subscribe(null, (c) => c))

  yield takeEvery(msgSpaceChan, function* (c) {
    ctx.logger.info('syncing msgSpace', c)

    const updated = yield* call(ctx.spacesCoreA.update, c)

    if (isErr(updated)) {
      ctx.logger.error(updated.error)
    }
  })
}

export const SyncBackend = {
  rpc,
  saga,
}
