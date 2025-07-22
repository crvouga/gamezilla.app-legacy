import { RPC } from '~/@/rpc'
import { ITopicClient } from '~/@/topic/topic-client/types'
import { TopicContract } from '~/@/topic/topic-contract'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { UserId } from '~/app/@/data/user-id'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { EndSpaceTypes } from './end-space'
import { CurrentSpaceMiniPlayerTypes } from './frontend/current-space-mini-player'
import { ExitSpaceActionTypes } from './frontend/exit-space-action'
import { PeopleActionTypes } from './frontend/people-action'
import { GameTypes } from './game'
import { JoinSpaceTypes } from './join-space'
import { LeaveSpaceTypes } from './leave-space'
import { ListSpacesTypes } from './list-spaces'
import { ISpaceDb } from './space/space-db/interface'
import { SpaceProjectionStarted } from './space/space-projection'
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
  openedPreviewUserId: UserId | null
  opened: Opened
}

export type ModelFrontend = ModelFrontendBase & GameTypes.ModelFrontend

export type MsgFrontend =
  | { t: 'got-msg-out'; c: unknown }
  | PeopleActionTypes.MsgFrontend
  | LeaveSpaceTypes.MsgFrontend
  | EndSpaceTypes.MsgFrontend
  | GameTypes.MsgFrontend
  | JoinSpaceTypes.MsgFrontend
  | ExitSpaceActionTypes.MsgFrontend
  | StartSpaceTypes.MsgFrontend
  | CurrentSpaceMiniPlayerTypes.MsgFrontend
  | SyncTypes.MsgFrontend
  | ListSpacesTypes.MsgFrontend

export const topicContract = TopicContract.combine([SyncTypes.topicContract])

export const rpcContract = RPC.combineContracts([SyncTypes.rpcContract])

export type MsgBackend = SyncTypes.MsgBackend

export type FrontendCtxModule = AppFrontendCtxBase & {
  topic: ITopicClient<typeof topicContract>
  rpc: RPC.Client<typeof rpcContract>
  space: SpaceProjectionStarted | null
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
