import { EventSourced } from '~/@/event-sourced'
import { isErr, unwrapOr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Space } from '../space/space'
import { BackendCtxModule } from '../types'
import { rpcContract } from './types'

const rpc = (config: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    async 'spaces.sync.sync'(input) {
      const merged = await config.ctx.spacesCore.merge(input.space)

      if (isErr(merged)) {
        return { space: input.space }
      }

      const spaceId = Space.toSpaceId(input.space)

      if (!spaceId) {
        return { space: input.space }
      }

      const spaceNew = unwrapOr(await config.ctx.spacesCore.get(spaceId), null)

      if (!spaceNew) {
        return { space: input.space }
      }

      const starting = EventSourced.startFromLatestSnapshot(spaceNew)

      return { space: starting }
    },
  })
}

const worker = async (s: AbortSignal, input: { ctx: BackendCtxModule }) => {
  const ctx = input.ctx

  const msgSpaceChan = ctx.topic.msgSpace.subAll((c) => c)

  Sub.takeEvery(s, msgSpaceChan, async (c) => {
    const updated = await ctx.spacesCore.update(c)

    if (isErr(updated)) {
      ctx.logger.error(updated.error)
    }
  })
}

export const SyncBackend = {
  rpc,
  worker,
}
