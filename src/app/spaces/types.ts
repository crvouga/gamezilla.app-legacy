import { Topic } from '~/@/topic'
import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { BackendCmd } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendEvt } from '~/app/@/backend/evt'
import { UserId } from '~/app/@/data/user-id'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { AppFrontendEvt } from '~/app/@/frontend/evt'
import { Space } from './@/space/space'
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
import { RPC } from '~/@/rpc'

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
  | SyncTypes.MsgFrontend

export const topicContract = Topic.initContract({
  sync: SyncTypes.topicContract,
})

export const rpcContract = RPC.initContract({
  sync: SyncTypes.rpcContract,
})

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type SpaceFrontendCtxModule = AppFrontendCtxBase & {
  topic: Topic.Client<typeof topicContract>
  rpc: RPC.Client<typeof rpcContract>
  space?: Space | null
}

export type SpaceBackendCtxModule = AppBackendCtx & {
  spacesCore: ISpacesCoreAsync
  games: GameTypes.GamesBackendCtx
}

export type FrontendModule = AppFrontendModule<{
  Ctx: SpaceFrontendCtxModule
  MsgEvtIn: AppFrontendEvt
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgCmdOut: AppFrontendCmd<MsgToBackend>
  MsgEvtOut: AppFrontendEvt
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
}>

export type BackendModule = AppBackendModule<{
  Ctx: SpaceBackendCtxModule
  MsgEvtIn: BackendEvt
  Msg: MsgBackend
  MsgCmdOut: BackendCmd<MsgToFrontend>
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
}>
