import { Profile, SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { RequestResponse } from "gamezilla/@SHARED/core"
import { AppClientModule } from "../../@SHARED/architecture/app-client"
import { AppServerModule } from "../../@SHARED/architecture/app-server"
import {
  AnonymousClientCtx,
  AppRoute,
  ClientCmd,
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
  Ctx: AnonymousClientCtx
  MsgInCmd: never
  MsgInEvent: ClientEvent
  Model: ModelClient
  Msg: MsgClient
  MsgOutCmd: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
  MsgOutEvent: ClientEvent
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
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
}>

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
  | { t: "clicked-game-tile"; gameName: Game.GameName }
  | { t: "clicked-join-space-button"; spaceId: SpaceId }
  | { t: "clicked-end-space-button" }
  | { t: "clicked-leave-space-button" }
  | { t: "clicked-start-space-button"; spaceId: SpaceId }
  | { t: "closed-modal" }
  | { t: "clicked-people-button" }
  | { t: "clicked-back-button"; from: "join-screen" }
  | { t: "clicked-space-card"; spaceId: SpaceId }
  | { t: "clicked-user"; userId: UserId }
  | { t: "clicked-link"; route: AppRoute }

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
