import { EventSourced } from '~/@/event-sourced'
import { WithEventId } from '~/@/event-sourced/event'
import { isErr, Ok } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space'
import { BackendCtxModule } from '../types'
import { rpcContract } from './types'

const rpc = (config: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    async 'spaces.sync.sync'(input) {
      const spaceId = Space.toSpaceId(input.space)

      const found = await config.ctx.spacesDb.query({
        pagination: { limit: 1, offset: 0 },
        whereAnd: { spaceId: { '=': spaceId } },
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
    const updated = await update(ctx, msgSpace)

    if (isErr(updated)) {
      ctx.logger.error(updated.error)
    }
  })
}

const update = async (ctx: BackendCtxModule, spaceEvent: WithEventId<MsgSpace>) => {
  const got = await ctx.spacesDb.query({
    pagination: { limit: 1, offset: 0 },
    whereAnd: { spaceId: { '=': spaceEvent.spaceId } },
  })

  if (isErr(got)) return got

  const maybeSpace = got.value.items[0]

  const space = maybeSpace ?? Space.init

  const spaceNew = EventSourced.appendEvent(Space.config, space, spaceEvent)

  const upserted = await ctx.spacesDb.upsert(spaceNew)

  if (isErr(upserted)) return upserted

  return Ok(null)
}

export const SyncBackend = {
  rpc,
  worker,
}
