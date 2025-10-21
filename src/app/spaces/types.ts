import { RPC } from '~/@/rpc'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { TopicContract } from '~/@/topic/topic-contract'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { UserId } from '~/app/@/data/user-id'
import type { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { EndSpaceFrontend } from './end-space'
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
  spaces_openedPreviewUserId: UserId | null
  spaces_opened: Opened
}

export type ModelFrontend = ModelFrontendBase & GameTypes.ModelFrontend & EndSpaceFrontend.Model

export type MsgFrontend =
  | { t: 'spaces_gotMsgOut'; c: unknown }
  | { t: 'listSpaces'; c: ListSpacesTypes.MsgFrontend }
  | { t: 'peopleAction'; c: PeopleActionTypes.MsgFrontend }
  | { t: 'leaveSpace'; c: LeaveSpaceTypes.MsgFrontend }
  | { t: 'endSpace'; c: EndSpaceFrontend.Msg }
  | { t: 'game'; c: GameTypes.MsgFrontend }
  | { t: 'joinSpace'; c: JoinSpaceTypes.MsgFrontend }
  | { t: 'exitSpaceAction'; c: ExitSpaceActionTypes.MsgFrontend }
  | { t: 'startSpace'; c: StartSpaceTypes.MsgFrontend }
  | { t: 'currentSpaceMiniPlayer'; c: CurrentSpaceMiniPlayerTypes.MsgFrontend }
  | { t: 'sync'; c: SyncTypes.MsgFrontend }

export const topicContract = TopicContract.combine([SyncTypes.topicContract])

export const rpcContract = RPC.combineContracts([SyncTypes.rpcContract])

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
