import { RPC } from '~/@/rpc'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { TopicContract } from '~/@/topic/topic-contract'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { UserId } from '~/app/@/data/user-id'
import type { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { SpaceId } from '../@/data/space-id'
import { EndSpaceFrontend } from './end-space'
import { CurrentSpaceMiniPlayerFrontend } from './frontend/current-space-mini-player'
import { ExitSpaceActionFrontend } from './frontend/exit-space-action'
import { PeopleActionFrontend } from './frontend/people-action'
import { GameFrontend } from './game'
import { GamesBackendCtxModule } from './game/backend'
import { GamesTypes } from './game/games'
import { JoinSpaceFrontend } from './join-space'
import { LeaveSpaceFrontend } from './leave-space'
import { ListSpacesFrontend } from './list-spaces'
import { initSpaceDb, initSpaceProjectionDb, initSpaceProjectionUserDb } from './space/space-db'
import { SpaceProjectionStarted } from './space/space-projection'
import { StartSpaceFrontend } from './start-space'
import { SyncFrontend, SyncTypes } from './sync'

type Opened =
  | null
  | 'people.person-preview-surface'
  | 'people.people-surface'
  | 'end-space.confirmation'
  | 'join-space.person-preview-surface'
  | 'leave-space.confirmation'

export type ModelFrontend = {
  spaces_openedPreviewUserId: UserId | null
  spaces_opened: Opened
  spaces_games: {
    [spaceId: SpaceId]: GamesTypes.ModelFrontend
  }
}

export type MsgFrontend =
  | { t: 'gotQueryCacheMsg'; c: GotQueryCacheMsg }
  | { t: 'listSpaces'; c: ListSpacesFrontend.Msg }
  | { t: 'peopleAction'; c: PeopleActionFrontend.Msg }
  | { t: 'leaveSpace'; c: LeaveSpaceFrontend.Msg }
  | { t: 'endSpace'; c: EndSpaceFrontend.Msg }
  | { t: 'game'; c: GameFrontend.Msg }
  | { t: 'joinSpace'; c: JoinSpaceFrontend.Msg }
  | { t: 'exitSpaceAction'; c: ExitSpaceActionFrontend.Msg }
  | { t: 'startSpace'; c: StartSpaceFrontend.Msg }
  | { t: 'currentSpaceMiniPlayer'; c: CurrentSpaceMiniPlayerFrontend.Msg }
  | { t: 'sync'; c: SyncFrontend.Msg }

export const topicContract = TopicContract.combine([SyncTypes.topicContract])

export const rpcContract = RPC.combineContracts([SyncTypes.rpcContract])

export type FrontendCtxModule = AppFrontendCtxBase & {
  topic: ITopicClient<typeof topicContract>
  rpc: RPC.Client<typeof rpcContract>
  space: SpaceProjectionStarted | null
  spaceDb: ReturnType<typeof initSpaceDb>
  spaceProjectionDb: ReturnType<typeof initSpaceProjectionDb>
  spaceProjectionUserDb: ReturnType<typeof initSpaceProjectionUserDb>
}

export type BackendCtxModule = AppBackendCtxBase &
  GamesBackendCtxModule & {
    spaceDb: ReturnType<typeof initSpaceDb>
    spaceProjectionDb: ReturnType<typeof initSpaceProjectionDb>
    spaceProjectionUserDb: ReturnType<typeof initSpaceProjectionUserDb>
    topic: ITopicClient<typeof topicContract>
  }

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtxModule
  Model: ModelFrontend
  Msg: MsgFrontend
}>
