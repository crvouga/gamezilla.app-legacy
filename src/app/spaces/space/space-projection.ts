import { EventId, WithEventMeta } from '~/@/event-sourced/event'
import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import * as GameSpace from '../game/games/space'
import * as Game from '../game/games/types'
import { MsgSpace } from './msg-space'

//
//
//
//
//

export const SpaceProjectionInitial = s.obj({
  type: s.l('initial'),
  latestEventId: s.maybe(EventId),
})
export type SpaceProjectionInitial = s.Infer<typeof SpaceProjectionInitial>

export const SpaceProjectionStarted = s.obj({
  type: s.l('started'),
  game: s.maybe(Game.ModelSpace),
  latestEventId: EventId,
  visibility: s.enumeration(['public', 'private']),
  spaceId: SpaceId,
  hostId: UserId,
  users: s.dict(UserId, UserId),
})
export type SpaceProjectionStarted = s.Infer<typeof SpaceProjectionStarted>

export const SpaceProjectionEnded = s.obj({
  type: s.l('ended'),
  latestEventId: EventId,
  game: s.maybe(Game.ModelSpace),
  visibility: s.enumeration(['public', 'private']),
  spaceId: SpaceId,
  hostId: UserId,
  users: s.dict(UserId, UserId),
})
export type SpaceProjectionEnded = s.Infer<typeof SpaceProjectionEnded>

const schema = s.or(SpaceProjectionInitial, SpaceProjectionStarted, SpaceProjectionEnded)
export type SpaceProjection = s.Infer<typeof schema>

const init: SpaceProjection = {
  type: 'initial',
  latestEventId: null,
}

//
//
//
//
//

const toUserIds = (state: SpaceProjection): UserId[] => {
  switch (state.type) {
    case 'initial':
    case 'ended': {
      return []
    }

    case 'started': {
      return Object.values(state.users)
    }
  }
}

//
//
//
//
//
//

const updateSpace = (state: SpaceProjection, msgSpace: WithEventMeta<MsgSpace>): SpaceProjection => {
  switch (state.type) {
    case 'ended': {
      return state
    }

    case 'initial': {
      switch (msgSpace.t) {
        case 'user-started-space': {
          return {
            type: 'started',
            game: null,
            hostId: msgSpace.userId,
            latestEventId: msgSpace.eventId,
            spaceId: msgSpace.spaceId,
            users: {
              [msgSpace.userId]: msgSpace.userId,
            },
            visibility: 'public',
          }
        }
        default: {
          return state
        }
      }
    }

    case 'started': {
      switch (msgSpace.t) {
        case 'game': {
          const game =
            state.game ??
            GameSpace.initSpace({
              gameName: msgSpace.c.t,
              ctx: {
                space: state,
              },
            })
          const gameNew = GameSpace.updateSpace({
            ctx: {
              space: state,
            },
            modelSpace: game,
            msgSpace: {
              ...msgSpace,
              ...msgSpace.c,
            },
          })
          return {
            ...state,
            latestEventId: msgSpace.eventId,
            game: gameNew,
          }
        }
        case 'user-ended-space': {
          if (msgSpace.userId !== state.hostId) {
            return state
          }
          return {
            ...state,
            latestEventId: msgSpace.eventId,
            type: 'ended',
          }
        }

        case 'user-inputted-game': {
          return {
            ...state,
            latestEventId: msgSpace.eventId,
            game: msgSpace.game ? GameSpace.initSpace({ gameName: msgSpace.game, ctx: { space: state } }) : null,
          }
        }

        case 'user-joined-space': {
          return {
            ...state,
            latestEventId: msgSpace.eventId,
            users: {
              ...state.users,
              [msgSpace.userId]: msgSpace.userId,
            },
          }
        }

        case 'user-left-space': {
          if (msgSpace.userId === state.hostId) {
            return state
          }
          const usersNew = {
            ...state.users,
          }
          delete usersNew[msgSpace.userId]
          return {
            ...state,
            latestEventId: msgSpace.eventId,
            users: usersNew,
          }
        }

        case 'user-started-space': {
          return {
            ...state,
            latestEventId: msgSpace.eventId,
          }
        }
      }
    }
  }
}

const random = (input?: { spaceId?: SpaceId; hostId?: UserId; guestIds?: UserId[] }): SpaceProjectionStarted => {
  return {
    type: 'started',
    game: null,
    latestEventId: EventId.generate(),
    visibility: 'public',
    spaceId: input?.spaceId ?? SpaceId.generate(),
    hostId: input?.hostId ?? UserId.generate(),
    users: {
      [input?.hostId ?? UserId.generate()]: input?.hostId ?? UserId.generate(),
    },
  }
}

export const SpaceProjection = {
  schema,
  init,
  updateSpace,
  toUserIds,
  random,
}
