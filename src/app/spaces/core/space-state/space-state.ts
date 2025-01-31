import { EventId, WithEventMeta } from '~/@/event-sourced/event'
import { p } from '~/@/parser'
import type { UserId } from '~/app/@/data/user-id'
import { Space } from '~/app/spaces/@/space/space'
import * as GameSpace from '../../game/games/space'
import * as Game from '../../game/games/types'
import { MsgSpace } from '../space/space'

//
//
//
//
//

export const Initial = p.obj({
  type: p.l('initial'),
})
export type Initial = p.Infer<typeof Initial>

export const Started = p.and(
  Space,
  p.obj({
    type: p.l('started'),
    game: p.maybe(Game.ModelSpace),
    latestEventId: EventId,
  }),
)
export type Started = p.Infer<typeof Started>

export const Ended = p.and(
  Space,
  p.obj({
    type: p.l('ended'),
    latestEventId: EventId,
  }),
)
export type Ended = p.Infer<typeof Ended>

const StateBase = p.obj({
  latestEventId: p.maybe(EventId),
})

export const State = p.and(StateBase, p.or(Initial, Started, Ended))
export type State = p.Infer<typeof State>

export const init: State = {
  type: 'initial',
  latestEventId: null,
}

//
//
//
//
//

export const toUserIds = (state: State): UserId[] => {
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

export const updateSpace = (state: State, msgSpace: WithEventMeta<MsgSpace>): State => {
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
