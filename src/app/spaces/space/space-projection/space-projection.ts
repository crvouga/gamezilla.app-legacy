import { EventId, WithEventMeta } from '~/@/event-sourced/event'
import { s } from '~/@/schema'
import type { UserId } from '~/app/@/data/user-id'
import { Space } from '~/app/spaces/@/space/space'
import * as GameSpace from '../../game/games/space'
import * as Game from '../../game/games/types'
import { MsgSpace } from '../msg-space'

//
//
//
//
//

export const Initial = s.obj({
  type: s.l('initial'),
})
export type Initial = s.Infer<typeof Initial>

export const Started = s.and(
  Space,
  s.obj({
    type: s.l('started'),
    game: s.maybe(Game.ModelSpace),
    latestEventId: EventId,
  }),
)
export type Started = s.Infer<typeof Started>

export const Ended = s.and(
  Space,
  s.obj({
    type: s.l('ended'),
    latestEventId: EventId,
  }),
)
export type Ended = s.Infer<typeof Ended>

const StateBase = s.obj({
  latestEventId: s.maybe(EventId),
})

export const Model = s.and(StateBase, s.or(Initial, Started, Ended))
export type Model = s.Infer<typeof Model>

export const init: Model = {
  type: 'initial',
  latestEventId: null,
}

//
//
//
//
//

export const toUserIds = (state: Model): UserId[] => {
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

export const updateSpace = (state: Model, msgSpace: WithEventMeta<MsgSpace>): Model => {
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
