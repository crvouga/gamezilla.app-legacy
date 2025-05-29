import { s } from '~/@/schema'
import { Topic } from '~/@/topic'
import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { BackendCmd } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendEvt } from '~/app/@/backend/evt'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx } from '~/app/@/frontend/ctx'
import { AppFrontendEvt } from '~/app/@/frontend/evt'
import { SpaceId } from '../@/data/space-id'
import { SpacesCore } from './core/core'
import { ISpacesCoreAsync } from './core/core-async/interface'
import { MsgSpace } from './core/space-msg/space-msg'
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
  profilesByUserId?: { [userId: UserId]: UserProfile }
  causedBy?: unknown
}

export type MsgToFrontend = MsgToFrontendBase &
  (ListSpacesTypes.MsgToFrontend | GameTypes.MsgToFrontend | SyncTypes.MsgToFrontend)

type MsgToBackendBase = {
  profilesByUserId?: { [userId: UserId]: UserProfile }
  causedBy?: unknown
}

export type MsgToBackend = MsgToBackendBase &
  (ListSpacesTypes.MsgToBackend | GameTypes.MsgToBackend | SyncTypes.MsgToBackend)

export const pubSubContract = Topic.initContract({
  msgSpace: {
    params: s.obj({
      spaceId: SpaceId,
    }),
    msg: MsgSpace,
  },
})

//
//
//
// Module
//
//
//

type SpaceFrontendCtx = (AnonymousFrontendCtx | AppFrontendCtx) & {
  topic: Topic.Client<typeof topicContract>
}

export type FrontendModule = AppFrontendModule<{
  Ctx: SpaceFrontendCtx
  MsgEvtIn: AppFrontendEvt
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgCmdOut: AppFrontendCmd<MsgToBackend>
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

export const topicContract = Topic.initContract({
  msgSpace: {
    params: SpaceId,
    msg: MsgSpace,
  },
})
