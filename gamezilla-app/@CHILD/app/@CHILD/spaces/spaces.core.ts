import { Profile, SpaceId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { RequestResponse } from "gamezilla-app/@SHARED/core"
import { AppClientModule } from "../../@SHARED/architecture/app-client"
import { AppServerModule } from "../../@SHARED/architecture/app-server"
import {
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  ClientEvent,
} from "../../@SHARED/client"
import { ServerCmd, ServerCtx, ServerEvent } from "../../@SHARED/server"
import * as Game from "./@CHILD/game/game.core"
import { WithEventId, WithEventMeta } from "./@SHARED/event"
import * as Space from "./spaces-core/space"
import { SpaceEvent } from "./spaces-core/space-event"
import * as Spaces from "./spaces-core/spaces"

//
//
//
//
//
//
//
//

export type ClientModule = AppClientModule<{
  ModelLocation: ModelLocation
  Ctx: AnonymousClientCtx | ClientCtx
  MsgInCmd: never
  MsgInEvent: ClientEvent
  Model: ModelClient
  Msg: MsgClient
  MsgOutCmd: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
  MsgOutEvent: ClientEvent
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ViewSlot: {
    bottomBar: null
  }
}>

export type ServerModule = AppServerModule<{
  Ctx: ServerCtx
  MsgInCmd: null
  MsgInEvent: ServerEvent
  Model: ModelServer
  Msg: MsgServer
  MsgOutCmd: ServerCmd<MsgToClient>
  MsgOutEvent: null
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Deps: ServerDeps
}>

export type ServerDeps = {}

//
//
//
// Model
//
//
//

export type ModelServer = Spaces.Model & {
  games: {
    [spaceId: SpaceId]: Game.ModelServer
  }
  profileCache: {
    [userId: UserId]: Profile
  }
}

export type ModelClient = Spaces.Model & {
  games: {
    [spaceId: SpaceId]: Game.ModelClient
  }
  modalPreviewUserId: UserId | null
  modal: null | "user-preview" | "users"
  listSpacesRequest: RequestResponse<string, null>
}

export type ModelLocation = {
  filters: {
    limit: number
    offset: number
  }
  screen:
    | {
        t: "list"
      }
    | {
        t: "space"
        spaceId: SpaceId
      }
}

export const initLocation: ModelLocation = {
  filters: {
    limit: 100,
    offset: 0,
  },
  screen: {
    t: "list",
  },
}

//
//
//
// Msg
//
//
//

export type MsgServer =
  | { t: "event"; c: WithEventId<SpaceEvent> }
  | { t: "game"; spaceId: SpaceId; c: Game.MsgServer }

export type MsgClient =
  | { t: "game"; spaceId: SpaceId; c: Game.MsgClient }
  | { t: "time-passed" }
  | { t: "clicked-go-home-button" }
  | { t: "clicked-game-tile"; gameName: Game.GameName }
  | { t: "clicked-join-space-button"; spaceId: SpaceId }
  | { t: "clicked-end-space-button" }
  | { t: "clicked-leave-space-button" }
  | { t: "clicked-start-space-button"; spaceId: SpaceId }
  | { t: "closed-modal" }
  | { t: "clicked-people-button" }
  | { t: "clicked-space-card"; spaceId: SpaceId }
  | { t: "clicked-user"; userId: UserId }
  | { t: "clicked-preview-user-link" }
  | { t: "clicked-current-space-bottom-bar" }

export type MsgToClient = MsgToClientExtra &
  (
    | {
        t: "event"
        c: WithEventMeta<SpaceEvent>
      }
    | {
        t: "listed-spaces"
        spaces: Space.Model[]
      }
    | {
        t: "synced"
        space: Space.Model
      }
    | {
        t: "current-user-space"
        space: Space.Model
      }
    | {
        t: "game"
        spaceId: SpaceId
        c: Game.MsgToClient
      }
  )

export type MsgToServer = MsgToServerExtra &
  (
    | {
        t: "event"
        c: WithEventMeta<SpaceEvent>
      }
    | {
        t: "sync"
        space: Space.Model
      }
    | {
        t: "list-spaces"
        limit: number
        offset: number
        where?: {
          spaceId?: SpaceId
        }
      }
    | {
        t: "game"
        spaceId: SpaceId
        c: Game.MsgToServer
      }
  )

export type MsgToClientExtra = {
  profiles?: { [userId: UserId]: Profile }
  causedBy?: unknown
  meta?: Record<string, unknown>
}

export type MsgToServerExtra = {
  profiles?: { [userId: UserId]: Profile }
  meta?: Record<string, unknown>
  causedBy?: unknown
}

//
//
//
//
//
//
//

export const spacesToProfiles = (
  model: ModelServer,
  spaces: Space.Model[],
): ModelServer["profileCache"] => {
  const profiles: ModelServer["profileCache"] = {}

  for (const space of spaces) {
    for (const userId of Space.toUserIds(space)) {
      const profile = model.profileCache[userId]
      if (profile) {
        profiles[userId] = profile
      }
    }
  }

  return profiles
}
