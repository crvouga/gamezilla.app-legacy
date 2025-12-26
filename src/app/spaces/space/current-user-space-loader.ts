import { QueryInput } from '~/@/db/interface/query-input/query-input'
import { Sub } from '~/@/sub'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import type { MsgFrontend } from '../types'
import type { FrontendCtxModule, ModelFrontend } from '../base-types'
import { Space } from './space'
import { SpaceDbQueryCache, SpaceProjectionDbQueryCache } from './space-db'
import { SpaceProjectionEntity } from './space-db/space-projection-entity'

const toQuery = (currentUserId: UserId): QueryInput<SpaceProjectionEntity> => {
  return {
    where: {
      op: 'and',
      clauses: [
        { op: '=', column: 'hostId', value: currentUserId },
        { op: '=', column: 'type', value: 'started' },
      ],
    },
  }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  const currentUserId = input.ctx.currentUser?.userId
  if (!currentUserId) return Sub.none()
  return SpaceProjectionDbQueryCache.subscribe(
    input.ctx.spaceProjectionDb,
    toQuery(currentUserId),
    (c): MsgFrontend => {
      const msg =
        c.t === 'gotEntity'
          ? {
              t: 'gotEntity' as const,
              id: c.id,
              entityType: c.entityType,
              entity: c.entity,
              lastUpdatedAtKey: c.lastUpdatedAtKey,
            }
          : c
      return { t: 'gotQueryCacheMsg', c: GotQueryCacheMsg.init(msg) }
    },
  )
}

const toCurrentUserSpace = (ctx: AppFrontendCtxBase & Partial<FrontendCtxModule>): Space | null => {
  const currentUserId = ctx.currentUser?.userId
  if (!currentUserId) return null

  // Check if ctx has the required properties
  if (!('spaceProjectionDb' in ctx) || !('queryCache' in ctx)) {
    return null
  }

  const query = toQuery(currentUserId)
  const projections = SpaceProjectionDbQueryCache.query(ctx as FrontendCtxModule, query)

  if (projections.length === 0) return null

  const spaceId = projections[0]?.id
  if (!spaceId) return null

  const space = SpaceDbQueryCache.entity(ctx as FrontendCtxModule, spaceId)

  if (!space) return null

  return space
}

const toCurrentUserSpaceId = (ctx: AppFrontendCtxBase & Partial<FrontendCtxModule>): SpaceId | null => {
  const space = toCurrentUserSpace(ctx)

  if (!space) return null

  return Space.toSpaceId(space)
}

export const CurrentUserSpaceLoader = {
  subscriptions,
  toCurrentUserSpace,
  toCurrentUserSpaceId,
}
