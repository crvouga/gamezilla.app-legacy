import { Space } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { p } from "gamezilla-app/@SHARED/parser"
import * as Game from "../@CHILD/game/game.core"
import { EventId, EventMeta } from "../@SHARED/event"
import { SpaceEvent } from "./space-event"

//
//
//
//
//

export const Initial = p.obj({
  type: p.l("initial"),
})
export type Initial = p.Infer<typeof Initial>

export const Started = p.and(
  Space,
  p.obj({
    type: p.l("started"),
    game: p.maybe(Game.ModelSync),
    latestEvent: EventId,
  }),
)
export type Started = p.Infer<typeof Started>

export const Ended = p.and(
  Space,
  p.obj({
    type: p.l("ended"),
    latestEvent: EventId,
  }),
)
export type Ended = p.Infer<typeof Ended>

export const State = p.or(Initial, Started, Ended)
export type State = p.Infer<typeof State>

export const init: State = {
  type: "initial",
}

//
//
//
//
//

export const toUserIds = (state: State): UserId[] => {
  switch (state.type) {
    case "initial":
    case "ended": {
      return []
    }

    case "started": {
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

export const reducer = ({
  state,
  msgSpace,
}: {
  state: State
  msgSpace: SpaceEvent & EventMeta
}): State => {
  switch (state.type) {
    case "ended": {
      return state
    }

    case "initial": {
      switch (msgSpace.t) {
        case "user-started-space": {
          return {
            type: "started",
            game: null,
            hostId: msgSpace.userId,
            latestEvent: msgSpace.eventId,
            spaceId: msgSpace.spaceId,
            users: {
              [msgSpace.userId]: msgSpace.userId,
            },
            visibility: "public",
          }
        }
        default: {
          return state
        }
      }
    }

    case "started": {
      switch (msgSpace.t) {
        case "game": {
          const game = state.game ?? Game.initSync(msgSpace.c.t)
          const gameNew = Game.reducer({
            ctx: { space: state },
            modelSync: game,
            msgSync: { ...msgSpace, ...msgSpace.c },
          })
          return {
            ...state,
            latestEvent: msgSpace.eventId,
            game: gameNew,
          }
        }
        case "user-ended-space": {
          if (msgSpace.userId !== state.hostId) {
            return state
          }
          return {
            ...state,
            latestEvent: msgSpace.eventId,
            type: "ended",
          }
        }

        case "user-inputted-game": {
          return {
            ...state,
            latestEvent: msgSpace.eventId,
            game: msgSpace.game ? Game.initSync(msgSpace.game) : null,
          }
        }

        case "user-joined-space": {
          return {
            ...state,
            latestEvent: msgSpace.eventId,
            users: {
              ...state.users,
              [msgSpace.userId]: msgSpace.userId,
            },
          }
        }

        case "user-left-space": {
          if (msgSpace.userId === state.hostId) {
            return state
          }
          const usersNew = { ...state.users }
          delete usersNew[msgSpace.userId]
          return {
            ...state,
            latestEvent: msgSpace.eventId,
            users: usersNew,
          }
        }

        case "user-started-space": {
          return { ...state, latestEvent: msgSpace.eventId }
        }
      }
    }
  }
}
