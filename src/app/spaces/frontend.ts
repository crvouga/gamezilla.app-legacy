import { Eff } from '~/@/eff'
import { EventSourced } from '~/@/event-sourced'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { h } from '~/@/vdom'
import { SpaceId } from '~/app/@/data/space-id'
import { andThen } from '../@/frontend/and-then'
import { AppFrontendCtxBase, isAppFrontendCtx } from '../@/frontend/ctx'
import { GotQueryCacheMsg } from '../frontend/query-cache/got-query-cache-msg.$msg'
import { GotSpaceMsg } from './@/got-space-msg.$msg'
import { EndSpaceFrontend } from './end-space/frontend'
import { CurrentSpaceMiniPlayer } from './frontend/current-space-mini-player/frontend'
import { ExitSpaceAction } from './frontend/exit-space-action/frontend'
import { PeopleActionFrontend } from './frontend/people-action/frontend'
import { GameFrontend } from './game/frontend'
import { JoinSpaceFrontend } from './join-space/frontend'
import { LeaveSpaceFrontend } from './leave-space/frontend'
import { ListSpacesFrontend } from './list-spaces/frontend'
import { CurrentUserSpaceLoader } from './space/current-user-space-loader'
import { SpaceFrontend } from './space/frontend'
import { Space } from './space/space'
import { ISpaceDb, SpaceDb } from './space/space-db'
import { SpaceDbQueryCache } from './space/space-db-query-cache'
import { StartSpaceFrontend } from './start-space/frontend'
import { SyncFrontend } from './sync/frontend'
import {
  isMsgFrontendBase,
  type FrontendCtxModule,
  type FrontendModule,
  type ModelFrontend,
  type MsgFrontend,
  type rpcContract,
  type topicContract,
} from './types'

const initCtx = async (input: {
  ctx: AppFrontendCtxBase
  rpc: RPC.Client<typeof rpcContract>
  topic: ITopicClient<typeof topicContract>
}): Promise<FrontendCtxModule> => {
  const spaceDb = await SpaceDb({
    t: 'sql-db',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
  })
  return {
    ...input.ctx,
    rpc: input.rpc,
    topic: input.topic,
    space: null,
    spaceDb,
  }
}

const init = (_input: {}): {
  model: ModelFrontend
} => {
  const model: ModelFrontend = {
    spaces_games: {},
    spaces_opened: null,
    spaces_openedPreviewUserId: null,
  }

  return {
    model,
  }
}

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  return andThen<T, MsgFrontend>(
    { model: input.model },
    (model) => EndSpaceFrontend.update({ ...input, model }),
    (model) => LeaveSpaceFrontend.update({ ...input, model }),
    (model) => GameFrontend.update({ ...input, model }),
    (model) => updateSpacesFromMsgSpace({ ...input, model }),
    (model) => SyncFrontend.update({ ...input, model }),
    (model) => StartSpaceFrontend.update({ ...input, model }),
    (model) => JoinSpaceFrontend.update({ ...input, model }),
    (model) => ListSpacesFrontend.update({ ...input, model }),
    (model) => ExitSpaceAction.update({ ...input, model }),
    (model) => CurrentSpaceMiniPlayer.update({ ...input, model: model }),
    (model) => PeopleActionFrontend.update({ ...input, model }),
    (model) => updateFromMsgFrontendBase({ ...input, model }),
  )
}

const updateFromMsgFrontendBase: typeof update = (input) => {
  if (!isMsgFrontendBase(input.msg)) return { model: input.model }
  switch (input.msg?.t) {
    case 'spaces_gotMsgOut': {
      return { model: input.model, msgOut: [input.msg.c] }
    }
  }
}

const updateSpacesFromMsgSpace = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msgIn?: unknown
}): {
  model: T
  msgOut?: unknown[]
  eff?: Eff<MsgFrontend>
} => {
  if (!GotSpaceMsg.is(input.msgIn)) return { model: input.model }

  const msgSpace = input.msgIn.c

  if (!msgSpace) return { model: input.model }

  const space = SpaceDbQueryCache.entity(input.ctx, msgSpace.spaceId) ?? Space.init

  const spaceNew = Space.append(space, msgSpace)

  return {
    model: input.model,
    msgOut: [
      GotQueryCacheMsg.init({
        t: 'got-entity',
        id: msgSpace.spaceId,
        entityType: 'space',
        entity: spaceNew,
        lastUpdatedAtKey: Space.key('lastUpdatedAt'),
      }),
    ],
    async eff() {
      switch (msgSpace.t) {
        case 'game': {
          upsertSpaceThrottled(input.ctx.spaceDb, msgSpace.spaceId, spaceNew)
          return
        }
        default: {
          upsertSpace(input.ctx.spaceDb, msgSpace.spaceId, spaceNew)
          return
        }
      }
    },
  }
}

const upsertSpace = async (spaceDb: ISpaceDb, _spaceId: SpaceId, space: Space) => {
  await spaceDb.upsert(EventSourced.startFromLatestSnapshot(space))
}

const upsertSpaceThrottled = throttleByKey({
  fn: upsertSpace,
  keyFn: (_spaceDb, spaceId, _space) => spaceId,
  throttle: TimeSpan.seconds(3),
  behavior: 'use-latest',
})

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }) => {
  return Sub.batch<MsgFrontend>([
    GameFrontend.subscriptions(input),
    SyncFrontend.subscriptions(input),
    ListSpacesFrontend.subscriptions(input),
    CurrentUserSpaceLoader.subscriptions(input),
    SpaceFrontend.subscriptions(input),
  ])
}

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.t) {
    case 'spaces_list': {
      return h(ListSpacesFrontend.View, {
        ...input,
        slots: {
          actionCreate: StartSpaceFrontend.viewStartSpaceButton(input),
        },
      })
    }
    case 'spaces_space': {
      if (isAppFrontendCtx(input.ctx)) {
        return h(SpaceFrontend.View, { ...input, spaceId: input.ctx.currentScreen.spaceId })
      }
      return null
    }
    default: {
      return null
    }
  }
}

const ViewCurrentSpaceMiniPlayer = CurrentSpaceMiniPlayer.View

export const SpacesFrontend = {
  initCtx,
  init,
  update,
  subscriptions,
  View,
  ViewCurrentSpaceMiniPlayer,
}
