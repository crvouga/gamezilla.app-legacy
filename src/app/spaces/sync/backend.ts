import { EventSourced } from '~/@/event-sourced'
import { isErr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Space } from '../space/space'
import { BackendCtxModule } from '../types'
import { rpcContract } from './types'

const rpc = (config: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    async 'spaces.sync.sync'(input) {
      const spaceId = Space.toSpaceId(input.space)

      const found = await config.ctx.spacesDb.query({
        pagination: { limit: 1, offset: 0 },
        whereAnd: { equalsSpaceId: spaceId },
      })

      if (isErr(found)) {
        return { space: input.space }
      }

      const existing = found.value.items[0] ?? null

      if (!existing) {
        return { space: input.space }
      }

      const spaceNew = EventSourced.mergeLeft(existing, input.space)

      const upserted = await config.ctx.spacesDb.upsert(spaceNew)

      if (isErr(upserted)) {
        return { space: input.space }
      }

      if (!existing) {
        return { space: input.space }
      }

      const starting = EventSourced.startFromLatestSnapshot(existing)

      return { space: starting }
    },
  })
}

const worker = async (s: AbortSignal, input: { ctx: BackendCtxModule }) => {
  const ctx = input.ctx

  const msgSpaceSub = ctx.topic['spaces/msg'].subAll((c) => c)

  Sub.takeEvery(s, msgSpaceSub, async (msgSpace) => {
    const updated = await ctx.spacesDb.update(msgSpace)

    if (isErr(updated)) {
      ctx.logger.error(updated.error)
    }
  })
}

export const SyncBackend = {
  rpc,
  worker,
}
