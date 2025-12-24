import { EventSourced } from '~/@/event-sourced'
import { isErr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../space/space'
import { SpaceEntity } from '../space/space-db/space-entity'
import { SpaceProjectionEntity } from '../space/space-db/space-projection-entity'
import { SpaceProjectionUserEntity } from '../space/space-db/space-projection-user-entity'
import { BackendCtxModule } from '../types'
import { rpcContract } from './types'

const rpc = (config: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    async spaces_sync(input) {
      const spaceId = Space.toSpaceId(input.space)

      if (!spaceId) {
        return { space: input.space }
      }

      const found = await config.ctx.spaceDb.query({
        where: {
          op: '=',
          column: 'id',
          value: spaceId,
        },
      })

      if (isErr(found)) {
        return { space: input.space }
      }

      const existingEntity = found.value.entities.items[0] ?? null
      const existing = existingEntity?.space ?? null

      if (!existing) {
        return { space: input.space }
      }

      const spaceNew = EventSourced.mergeLeft(existing, input.space)

      const spaceIdNew = Space.toSpaceId(spaceNew)
      if (!spaceIdNew) {
        return { space: input.space }
      }

      const now = UnixMs.now()
      const snapshot = EventSourced.toLatestSnapshot(spaceNew)

      // Upsert to space table
      const spaceEntity: SpaceEntity = {
        id: spaceIdNew,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        space: spaceNew,
      }
      const upserted = await config.ctx.spaceDb.upsert({ entities: [spaceEntity] })

      if (isErr(upserted)) {
        return { space: input.space }
      }

      // Upsert to projection table
      const projectionEntity: SpaceProjectionEntity = {
        id: spaceIdNew,
        hostId: snapshot.type === 'initial' ? null : snapshot.hostId,
        gameId:
          snapshot.type === 'initial' ? null : snapshot.type === 'started' && snapshot.game ? snapshot.game.t : null,
        type: snapshot.type,
        updatedAt: now,
      }
      await config.ctx.spaceProjectionDb.upsert({ entities: [projectionEntity] })

      // Update projection_user table
      await config.ctx.spaceProjectionUserDb.delete({
        where: { op: '=', column: 'spaceId', value: spaceIdNew },
        limit: 1000,
        offset: 0,
      })

      const userIds =
        snapshot.type === 'initial' ? [] : Object.values(snapshot.type === 'started' ? snapshot.users : {})
      if (userIds.length > 0) {
        const toSpaceProjectionUserPrimaryKey = (spaceId: SpaceId, userId: UserId) => `${spaceId}-${userId}`
        const userEntities: SpaceProjectionUserEntity[] = userIds.map((userId) => ({
          id: toSpaceProjectionUserPrimaryKey(spaceIdNew, userId),
          spaceId: spaceIdNew,
          userId,
          updatedAt: now,
        }))
        await config.ctx.spaceProjectionUserDb.upsert({ entities: userEntities })
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

  const msgSpaceSub = ctx.topic.spaces_msg.subAll((c) => c)

  const spaceCache = new Map<SpaceId, Space>()

  const toSpaceProjectionUserPrimaryKey = (spaceId: SpaceId, userId: UserId) => `${spaceId}-${userId}`

  const upsertSpace = throttleByKey({
    behavior: 'use-latest',
    throttle: TimeSpan.seconds(3),
    keyFn: (spaceId, _space) => spaceId,
    fn: async (spaceId: SpaceId, space: Space) => {
      const now = UnixMs.now()
      const snapshot = EventSourced.toLatestSnapshot(space)

      // Upsert to space table
      const spaceEntity: SpaceEntity = {
        id: spaceId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        space,
      }
      await ctx.spaceDb.upsert({ entities: [spaceEntity] })

      // Upsert to projection table
      const projectionEntity: SpaceProjectionEntity = {
        id: spaceId,
        hostId: snapshot.type === 'initial' ? null : snapshot.hostId,
        gameId:
          snapshot.type === 'initial' ? null : snapshot.type === 'started' && snapshot.game ? snapshot.game.t : null,
        type: snapshot.type,
        updatedAt: now,
      }
      await ctx.spaceProjectionDb.upsert({ entities: [projectionEntity] })

      // Update projection_user table
      await ctx.spaceProjectionUserDb.delete({
        where: { op: '=', column: 'spaceId', value: spaceId },
        limit: 1000,
        offset: 0,
      })

      const userIds =
        snapshot.type === 'initial' ? [] : Object.values(snapshot.type === 'started' ? snapshot.users : {})
      if (userIds.length > 0) {
        const userEntities: SpaceProjectionUserEntity[] = userIds.map((userId) => ({
          id: toSpaceProjectionUserPrimaryKey(spaceId, userId),
          spaceId,
          userId,
          updatedAt: now,
        }))
        await ctx.spaceProjectionUserDb.upsert({ entities: userEntities })
      }
    },
  })

  Sub.takeEvery(s, msgSpaceSub, async (msgSpace) => {
    if (!spaceCache.has(msgSpace.spaceId)) {
      const got = await ctx.spaceDb.query({
        where: {
          op: '=',
          column: 'id',
          value: msgSpace.spaceId,
        },
        limit: 1,
        offset: 0,
      })

      if (isErr(got)) return

      const spaceEntity = got.value.entities.items[0]
      spaceCache.set(msgSpace.spaceId, spaceEntity?.space ?? Space.init)
    }

    const space = spaceCache.get(msgSpace.spaceId) ?? Space.init

    const spaceNew = Space.append(space, msgSpace)

    spaceCache.set(msgSpace.spaceId, spaceNew)

    upsertSpace(msgSpace.spaceId, spaceNew)
  })
}

export const SyncBackend = {
  rpc,
  worker,
}
