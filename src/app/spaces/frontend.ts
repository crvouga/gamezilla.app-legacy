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

const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: MsgFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  switch (input.msg.t) {
    case 'endSpace': {
      return EndSpaceFrontend.update({ ...input, model })
    }
    case 'leaveSpace': {
      return LeaveSpaceFrontend.update({ ...input, model })
    }
    case 'game': {
      return GameFrontend.update({ ...input, model })
    }
    case 'joinSpace': {
      return JoinSpaceFrontend.update({ ...input, model })
    }
    case 'listSpaces': {
      return ListSpacesFrontend.update({ ...input, model })
    }
    case 'exitSpaceAction': {
      return ExitSpaceAction.update({ ...input, model })
    }
    case 'currentSpaceMiniPlayer': {
      return CurrentSpaceMiniPlayer.update({ ...input, model })
    }
    case 'peopleAction': {
      return PeopleActionFrontend.update({ ...input, model })
    }
    case 'sync': {
      return SyncFrontend.update({ ...input, model })
    }
    case 'startSpace': {
      return StartSpaceFrontend.update({ ...input, model })
    }
    default: {
      return { model: input.model }
    }
  }
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
