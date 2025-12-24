import { Eff } from '~/@/eff'
import { EventSourced } from '~/@/event-sourced'
import { WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { isErr, Result } from '~/@/result'
import { RPCError } from '~/@/rpc/error'
import { Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { andThen } from '~/app/@/frontend/and-then'
import { queryCacheMsgs } from '~/app/frontend/query-cache/query-cache-msgs'
import { UnixMs } from '~/@/time/unix-ms'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace, spaceMsgs } from '../space/msg-space'
import { Space } from '../space/space'
import { SpaceDbQueryCache, SpaceProjectionDbQueryCache, SpaceProjectionUserDbQueryCache } from '../space/space-db'
import { SpaceEntity } from '../space/space-db/space-entity'
import { SpaceProjectionEntity } from '../space/space-db/space-projection-entity'
import { SpaceProjectionUserEntity } from '../space/space-db/space-projection-user-entity'
import { FrontendCtxModule, ModelFrontend } from '../types'

export type Msg =
  | {
      t: 'sync_gotMsgSpaceFromBackend'
      c: WithEventMeta<MsgSpace>
    }
  | {
      t: 'sync_gotMsgSpaceFromFrontend'
      c: WithEventId<MsgSpace>
    }
  | {
      t: 'sync_synced'
      synced: Result<RPCError, { space: Space }>
    }

export const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: Msg
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  switch (input.msg?.t) {
    case 'sync_gotMsgSpaceFromBackend': {
      const msgSpace = input.msg.c
      return {
        model: input.model,
        eff: () => {
          spaceMsgs.pub(msgSpace)
        },
      }
    }
    case 'sync_gotMsgSpaceFromFrontend': {
      const msgSpace = input.msg.c
      return andThen(
        input,
        (model) => updateSendToBackend({ ...input, model, msgSpace }),
        (model) => updatePersist({ ...input, model, msgSpace }),
      )
    }
    case 'sync_synced': {
      return {
        model: {
          ...input.model,
        },
      }
    }
  }
}

const updateSendToBackend = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msgSpace: WithEventId<MsgSpace>
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  const msgSpace = input.msgSpace

  if (!msgSpace) return { model: input.model }

  const spaceEntity = SpaceDbQueryCache.toEntity(input.ctx, msgSpace.spaceId)

  if (!spaceEntity) return { model: input.model }

  const space = spaceEntity.space

  const spaceEventWithMeta = Space.toSpaceEventWithMeta(space, msgSpace.eventId)

  if (!spaceEventWithMeta) return { model: input.model }

  return {
    model: input.model,
    eff() {
      input.ctx.topic.spaces_msg.pub(spaceEventWithMeta.spaceId, spaceEventWithMeta)
    },
  }
}

const updatePersist = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msgSpace: WithEventId<MsgSpace>
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  const msgSpace = input.msgSpace

  const spaceEntity = SpaceDbQueryCache.toEntity(input.ctx, msgSpace.spaceId)
  const space = spaceEntity?.space ?? Space.init

  const spaceNew = Space.append(space, msgSpace)

  const spaceId = Space.toSpaceId(spaceNew)
  if (!spaceId) return { model: input.model }

  const spaceProjection = Space.toSpaceProjection(spaceNew)
  const now = UnixMs.now()

  return {
    model: input.model,
    eff: Eff.batch([
      () => {
        const spaceEntity: SpaceEntity = {
          id: spaceId,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          space: spaceNew,
        }
        const gotEntityMsg = SpaceDbQueryCache.gotEntity(spaceId, spaceEntity)
        queryCacheMsgs.pub(gotEntityMsg.c)
      },
      () => {
        const projectionEntity: SpaceProjectionEntity = {
          id: spaceId,
          hostId: spaceProjection.type === 'initial' ? null : spaceProjection.hostId,
          gameId:
            spaceProjection.type === 'initial'
              ? null
              : spaceProjection.type === 'started' && spaceProjection.game
                ? spaceProjection.game.t
                : null,
          type: spaceProjection.type,
          updatedAt: now,
        }
        const gotEntityMsg = SpaceProjectionDbQueryCache.gotEntity(spaceId, projectionEntity)
        queryCacheMsgs.pub(gotEntityMsg.c)
      },
      () => {
        // Insert new entries
        const userIds =
          spaceProjection.type === 'initial'
            ? []
            : Object.values(spaceProjection.type === 'started' ? spaceProjection.users : {})
        for (const userId of userIds) {
          const userEntity: SpaceProjectionUserEntity = {
            id: `${spaceId}-${userId}`,
            spaceId,
            userId,
            updatedAt: now,
          }
          const gotEntityMsg = SpaceProjectionUserDbQueryCache.gotEntity(userEntity.id, userEntity)
          queryCacheMsgs.pub(gotEntityMsg.c)
        }
      },
      () => {
        persistSpace({ ctx: input.ctx, msgSpace, space: spaceNew })
      },
    ]),
  }
}

