import type { WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { RequestResponse } from '~/@/request-response/request-response'
import type { AppClientModule } from '../@/architecture/app-client'
import type { AppServerModule } from '../@/architecture/app-server'
import { AppClientCmd } from '../@/client/cmd'
import { AnonymousClientCtx, AppClientCtx } from '../@/client/ctx'
import { ClientEvt } from '../@/client/evt'
import { UserAccount } from '../@/data/account'
import { Profile } from '../@/data/profile'
import { SpaceId } from '../@/data/space-id'
import { UserId } from '../@/data/user-id'
import { ServerCmd } from '../@/server/cmd'
import { AppServerCtx } from '../@/server/ctx'
import { ServerEvt } from '../@/server/evt'
import { SpacesCoreClient } from './core/client'
import { ISpacesCoreServer } from './core/server/interface'
import { SpaceCore } from './core/space-core'
import { SpaceEvent } from './core/space-event'
import { GamesTypes } from './games'
import { GameName } from './games/@/game-name'

//
//
//
// Model
//
//
//

export type ServerCtx = AppServerCtx & {
  spacesCoreServer: ISpacesCoreServer
  games: GamesTypes.GameServerCtx
}

export type ModelServer = null

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

export type MsgServer =
  | { t: 'got-msg-core'; c: WithEventId<SpaceEvent> }
  | { t: 'game'; spaceId: SpaceId; c: GamesTypes.MsgServer }

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

export type MsgToServer = MsgToServerExtra &
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
        c: GamesTypes.MsgToServer
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
//

export type ClientModule = AppClientModule<{
  Ctx: AnonymousClientCtx | AppClientCtx
  MsgCmdIn: never
  MsgEvtIn: ClientEvt
  Model: ModelClient
  Msg: MsgClient
  MsgCmdOut: AppClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
  MsgEvtOut: ClientEvt
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ViewSlot: {
    bottomBar: null
  }
}>

export type ServerModule = AppServerModule<{
  Ctx: ServerCtx
  MsgCmdIn: null
  MsgEvtIn: ServerEvt
  Model: ModelServer
  Msg: MsgServer
  MsgCmdOut: ServerCmd<MsgToClient>
  MsgEvtOut: null
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Deps: null
}>
