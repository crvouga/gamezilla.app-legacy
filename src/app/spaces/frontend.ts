import { Eff } from '~/@/eff'
import { EventSourced } from '~/@/event-sourced'
import { Msg } from '~/@/msg/msg'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { throttleByKey } from '~/@/throttle/throttle'
import { TimeSpan } from '~/@/time/time-span'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { h } from '~/@/vdom'
import { SpaceId } from '~/app/@/data/space-id'
import { AppFrontendCtxBase, isAppFrontendCtx } from '../@/frontend/ctx'
import { GotQueryCacheMsg } from '../frontend/query-cache/got-query-cache-msg.$msg'
import { EndSpaceFrontend } from './end-space/frontend'
import { CurrentSpaceMiniPlayer } from './frontend/current-space-mini-player/frontend'
import { ExitSpaceAction } from './frontend/exit-space-action/frontend'
import { PeopleActionFrontend } from './frontend/people-action/frontend'
import { type Input, type Output, SpaceFrontendModule } from './frontend/space-frontend'
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
import type { FrontendCtxModule, FrontendModule, ModelFrontend, rpcContract, topicContract } from './types'

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

const init: FrontendModule['init'] = (_input) => {
  const model: ModelFrontend = {
    spaces_games: {},
    spaces_opened: null,
    spaces_openedPreviewUserId: null,
  }

  return {
    model,
  }
}

const update: FrontendModule['update'] = (input) => {
  return updateLoop(input, updateChild(input))
}

const updateLoop = (input: Input, acc: Output): Output => {
  const [msgSpace, ...msgSpaceRest] = acc.msgSpace ?? []

  if (msgSpace) {
    const updated = updateChild({ ctx: input.ctx, model: acc.model, msgSpace: msgSpace })

    return updateLoop(input, {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgSpace: Msg.batch(msgSpaceRest, updated.msgSpace),
      msgOut: Msg.batch(acc.msgOut, updated.msgOut),
    })
  }

  return acc
}

const updateChild: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => EndSpaceFrontend.update({ ...input, model }),
    (model) => LeaveSpaceFrontend.update({ ...input, model }),
    (model) => GameFrontend.update({ ...input, model }),
    (model) => updateSpacesFromMsgSpace({ ...input, model }),
    (model) => SyncFrontend.update({ ...input, model }),
    (model) => StartSpaceFrontend.update({ ...input, model }),
    // done
    (model) => JoinSpaceFrontend.update({ ...input, model }),
    // done
    (model) => ListSpacesFrontend.update({ ...input, model }),
    // done
    (model) => ExitSpaceAction.update({ ...input, model }),
    // done
    (model) => CurrentSpaceMiniPlayer.update({ ...input, model: model }),
    // done
    (model) => PeopleActionFrontend.update({ ...input, model }),
    (model) => {
      switch (input.msg?.t) {
        case 'got-msg-out': {
          return { model: input.model, msgOut: [input.msg.c] }
        }
        default: {
          return { model }
        }
      }
    },
  )
}

const updateSpacesFromMsgSpace: SpaceFrontendModule['update'] = (input) => {
  const { msgSpace } = input

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

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([
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
