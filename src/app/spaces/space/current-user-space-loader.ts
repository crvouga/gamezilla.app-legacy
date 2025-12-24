import { IDb } from '~/@/db/interface'
import { Sub } from '~/@/sub'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { FrontendCtxModule, ModelFrontend, MsgFrontend } from '../types'
import { Space } from './space'
import { SpaceDbQueryCache } from './space-db-query-cache'
import { ISpaceDb } from './space-db/interface'

const toQuery = (currentUserId: UserId): IDb.InferQueryInput<typeof ISpaceDb.schema> => {
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
  return SpaceDbQueryCache.sub(
    input.ctx.spaceDb,
    toQuery(currentUserId),
    (c): MsgFrontend => ({ t: 'gotQueryCacheMsg', c }),
  )
}

const toCurrentUserSpace = (ctx: AppFrontendCtxBase): Space | null => {
  const currentUserId = ctx.currentUser?.userId
  if (!currentUserId) return null

  const query = toQuery(currentUserId)

  const space = SpaceDbQueryCache.read(ctx, query)[0]

  if (!space) return null

  return space
}

const toCurrentUserSpaceId = (ctx: AppFrontendCtxBase): SpaceId | null => {
  const space = toCurrentUserSpace(ctx)

  if (!space) return null

  return Space.toSpaceId(space)
}

export const CurrentUserSpaceLoader = {
  subscriptions,
  toCurrentUserSpace,
  toCurrentUserSpaceId,
}
