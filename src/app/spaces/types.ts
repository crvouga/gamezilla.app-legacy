import type { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import type * as EndSpaceFrontend from './end-space/types'
import type * as CurrentSpaceMiniPlayerFrontend from './frontend/current-space-mini-player/types'
import type * as ExitSpaceActionFrontend from './frontend/exit-space-action/frontend'
import type * as PeopleActionFrontend from './frontend/people-action/frontend'
import type * as GameFrontend from './game/types'
import type * as JoinSpaceFrontend from './join-space/types'
import type * as LeaveSpaceFrontend from './leave-space/types'
import type * as ListSpacesFrontend from './list-spaces/types'
import type * as StartSpaceFrontend from './start-space/types'
import type * as SyncFrontend from './sync/types'
import { FrontendCtxModule, ModelFrontend } from './base-types'

export * from './base-types'

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

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtxModule
  Model: ModelFrontend
  Msg: MsgFrontend
}>
