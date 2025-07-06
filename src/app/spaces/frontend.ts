import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { NotAsked } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Topic } from '~/@/topic'
import { AppFrontendCtxBase, isAppFrontendCtx } from '../@/frontend/ctx'
import { EndSpaceFrontend } from './end-space/frontend'
import { CurrentSpaceMiniPlayer } from './frontend/current-space-mini-player/frontend'
import { ExitSpaceAction } from './frontend/exit-space-action/frontend'
import { PeopleActionFrontend } from './frontend/people-action/frontend'
import { type Input, type Output, SpaceFrontendModule } from './frontend/space-frontend'
import { GameFrontend } from './game/frontend'
import { JoinSpaceFrontend } from './join-space/frontend'
import { LeaveSpaceFrontend } from './leave-space/frontend'
import { ListSpacesFrontend } from './list-spaces/frontend'
import { SpaceFrontend } from './space/frontend'
import { SpaceLoaderFrontend } from './space/space-loader/frontend'
import { SpaceDb } from './space/space/space-db'
import { Spaces } from './space/spaces'
import { StartSpaceFrontend } from './start-space/frontend'
import { SyncFrontend } from './sync/frontend'
import type { FrontendCtxModule, FrontendModule, ModelFrontend, rpcContract, topicContract } from './types'

const TEST_ID = {
  ...ListSpacesFrontend.TEST_ID,
}

const initCtx = async (input: {
  ctx: AppFrontendCtxBase
  rpc: RPC.Client<typeof rpcContract>
  topic: Topic.Client<typeof topicContract>
}): Promise<FrontendCtxModule> => {
  return {
    ...input.ctx,
    rpc: input.rpc,
    topic: input.topic,
    spaceDb: await SpaceDb({
      t: 'sql-db',
      sqlDb: input.ctx.sqlDb,
      logger: input.ctx.logger,
    }),
  }
}

const init: FrontendModule['init'] = (_input) => {
  const model: ModelFrontend = {
    ...SpaceLoaderFrontend.init,
    spaces: Spaces.init,
    games: {},
    opened: null,
    openedPreviewUserId: null,
    listSpacesRequest: NotAsked,
  }

  return {
    model,
  }
}

const update: FrontendModule['update'] = (input) => {
  const updated = updateLoop(input, updateChild(input))
  return updated
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
  if (input.msgSpace && Spaces.hasEvent(input.model.spaces, input.msgSpace.spaceId, input.msgSpace.eventId)) {
    return { model: input.model }
  }

  return SpaceFrontendModule.andThen(
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
    (model) => CurrentSpaceMiniPlayer.update({ ...input, model }),
    (model) => PeopleActionFrontend.update({ ...input, model }),
    (model) => SpaceLoaderFrontend.update({ ...input, model }),
  )
}

const updateSpacesFromMsgSpace: SpaceFrontendModule['update'] = ({ msgSpace, model }) => {
  if (!msgSpace) return { model }

  const updated = Spaces.update({ model: model.spaces, msgSpace })

  return { model: { ...model, spaces: updated.model } }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([
    GameFrontend.subscriptions(input),
    SyncFrontend.subscriptions(input),
    ListSpacesFrontend.subscriptions(input),
    SpaceLoaderFrontend.subscriptions(input),
  ])
}

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.n) {
    case 'spaces': {
      switch (input.ctx.currentScreen.t) {
        case 'space-list': {
          return ListSpacesFrontend.View({ dispatch: input.dispatch, ctx: input.ctx, model: input.model })
        }
        case 'space': {
          if (isAppFrontendCtx(input.ctx)) {
            return SpaceFrontend.View({
              spaceId: input.ctx.currentScreen.spaceId,
              ctx: input.ctx,
              dispatch: input.dispatch,
              model: input.model,
            })
          }
          return null
        }
        default: {
          return null
        }
      }
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
  TEST_ID,
}
