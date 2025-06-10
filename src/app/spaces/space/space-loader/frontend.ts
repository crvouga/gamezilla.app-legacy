import { EventSourced } from '~/@/event-sourced'
import { Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { SpaceId } from '~/app/@/data/space-id'
import { SpaceFrontendModule } from '../../frontend/space-frontend'
import { Space } from '../space'
import { ISpaceDb } from '../space/space-db/interface'
import { Spaces } from '../spaces'
import { MsgFrontend } from './types'

const persistSpace = async (
  spaceDb: ISpaceDb,
  spaceId: SpaceId,
  space: Space.Model,
  dispatch: (m: MsgFrontend) => void,
) => {
  const spaceNew = EventSourced.startFromLatestSnapshot(space)
  const upserted = await spaceDb.upsert(spaceNew)
  dispatch({ t: 'space-loader.upserted', spaceId, upserted })
}

const persistSpaceThrottled = throttleByKey({
  fn: persistSpace,
  keyFn: (_spaceDb, spaceId, _space, _dispatch) => spaceId,
  throttle: TimeSpan.seconds(1),
  behavior: 'use-latest',
})

const update: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-ended-space':
    case 'user-inputted-game':
    case 'user-joined-space':
    case 'user-left-space':
    case 'user-started-space': {
      const spaceId = input.msgSpace.spaceId
      const space = Spaces.toSpace(input.model.spaces, spaceId)
      if (!space) return { model: input.model }
      return {
        model: input.model,
        async eff(dispatch) {
          persistSpace(input.ctx.spaceDb, spaceId, space, dispatch)
        },
      }
    }
    case 'game': {
      const spaceId = input.msgSpace.spaceId
      const space = Spaces.toSpace(input.model.spaces, spaceId)
      if (!space) return { model: input.model }
      return {
        model: input.model,
        async eff(dispatch) {
          persistSpaceThrottled(input.ctx.spaceDb, spaceId, space, dispatch)
        },
      }
    }
  }

  switch (input.msg?.t) {
    case 'space-loader.got-spaces': {
      const spacesNew = Spaces.merge(input.model.spaces, input.msg.spaces)
      return {
        model: {
          ...input.model,
          spaces: spacesNew,
        },
      }
    }
  }

  return { model: input.model }
}

const subscriptions: SpaceFrontendModule['subscriptions'] = (input) => {
  const currentUserId = input.ctx.currentUser?.userId

  if (!currentUserId) return Sub.none()

  return Sub.batch<MsgFrontend>([
    input.ctx.spaceDb.sub(
      {
        where: {
          hostId: {
            '=': currentUserId,
          },
        },
      },
      (spaces) => ({
        t: 'space-loader.got-spaces',
        spaces,
      }),
    ),
  ])
}

export const SpaceLoaderFrontend = {
  update,
  subscriptions,
}
