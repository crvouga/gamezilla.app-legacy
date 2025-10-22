import { Eff } from '~/@/eff'
import { EventSourced } from '~/@/event-sourced'
import { WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { Result } from '~/@/result'
import { RPCError } from '~/@/rpc/error'
import { Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { SpaceId } from '~/app/@/data/space-id'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { GotSpaceMsg } from '../@/got-space-msg.$msg'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace, spaceMsgs } from '../space/msg-space'
import { Space } from '../space/space'
import { ISpaceDb } from '../space/space-db'
import { SpaceDbQueryCache } from '../space/space-db-query-cache'
import { FrontendCtxModule, ModelFrontend } from '../types'
import { queryCacheMsgs } from '~/app/frontend/query-cache/query-cache-msgs'

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

  const space = SpaceDbQueryCache.entity(input.ctx, msgSpace.spaceId)

  if (!space) return { model: input.model }

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

  const space = SpaceDbQueryCache.entity(input.ctx, msgSpace.spaceId) ?? Space.init

  const spaceNew = Space.append(space, msgSpace)

  return {
    model: input.model,
    eff: Eff.batch([
      () =>
        queryCacheMsgs.pub({
          t: 'got-entity',
          id: msgSpace.spaceId,
          entityType: 'space',
          entity: spaceNew,
          lastUpdatedAtKey: Space.key('lastUpdatedAt'),
        }),
      () => {
        switch (msgSpace.t) {
          case 'game': {
            upsertSpaceThrottled(input.ctx.spaceDb, msgSpace.spaceId, spaceNew)
            return
          }
          default: {
            upsertSpace(input.ctx.spaceDb, msgSpace.spaceId, spaceNew)
            return
          }
        }
      },
    ]),
  }
}

const upsertSpace = async (spaceDb: ISpaceDb, _spaceId: SpaceId, space: Space) => {
  await spaceDb.upsert(EventSourced.startFromLatestSnapshot(space))
}

const upsertSpaceThrottled = throttleByKey({
  fn: upsertSpace,
  keyFn: (_spaceDb, spaceId, _space) => spaceId,
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
