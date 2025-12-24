import { ITopicClient } from '~/@/topic/topic-client/interface'
import { TopicContract } from '~/@/topic/topic-contract'
import { RPC } from '~/@/rpc'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { UserId } from '~/app/@/data/user-id'
import { SpaceId } from '../@/data/space-id'
import { SpaceProjectionStarted } from './space/space-projection'
import { initSpaceDb, initSpaceProjectionDb, initSpaceProjectionUserDb } from './space/space-db'
import { GamesBackendCtxModule } from './game/backend'
import * as GamesTypes from './game/games/types'
import * as SyncTypes from './sync/types'

export type Opened =
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
