import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { BackendCmd } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendEvt } from '~/app/@/backend/evt'
import { Profile } from '~/app/@/data/profile'
import { UserId } from '~/app/@/data/user-id'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx } from '~/app/@/frontend/ctx'
import { AppFrontendEvt } from '~/app/@/frontend/evt'
import { SpaceFrontendCmd } from './@/frontend/cmd'
import { SpacesCore } from './core/core'
import { ISpacesCoreAsync } from './core/core-async/interface'
import { EndSpaceTypes } from './end-space'
import { CurrentSpaceMiniPlayerTypes } from './frontend/current-space-mini-player'
import { ExitSpaceActionTypes } from './frontend/exit-space-action'
import { PeopleActionTypes } from './frontend/people-action'
import { GameTypes } from './game'
import { JoinSpaceTypes } from './join-space'
import { LeaveSpaceTypes } from './leave-space'
import { ListSpacesTypes } from './list-spaces'
import { StartSpaceTypes } from './start-space'
import { SyncTypes } from './sync'

//
//
//
// Ctx
//
//
//

export type BackendCtx = AppBackendCtx & {
  spacesCore: ISpacesCoreAsync
  games: GameTypes.GamesBackendCtx
}

//
//
//
// Model
//
//
//

type Opened =
  | null
  | 'people.person-preview-surface'
  | 'people.people-surface'
  | 'end-space.confirmation'
  | 'join-space.person-preview-surface'
  | 'leave-space.confirmation'

type ModelFrontendBase = {
  spaces: SpacesCore.Model
  openedPreviewUserId: UserId | null
  opened: Opened
}

export type ModelFrontend = ListSpacesTypes.ModelFrontend & GameTypes.ModelFrontend & ModelFrontendBase

//
//
//
// Msg
//
//
//

export type MsgBackend = GameTypes.MsgBackend

export type MsgFrontend =
  | PeopleActionTypes.MsgFrontend
  | LeaveSpaceTypes.MsgFrontend
  | EndSpaceTypes.MsgFrontend
  | ListSpacesTypes.MsgFrontend
  | GameTypes.MsgFrontend
  | JoinSpaceTypes.MsgFrontend
  | ExitSpaceActionTypes.MsgFrontend
  | StartSpaceTypes.MsgFrontend
  | CurrentSpaceMiniPlayerTypes.MsgFrontend

type MsgToFrontendBase = {
  profiles?: { [userId: UserId]: Profile }
  causedBy?: unknown
}

export type MsgToFrontend = MsgToFrontendBase &
  (ListSpacesTypes.MsgToFrontend | GameTypes.MsgToFrontend | SyncTypes.MsgToFrontend)

type MsgToBackendBase = {
  profiles?: { [userId: UserId]: Profile }
  causedBy?: unknown
}

export type MsgToBackend = MsgToBackendBase &
  (ListSpacesTypes.MsgToBackend | GameTypes.MsgToBackend | SyncTypes.MsgToBackend)

//
//
//
// Module
//
//
//

type SpaceFrontendCtx = AnonymousFrontendCtx | AppFrontendCtx

export type FrontendModule = AppFrontendModule<{
  Ctx: SpaceFrontendCtx
  MsgCmdIn: SpaceFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>
  MsgEvtIn: AppFrontendEvt
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgCmdOut: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>
  MsgEvtOut: AppFrontendEvt
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
}>

export type BackendModule = AppBackendModule<{
  Ctx: BackendCtx
  MsgCmdIn: null
  MsgEvtIn: BackendEvt
  Msg: MsgBackend
  MsgCmdOut: BackendCmd<MsgToFrontend>
  MsgEvtOut: null
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Deps: null
}>
