import { EventSourced } from '~/@/event-sourced'
import { isErr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { SpaceId } from '~/app/@/data/space-id'
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

  const spaces = new Map<SpaceId, Space.Model>()

  const upsertSpace = throttleByKey({
    behavior: 'use-latest',
    throttle: TimeSpan.seconds(3),
    keyFn: (spaceId, _space) => spaceId,
    fn: (_spaceId: SpaceId, space: Space.Model) => ctx.spacesDb.upsert(space),
  })

  Sub.takeEvery(s, msgSpaceSub, async (msgSpace) => {
    if (!spaces.has(msgSpace.spaceId)) {
      const got = await ctx.spacesDb.query({
        pagination: { limit: 1, offset: 0 },
        whereAnd: { spaceId: { '=': msgSpace.spaceId } },
      })
      if (isErr(got)) return

      spaces.set(msgSpace.spaceId, got.value.items[0] ?? Space.init)
    }

    const space = spaces.get(msgSpace.spaceId) ?? Space.init

    const spaceNew = EventSourced.appendEvent(Space.config, space, msgSpace)

    spaces.set(msgSpace.spaceId, spaceNew)

    upsertSpace(msgSpace.spaceId, spaceNew)
  })
}

export const SyncBackend = {
  rpc,
  worker,
}
