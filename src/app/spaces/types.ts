import { RPC } from '~/@/rpc'
import { TopicContract } from '~/@/topic/topic-contract'
import { ITopicClient } from '~/@/topic/topic-client/types'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { UserId } from '~/app/@/data/user-id'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { Space } from './@/space/space'
import { EndSpaceTypes } from './end-space'
import { CurrentSpaceMiniPlayerTypes } from './frontend/current-space-mini-player'
import { ExitSpaceActionTypes } from './frontend/exit-space-action'
import { PeopleActionTypes } from './frontend/people-action'
import { GameTypes } from './game'
import { JoinSpaceTypes } from './join-space'
import { LeaveSpaceTypes } from './leave-space'
import { ListSpacesTypes } from './list-spaces'
import { SpaceLoaderTypes } from './space/space-loader'
import { ISpaceDb } from './space/space/space-db/interface'
import { Spaces } from './space/spaces'
import { StartSpaceTypes } from './start-space'
import { SyncTypes } from './sync'

type Opened =
  | null
  | 'people.person-preview-surface'
  | 'people.people-surface'
  | 'end-space.confirmation'
  | 'join-space.person-preview-surface'
  | 'leave-space.confirmation'

type ModelFrontendBase = {
  spaces: Spaces.Model
  openedPreviewUserId: UserId | null
  opened: Opened
}

export type ModelFrontend = SpaceLoaderTypes.ModelFrontend &
  ListSpacesTypes.ModelFrontend &
  GameTypes.ModelFrontend &
  ModelFrontendBase

export type MsgFrontend =
  | SpaceLoaderTypes.MsgFrontend
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

export const topicContract = TopicContract.combine([SyncTypes.topicContract])

export const rpcContract = RPC.combineContracts([SyncTypes.rpcContract, ListSpacesTypes.rpcContract])

export type MsgBackend = SyncTypes.MsgBackend

export type FrontendCtxModule = AppFrontendCtxBase & {
  topic: ITopicClient<typeof topicContract>
  rpc: RPC.Client<typeof rpcContract>
  space?: Space | null
  spaceDb: ISpaceDb
}

export type BackendCtxModule = AppBackendCtxBase &
  GameTypes.GamesBackendCtxModule & {
    spaceDb: ISpaceDb
    topic: ITopicClient<typeof topicContract>
  }

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtxModule
  Model: ModelFrontend
  Msg: MsgFrontend
}>
