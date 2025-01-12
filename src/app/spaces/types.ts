import type { WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { RequestResponse } from '~/@/request-response/request-response'
import type { AppClientModule } from '~/app/@/architecture/app-client'
import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import { AppClientCmd } from '~/app/@/client/cmd'
import { AnonymousClientCtx, AppClientCtx } from '~/app/@/client/ctx'
import { ClientEvt } from '~/app/@/client/evt'
import { UserAccount } from '~/app/@/data/account'
import { Profile } from '~/app/@/data/profile'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { BackendCmd } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendEvt } from '~/app/@/backend/evt'
import { SpacesCoreClient } from './core/client'
import { ISpacesCoreBackend } from './core/backend/interface'
import { SpaceCore } from './core/space-core'
import { SpaceEvent } from './core/space-event'
import { GamesTypes } from './game/games'
import { GameName } from './game/games/@/game-name'
import { SpaceClientCmd } from './@/space-client/cmd'

//
//
//
// Model
//
//
//

export type BackendCtx = AppBackendCtx & {
  spacesCoreBackend: ISpacesCoreBackend
  games: GamesTypes.GameBackendCtx
}

export type ModelBackend = null

export type ModelClient = SpacesCoreClient.Model & {
  games: {
    [spaceId: SpaceId]: GamesTypes.ModelClient
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
  | { t: 'got-msg-core'; c: WithEventId<SpaceEvent> }
  | { t: 'game'; spaceId: SpaceId; c: GamesTypes.MsgBackend }

export type MsgClient =
  | { t: 'game'; spaceId: SpaceId; c: GamesTypes.MsgClient }
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

export type MsgToClient = MsgToClientExtra &
  (
    | {
        t: 'got-msg-core'
        c: WithEventMeta<SpaceEvent>
      }
    | {
        t: 'listed-spaces'
        spaces: SpaceCore.Model[]
      }
    | {
        t: 'synced'
        space: SpaceCore.Model
      }
    | {
        t: 'current-user-space'
        space: SpaceCore.Model
        currentUser: UserAccount
      }
    | {
        t: 'game'
        spaceId: SpaceId
        c: GamesTypes.MsgToClient
      }
  )

export type MsgToBackend = MsgToBackendExtra &
  (
    | {
        t: 'got-msg-core'
        c: WithEventMeta<SpaceEvent>
      }
    | {
        t: 'sync'
        space: SpaceCore.Model
      }
    | {
        t: 'list-spaces'
        limit: number
        offset: number
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

export type MsgToClientExtra = {
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

export type ClientModule = AppClientModule<{
  Ctx: AnonymousClientCtx | AppClientCtx
  MsgCmdIn: SpaceClientCmd<{
    MsgToBackend: MsgToBackend
    MsgClient: MsgClient
  }>
  MsgEvtIn: ClientEvt
  Model: ModelClient
  Msg: MsgClient
  MsgCmdOut: AppClientCmd<{
    MsgToBackend: MsgToBackend
    MsgClient: MsgClient
  }>
  MsgEvtOut: ClientEvt
  MsgToClient: MsgToClient
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
  MsgCmdOut: BackendCmd<MsgToClient>
  MsgEvtOut: null
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  Deps: null
}>
