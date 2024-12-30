import { p } from '~/@/parser'
import type { UserId } from '~/app/@/data/user-id'
import { Space } from '~/app/spaces/@/space'
import * as GameGame from '../games/core'
import * as Game from '../games/types'
import { EventId, WithEventMeta } from '~/@/event-sourced/event'
import { SpaceEvent } from './space-event'

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

export const updateCore = (state: State, msgCore: WithEventMeta<SpaceEvent>): State => {
  switch (state.type) {
    case 'ended': {
      return state
    }

    case 'initial': {
      switch (msgCore.t) {
        case 'user-started-space': {
          return {
            type: 'started',
            game: null,
            hostId: msgCore.userId,
            latestEventId: msgCore.eventId,
            spaceId: msgCore.spaceId,
            users: {
              [msgCore.userId]: msgCore.userId
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
      switch (msgCore.t) {
        case 'game': {
          const game =
            state.game ??
            GameGame.initCore({
              gameName: msgCore.c.t,
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
              ...msgCore,
              ...msgCore.c
            }
          })
          return {
            ...state,
            latestEventId: msgCore.eventId,
            game: gameNew
          }
        }
        case 'user-ended-space': {
          if (msgCore.userId !== state.hostId) {
            return state
          }
          return {
            ...state,
            latestEventId: msgCore.eventId,
            type: 'ended'
          }
        }

        case 'user-inputted-game': {
          return {
            ...state,
            latestEventId: msgCore.eventId,
            game: msgCore.game ? GameGame.initCore({ gameName: msgCore.game, ctx: { space: state } }) : null
          }
        }

        case 'user-joined-space': {
          return {
            ...state,
            latestEventId: msgCore.eventId,
            users: {
              ...state.users,
              [msgCore.userId]: msgCore.userId
            }
          }
        }

        case 'user-left-space': {
          if (msgCore.userId === state.hostId) {
            return state
          }
          const usersNew = {
            ...state.users
          }
          delete usersNew[msgCore.userId]
          return {
            ...state,
            latestEventId: msgCore.eventId,
            users: usersNew
          }
        }

        case 'user-started-space': {
          return {
            ...state,
            latestEventId: msgCore.eventId
          }
        }
      }
    }
  }
}
