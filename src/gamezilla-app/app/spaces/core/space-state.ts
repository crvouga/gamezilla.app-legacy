import { p } from 'gamezilla-app/@/core/parser'
import type { UserId } from 'gamezilla-app/app/@/data'
import { Space } from 'gamezilla-app/app/spaces/@/space'
import { EventId, type EventMeta } from '../@/event'
import * as GameGame from '../games/game.core'
import * as Game from '../games/game.types'
import type { MsgCore } from './event'

//
//
//
//
//

export const Initial = p.obj({
  type: p.l('initial')
})
export type Initial = p.Infer<typeof Initial>

export const Started = p.and(
  Space,
  p.obj({
    type: p.l('started'),
    game: p.maybe(Game.ModelCore),
    latestEventId: EventId
  })
)
export type Started = p.Infer<typeof Started>

export const Ended = p.and(
  Space,
  p.obj({
    type: p.l('ended'),
    latestEventId: EventId
  })
)
export type Ended = p.Infer<typeof Ended>

const StateBase = p.obj({
  latestEventId: p.maybe(EventId)
})

export const State = p.and(StateBase, p.or(Initial, Started, Ended))
export type State = p.Infer<typeof State>

export const init: State = {
  type: 'initial',
  latestEventId: null
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

export const updateCore = ({ state, msgSpace }: { state: State; msgSpace: MsgCore & EventMeta }): State => {
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
              [msgSpace.userId]: msgSpace.userId
            },
            visibility: 'public'
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
            GameGame.initCore({
              gameName: msgSpace.c.t,
              ctx: {
                space: state
              }
            })
          const gameNew = GameGame.updateCore({
            ctx: {
              space: state
            },
            modelCore: game,
            msgCore: {
              ...msgSpace,
              ...msgSpace.c
            }
          })
          return {
            ...state,
            latestEventId: msgSpace.eventId,
            game: gameNew
          }
        }
        case 'user-ended-space': {
          if (msgSpace.userId !== state.hostId) {
            return state
          }
          return {
            ...state,
            latestEventId: msgSpace.eventId,
            type: 'ended'
          }
        }

        case 'user-inputted-game': {
          return {
            ...state,
            latestEventId: msgSpace.eventId,
            game: msgSpace.game ? GameGame.initCore({ gameName: msgSpace.game, ctx: { space: state } }) : null
          }
        }

        case 'user-joined-space': {
          return {
            ...state,
            latestEventId: msgSpace.eventId,
            users: {
              ...state.users,
              [msgSpace.userId]: msgSpace.userId
            }
          }
        }

        case 'user-left-space': {
          if (msgSpace.userId === state.hostId) {
            return state
          }
          const usersNew = {
            ...state.users
          }
          delete usersNew[msgSpace.userId]
          return {
            ...state,
            latestEventId: msgSpace.eventId,
            users: usersNew
          }
        }

        case 'user-started-space': {
          return {
            ...state,
            latestEventId: msgSpace.eventId
          }
        }
      }
    }
  }
}
