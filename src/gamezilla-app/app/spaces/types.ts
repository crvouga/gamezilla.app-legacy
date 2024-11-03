import type { RequestResponse } from 'gamezilla-app/@/core'
import type { Profile, SpaceId, UserId } from 'gamezilla-app/app/@/data'
import type { AppClientModule } from '../@/architecture/app-client'
import type { AppServerModule } from '../@/architecture/app-server'
import type { AnonymousClientCtx, ClientCmd, ClientCtx, ClientEvt } from '../@/client'
import { UserAccount } from '../@/data/account'
import type { AppServerCtx, ServerCmd, ServerEvt } from '../@/server'
import type { WithEventId, WithEventMeta } from './@/event'
import { GameName } from './games/@/game-name'
import type { GameServer } from './games/game.server'
import type * as Game from './games/game.types'
import type { IGameDb } from './games/space-game-db'
import type * as Space from './core/space-core'
import type { MsgCore } from './core/event'
import type * as Spaces from './core/client/spaces-core.client'
import { ISpacesCoreServer } from './core/server/interface'

//
//
//
// Model
//
//
//

export type ServerDeps = {
  spacesCoreServer: ISpacesCoreServer
  gameDb: IGameDb
  gameServer: Awaited<ReturnType<(typeof GameServer)['initCtx']>>
}

export type ModelServer = null

export type ModelClient = Spaces.Model & {
  games: {
    [spaceId: SpaceId]: Game.ModelClient
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
  | { t: 'got-msg-core'; c: WithEventId<MsgCore> }
  | { t: 'game'; spaceId: SpaceId; c: Game.MsgServer }

export type MsgClient =
  | { t: 'game'; spaceId: SpaceId; c: Game.MsgClient }
  | { t: 'time-passed' }
  | { t: 'clicked-go-home-button' }
  | { t: 'clicked-game-tile'; gameName: GameName }
  | { t: 'clicked-join-space-button'; spaceId: SpaceId }
  | { t: 'clicked-end-space-button' }
  | { t: 'clicked-leave-space-button' }
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
        c: WithEventMeta<MsgCore>
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
        c: Game.MsgToClient
      }
  )

export type MsgToServer = MsgToServerExtra &
  (
    | {
        t: 'got-msg-core'
        c: WithEventMeta<MsgCore>
      }
    | {
        t: 'sync'
        space: Space.Model
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
//

export type ClientModule = AppClientModule<{
  Ctx: AnonymousClientCtx | ClientCtx
  MsgCmdIn: never
  MsgEvtIn: ClientEvt
  Model: ModelClient
  Msg: MsgClient
  MsgCmdOut: ClientCmd<{
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
  Ctx: AppServerCtx
  MsgCmdIn: null
  MsgEvtIn: ServerEvt
  Model: ModelServer
  Msg: MsgServer
  MsgCmdOut: ServerCmd<MsgToClient>
  MsgEvtOut: null
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Deps: ServerDeps
}>
