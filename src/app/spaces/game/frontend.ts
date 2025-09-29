import { Eff } from '~/@/eff'
import { withEventId, withEventMeta } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import { h } from '~/@/vdom/h'
import { SpaceId } from '~/app/@/data/space-id'
import { andThen } from '~/app/@/frontend/and-then'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ExitGameCmd } from '../@/frontend/exit-game-cmd'
import { GotSpaceMsg } from '../@/got-space-msg.$msg'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { Space } from '../space/space'
import { SpaceDbQueryCache } from '../space/space-db-query-cache'
import type { FrontendCtxModule, ModelFrontend, MsgFrontend } from '../types'
import { ScreenNotInGameFrontend } from './frontend/screen-not-in-game'
import { GamesFrontend } from './games/frontend'
import { isMsgFrontend } from './types'

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  msgOut?: unknown[]
  eff?: Eff<MsgFrontend>
} => {
  return andThen<T, MsgFrontend>(
    input,
    (model) => updateGame({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
  )
}

const updateFromMsg: typeof update = (input) => {
  if (!isMsgFrontend(input.msg)) return input

  switch (input.msg?.t) {
    case 'game_clickedGameTile': {
      if (!input.ctx.currentUser) return input

      return {
        model: input.model,
        msgOut: [
          GotSpaceMsg.init(
            withEventMeta({
              t: 'user-inputted-game',
              game: input.msg.gameName,
              spaceId: input.msg.spaceId,
              userId: input.ctx.currentUser.userId,
            }),
          ),
        ],
      }
    }
  }
  return input
}

const updateFromCmd: typeof update = (input) => {
  if (ExitGameCmd.is(input.msgIn)) {
    const currentUserId = input.ctx.currentUser?.userId

    if (!currentUserId) return input

    const currentUserSpaceId = CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)

    if (!currentUserSpaceId) return input

    return {
      model: input.model,
      msgSpace: [
        withEventId({
          t: 'user-inputted-game',
          game: null,
          spaceId: currentUserSpaceId,
          userId: currentUserId,
        }),
      ],
    }
  }

  return input
}

const updateFromMsgSpace: typeof update = (input) => {
  if (!GotSpaceMsg.is(input.msgIn)) return input

  const msgSpace = input.msgIn.c

  switch (msgSpace?.t) {
    case 'user-inputted-game': {
      if (!input.ctx.currentUser?.userId) return input

      const currentUserSpaceId = CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)

      if (msgSpace.spaceId !== currentUserSpaceId) return input

      return {
        model: input.model,
        msgOut: [PlaySoundCmd.init(msgSpace.game ? APP_SOUND.navForwardMin : APP_SOUND.navBackwardMin)],
      }
    }
  }
  return input
}

const inputToSpaceId = (input: { msgIn?: unknown; msg?: unknown; ctx: FrontendCtxModule }): SpaceId | null => {
  if (isMsgFrontend(input.msg) && 'spaceId' in input.msg) {
    return input.msg.spaceId
  }

  if (GotSpaceMsg.is(input.msgIn)) {
    return input.msgIn.c.spaceId
  }

  return CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)
}

const updateGame: typeof update = (input) => {
  const currentUser = input.ctx.currentUser ?? null

  if (!currentUser) return input

  const spaceId = inputToSpaceId(input)

  if (!spaceId) return input

  const space = SpaceDbQueryCache.entity(input.ctx, spaceId)

  if (!space) return input

  const spaceState = Space.toSpaceStarted(space)

  if (!spaceState) return input

  if (!spaceState.game) return input

  const modelGame = input.model.spaces_games[spaceId] ?? GamesFrontend.init(spaceState.game.t)

  const msgSpace = GotSpaceMsg.is(input.msgIn) ? input.msgIn.c : null
  const msg = isMsgFrontend(input.msg) && input.msg.t === 'game_gotGameMsg' ? input.msg.c : null

  const gameUpdated = GamesFrontend.update({
    ctx: { ...input.ctx, space: spaceState, currentUser },
    model: modelGame,
    msgSpace: msgSpace?.t === 'game' ? { ...msgSpace, ...msgSpace.c } : null,
    modelSpace: spaceState.game,
    msg,
    msgIn: input.msgIn,
  })

  return {
    model: {
      ...input.model,
      spaces_games: {
        ...input.model.spaces_games,
        [spaceId]: gameUpdated.model,
      },
    },
    msgOut: Msg.batch(
      gameUpdated.msgOut,
      gameUpdated.msgSpace?.map((c) => GotSpaceMsg.init(withEventMeta({ spaceId, t: 'game', c }))),
    ),
    eff: Eff.map(gameUpdated.eff, (c) => ({ t: 'game_gotGameMsg', c, spaceId })),
  }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  return subscriptionsCurrentUserGame(input)
}

const subscriptionsCurrentUserGame: typeof subscriptions = (input) => {
  if (!input.ctx.currentUser) return Sub.none()

  const frontendCtx: AppFrontendCtx = { ...input.ctx, currentUser: input.ctx.currentUser }

  const currentUserSpaceId = CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)

  if (!currentUserSpaceId) return Sub.none()

  const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

  if (!currentUserSpace) return Sub.none()

  const spaceState = Space.toSpaceStarted(currentUserSpace)

  const modelSpace = spaceState?.game

  if (!modelSpace) return Sub.none()

  const gameModel = input.model.spaces_games[currentUserSpaceId] ?? GamesFrontend.init(modelSpace.t)

  const gameSub = GamesFrontend.subscriptions({
    ctx: { ...frontendCtx, space: spaceState },
    modelSpace: modelSpace,
    model: gameModel,
  })

  const sub = Sub.map(gameSub, (c): MsgFrontend => ({ t: 'game_gotGameMsg', c, spaceId: currentUserSpaceId }))

  return sub
}

const View = (input: { ctx: FrontendCtxModule; dispatch: (msg: MsgFrontend) => void; model: ModelFrontend }) => {
  if (!input.ctx.space) return null

  if (!input.ctx.currentUser) return null

  if (!input.ctx.space.game) return h(ScreenNotInGameFrontend.View, input)

  return h(GamesFrontend.View, {
    modelSpace: input.ctx.space.game,
    ctx: { ...input.ctx, space: input.ctx.space, currentUser: input.ctx.currentUser },
    dispatch: (c) =>
      input.ctx.space?.spaceId ? input.dispatch({ t: 'game_gotGameMsg', spaceId: input.ctx.space.spaceId, c }) : null,
    model: input.model.spaces_games[input.ctx.space.spaceId] ?? GamesFrontend.init(input.ctx.space.game.t),
  })
}

export const GameFrontend = {
  View,
  update,
  subscriptions,
}
