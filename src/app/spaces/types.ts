import type { WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { Pagination } from '~/@/query/query'
import { RequestResponse } from '~/@/request-response/request-response'
import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { BackendCmd } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendEvt } from '~/app/@/backend/evt'
import { UserAccount } from '~/app/@/data/account'
import { Profile } from '~/app/@/data/profile'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx } from '~/app/@/frontend/ctx'
import { FrontendEvt } from '~/app/@/frontend/evt'
import { ScreenActionsProps } from '../@/ui/screen/screen-layout'
import { SpaceFrontendCmd } from './@/frontend/cmd'
import { SpacesCore } from './core/core'
import { ISpacesCoreAsync } from './core/core-async/interface'
import { Space } from './core/space'
import { MsgSpace } from './core/space-msg'
import { GamesTypes } from './game/games'
import { GameName } from './game/games/@/game-name'

//
//
//
// Model
//
//
//

export type BackendCtx = AppBackendCtx & {
  spacesCore: ISpacesCoreAsync
  games: GamesTypes.GameBackendCtx
}

export type ModelBackend = null

export type ModelFrontend = SpacesCore.Model & {
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
  | { t: 'got-msg-space'; c: WithEventId<MsgSpace> }
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
        c: WithEventMeta<MsgSpace>
      }
    | {
        t: 'listed-spaces'
        spaces: Space.Model[]
      }
    | {
        t: 'synced'
        space: Space.Model
      }
    | {
        t: 'current-user-space'
        space: Space.Model
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
        c: WithEventMeta<MsgSpace>
      }
    | {
        t: 'sync'
        space: Space.Model
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

type SpaceFrontendCtx = (AnonymousFrontendCtx | AppFrontendCtx) & {
  parentScreenActions?: ScreenActionsProps | null
}

export type FrontendModule = AppFrontendModule<{
  Ctx: SpaceFrontendCtx
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
