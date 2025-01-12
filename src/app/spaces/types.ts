import type { WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { RequestResponse } from '~/@/request-response/request-response'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx } from '~/app/@/frontend/ctx'
import { FrontendEvt } from '~/app/@/frontend/evt'
import { UserAccount } from '~/app/@/data/account'
import { Profile } from '~/app/@/data/profile'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { BackendCmd } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendEvt } from '~/app/@/backend/evt'
import { SpacesSpaceFrontend } from './space/frontend'
import { ISpaceBackend } from './space/backend/interface'
import { SpaceSpace } from './space/space'
import { SpaceEvent } from './space/space-event'
import { GamesTypes } from './game/games'
import { GameName } from './game/games/@/game-name'
import { SpaceFrontendCmd } from './@/space-frontend/cmd'
import { Pagination } from '~/@/query/query'

//
//
//
// Model
//
//
//

export type BackendCtx = AppBackendCtx & {
  spaceBackend: ISpaceBackend
  games: GamesTypes.GameBackendCtx
}

export type ModelBackend = null

export type ModelFrontend = SpacesSpaceFrontend.Model & {
  games: {
    [spaceId: SpaceId]: GamesTypes.ModelFrontend
  }
  modalPreviewUserId: UserId | null
  modal: null | 'user-preview' | 'users'
  listSpacesRequest: RequestResponse<string, null>
}

//
//
//
// Msg
//
//
//

export type MsgBackend =
  | { t: 'got-msg-space'; c: WithEventId<SpaceEvent> }
  | { t: 'game'; spaceId: SpaceId; c: GamesTypes.MsgBackend }

export type MsgFrontend =
  | { t: 'game'; spaceId: SpaceId; c: GamesTypes.MsgFrontend }
  | { t: 'time-passed' }
  | { t: 'clicked-go-home-button' }
  | { t: 'clicked-game-tile'; gameName: GameName }
  | { t: 'clicked-join-space-button'; spaceId: SpaceId }
  | { t: 'clicked-end-space-button'; spaceId: SpaceId }
  | { t: 'clicked-leave-space-button'; spaceId: SpaceId }
  | { t: 'clicked-start-space-button'; spaceId: SpaceId }
  | { t: 'closed-modal' }
  | { t: 'clicked-people-button' }
  | { t: 'clicked-space-card'; spaceId: SpaceId }
  | { t: 'clicked-user'; userId: UserId }
  | { t: 'clicked-preview-user-link' }
  | { t: 'clicked-current-space-bottom-bar' }

export type MsgToFrontend = MsgToFrontendExtra &
  (
    | {
        t: 'got-msg-space'
        c: WithEventMeta<SpaceEvent>
      }
    | {
        t: 'listed-spaces'
        spaces: SpaceSpace.Model[]
      }
    | {
        t: 'synced'
        space: SpaceSpace.Model
      }
    | {
        t: 'current-user-space'
        space: SpaceSpace.Model
        currentUser: UserAccount
      }
    | {
        t: 'game'
        spaceId: SpaceId
        c: GamesTypes.MsgToFrontend
      }
  )

export type MsgToBackend = MsgToBackendExtra &
  (
    | {
        t: 'got-msg-space'
        c: WithEventMeta<SpaceEvent>
      }
    | {
        t: 'sync'
        space: SpaceSpace.Model
      }
    | {
        t: 'list-spaces'
        pagination: Pagination
        where?: {
          spaceId?: SpaceId
        }
      }
    | {
        t: 'game'
        spaceId: SpaceId
        c: GamesTypes.MsgToBackend
      }
  )

export type MsgToFrontendExtra = {
  profiles?: { [userId: UserId]: Profile }
  causedBy?: unknown
  meta?: Record<string, unknown>
}

export type MsgToBackendExtra = {
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
//

export type FrontendModule = AppFrontendModule<{
  Ctx: AnonymousFrontendCtx | AppFrontendCtx
  MsgCmdIn: SpaceFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>
  MsgEvtIn: FrontendEvt
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgCmdOut: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>
  MsgEvtOut: FrontendEvt
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  ViewSlot: {
    bottomBar: null
  }
}>

export type BackendModule = AppBackendModule<{
  Ctx: BackendCtx
  MsgCmdIn: null
  MsgEvtIn: BackendEvt
  Model: ModelBackend
  Msg: MsgBackend
  MsgCmdOut: BackendCmd<MsgToFrontend>
  MsgEvtOut: null
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Deps: null
}>