const persistSpace =
  (input: { ctx: FrontendCtxModule; msgSpace: WithEventId<MsgSpace>; space: Space }): Eff =>
  () => {
    const { ctx, msgSpace, space } = input
    switch (msgSpace.t) {
      case 'game': {
        upsertSpaceThrottled(ctx, msgSpace.spaceId, space)
        return
      }
      default: {
        upsertSpace(ctx, msgSpace.spaceId, space)
        return
      }
    }
  }

const toSpaceProjectionUserPrimaryKey = (spaceId: SpaceId, userId: UserId) => `${spaceId}-${userId}`

const upsertSpace = async (ctx: FrontendCtxModule, spaceId: SpaceId, space: Space) => {
  const snapshot = EventSourced.toLatestSnapshot(space)
  const now = UnixMs.now()

  // Upsert to space table
  const spaceEntity: SpaceEntity = {
    id: spaceId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    space,
  }
  const spaceResult = await ctx.spaceDb.upsert({ entities: [spaceEntity] })
  if (isErr(spaceResult)) return

  // Upsert to projection table
  const projectionEntity: SpaceProjectionEntity = {
    id: spaceId,
    hostId: snapshot.type === 'initial' ? null : snapshot.hostId,
    gameId: snapshot.type === 'initial' ? null : snapshot.type === 'started' && snapshot.game ? snapshot.game.t : null,
    type: snapshot.type,
    updatedAt: now,
  }
  const projectionResult = await ctx.spaceProjectionDb.upsert({ entities: [projectionEntity] })
  if (isErr(projectionResult)) return

  // Update projection_user table
  // First delete existing entries for this space
  await ctx.spaceProjectionUserDb.delete({
    where: { op: '=', column: 'spaceId', value: spaceId },
    limit: 1000,
    offset: 0,
  })

  // Then insert new entries
  const userIds = snapshot.type === 'initial' ? [] : Object.values(snapshot.type === 'started' ? snapshot.users : {})
  if (userIds.length > 0) {
    const userEntities: SpaceProjectionUserEntity[] = userIds.map((userId) => ({
      id: toSpaceProjectionUserPrimaryKey(spaceId, userId),
      spaceId,
      userId,
      updatedAt: now,
    }))

    const userResult = await ctx.spaceProjectionUserDb.upsert({ entities: userEntities })
    if (isErr(userResult)) return
  }
}

const upsertSpaceThrottled = throttleByKey({
  fn: upsertSpace,
  keyFn: (_ctx, spaceId, _space) => spaceId,
  throttle: TimeSpan.seconds(3),
  behavior: 'use-latest',
})

export const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<Msg> => {
  return Sub.batch([subscriptionsMsgSpaceFromFrontend(input), subscriptionsMsgSpaceFromBackend(input)])
}

const subscriptionsMsgSpaceFromFrontend = (_input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<Msg> => {
  return Sub.map(spaceMsgs, (c) => ({ t: 'sync_gotMsgSpaceFromFrontend', c }))
}

const subscriptionsMsgSpaceFromBackend = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<Msg> => {
  const currentUserSpaceId = CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)

  if (!currentUserSpaceId) return Sub.none()

  return input.ctx.topic.spaces_msg.sub(currentUserSpaceId, (c) => ({ t: 'sync_gotMsgSpaceFromFrontend', c }))
}
