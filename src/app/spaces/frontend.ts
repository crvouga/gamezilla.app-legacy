import { Eff } from '~/@/eff'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { h } from '~/@/vdom'
import { AppFrontendCtxBase, isAppFrontendCtx } from '../@/frontend/ctx'
import { queryCacheMsgs } from '../frontend/query-cache/query-cache-msgs'
import { EndSpaceFrontend } from './end-space'
import { CurrentSpaceMiniPlayerFrontend } from './frontend/current-space-mini-player'
import { ExitSpaceAction } from './frontend/exit-space-action/frontend'
import { PeopleActionFrontend } from './frontend/people-action/frontend'
import { GameFrontend } from './game/frontend'
import { JoinSpaceFrontend } from './join-space'
import { LeaveSpaceFrontend } from './leave-space/frontend'
import { ListSpacesFrontend } from './list-spaces/frontend'
import { CurrentUserSpaceLoader } from './space/current-user-space-loader'
import { SpaceFrontend } from './space/frontend'
import { initSpaceDb, initSpaceProjectionDb, initSpaceProjectionUserDb } from './space/space-db'
import { StartSpaceFrontend } from './start-space'
import { SyncFrontend } from './sync'
import {
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
  const dbConfig = {
    t: 'sql-db' as const,
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
    kvDb: input.ctx.keyValueDb,
  }
  const spaceDb = initSpaceDb(dbConfig)
  const spaceProjectionDb = initSpaceProjectionDb(dbConfig)
  const spaceProjectionUserDb = initSpaceProjectionUserDb(dbConfig)
  return {
    ...input.ctx,
    rpc: input.rpc,
    topic: input.topic,
    space: null,
    spaceDb,
    spaceProjectionDb,
    spaceProjectionUserDb,
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
      const updated = EndSpaceFrontend.update({ ...input, msg: input.msg.c })
      return {
        ...updated,
        eff: Eff.tag('endSpace', updated.eff),
      }
    }
    case 'leaveSpace': {
      const updated = LeaveSpaceFrontend.update({ ...input, msg: input.msg.c })
      return {
        ...updated,
        eff: Eff.tag('leaveSpace', updated.eff),
      }
    }
    case 'game': {
      const updated = GameFrontend.update({ ...input, msg: input.msg.c })
      return {
        ...updated,
        eff: Eff.tag('game', updated.eff),
      }
    }
    case 'joinSpace': {
      const updated = JoinSpaceFrontend.update({ ...input, msg: input.msg.c })
      return {
        ...updated,
        eff: Eff.tag('joinSpace', updated.eff),
      }
    }
    case 'listSpaces': {
      const updated = ListSpacesFrontend.update({ ...input, msg: input.msg.c })
      return {
        ...updated,
        eff: Eff.tag('listSpaces', updated.eff),
      }
    }
    case 'exitSpaceAction': {
      const updated = ExitSpaceAction.update({ ...input, msg: input.msg.c })
      return {
        ...updated,
        eff: Eff.tag('exitSpaceAction', updated.eff),
      }
    }
    case 'currentSpaceMiniPlayer': {
      const updated = CurrentSpaceMiniPlayerFrontend.update({ ...input, msg: input.msg.c })
      return {
        ...updated,
        eff: Eff.tag('currentSpaceMiniPlayer', updated.eff),
      }
    }
    case 'peopleAction': {
      const updated = PeopleActionFrontend.update({ ...input, msg: input.msg.c })
      return {
        ...updated,
        eff: Eff.tag('peopleAction', updated.eff),
      }
    }
    case 'sync': {
      const updated = SyncFrontend.update({ ...input, msg: input.msg.c })
      return {
        ...updated,
        eff: Eff.tag('sync', updated.eff),
      }
    }
    case 'startSpace': {
      const updated = StartSpaceFrontend.update({ ...input, msg: input.msg.c })
      return {
        ...updated,
        eff: Eff.tag('startSpace', updated.eff),
      }
    }
    case 'gotQueryCacheMsg': {
      const msg = input.msg
      return {
        model: input.model,
        eff: () => {
          const cacheMsg = msg.c.c
          queryCacheMsgs.pub(cacheMsg)
        },
      }
    }
  }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }) => {
  return Sub.batch<MsgFrontend>([
    Sub.map(GameFrontend.subscriptions(input), (c) => ({ t: 'game', c })),
    Sub.map(SyncFrontend.subscriptions(input), (c) => ({ t: 'sync', c })),
    Sub.map(ListSpacesFrontend.subscriptions(input), (c) => ({ t: 'listSpaces', c })),
    CurrentUserSpaceLoader.subscriptions(input),
    SpaceFrontend.subscriptions(input),
  ])
}

const View: FrontendModule['View'] = (input) => {
  switch (input.ctx.currentScreen.t) {
    case 'spaces_list': {
      return h(ListSpacesFrontend.View, {
        ...input,
        dispatch: (msg) => input.dispatch({ t: 'listSpaces', c: msg }),
        slots: {
          actionCreate: StartSpaceFrontend.viewStartSpaceButton({
            ...input,
            dispatch: (msg) => input.dispatch({ t: 'startSpace', c: msg }),
          }),
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

export const SpacesFrontend = {
  initCtx,
  init,
  update,
  subscriptions,
  View,
}
