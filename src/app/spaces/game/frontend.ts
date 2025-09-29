import { Eff } from '~/@/eff'
import { withEventId } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { h } from '~/@/vdom/h'
import { SpaceId } from '~/app/@/data/space-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ExitGameCmd } from '../@/frontend/exit-game-cmd'
import { SpaceFrontendModule } from '../frontend/space-frontend'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { Space } from '../space/space'
import { SpaceDbQueryCache } from '../space/space-db-query-cache'
import type { MsgFrontend } from '../types'
import { ScreenNotInGameFrontend } from './frontend/screen-not-in-game'
import { GamesFrontend } from './games/frontend'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateGame({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
  )
}

const updateFromMsg: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'game.clicked-game-tile': {
      if (!input.ctx.currentUser) return { model: input.model }

      return {
        model: input.model,
        msgSpace: [
          withEventId({
            t: 'user-inputted-game',
            game: input.msg.gameName,
            spaceId: input.msg.spaceId,
            userId: input.ctx.currentUser.userId,
          }),
        ],
      }
    }
  }
  return { model: input.model }
}

const updateFromCmd: SpaceFrontendModule['update'] = (input) => {
  if (ExitGameCmd.is(input.msgIn)) {
    const currentUserId = input.ctx.currentUser?.userId

    if (!currentUserId) return { model: input.model }

    const currentUserSpaceId = CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)

    if (!currentUserSpaceId) return { model: input.model }

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

  return { model: input.model }
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-inputted-game': {
      if (!input.ctx.currentUser?.userId) return { model: input.model }

      const currentUserSpaceId = CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)

      if (input.msgSpace.spaceId !== currentUserSpaceId) return { model: input.model }

      return {
        model: input.model,
        msgOut: [PlaySoundCmd.init(input.msgSpace.game ? APP_SOUND.navForwardMin : APP_SOUND.navBackwardMin)],
      }
    }
  }
  return { model: input.model }
}

const inputToSpaceId = (input: Parameters<SpaceFrontendModule['update']>[0]): SpaceId | null => {
  if (input.msg && 'spaceId' in input.msg) {
    return input.msg.spaceId
  }

  if (input.msgSpace && 'spaceId' in input.msgSpace) {
    return input.msgSpace.spaceId
  }

  return CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)
}

const updateGame: SpaceFrontendModule['update'] = (input) => {
  const currentUser = input.ctx.currentUser ?? null

  if (!currentUser) return { model: input.model }

  const spaceId = inputToSpaceId(input)

  if (!spaceId) return { model: input.model }

  const space = SpaceDbQueryCache.entity(input.ctx, spaceId)

  if (!space) return { model: input.model }

  const spaceState = Space.toSpaceStarted(space)

  if (!spaceState) return { model: input.model }

  if (!spaceState.game) return { model: input.model }

  const modelGame = input.model.spaces_games[spaceId] ?? GamesFrontend.init(spaceState.game.t)

  const gameUpdated = GamesFrontend.update({
    ctx: { ...input.ctx, space: spaceState, currentUser },
    model: modelGame,
    msgSpace: input.msgSpace?.t === 'game' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    modelSpace: spaceState.game,
    msg: input.msg?.t === 'game' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  return {
    model: { ...input.model, spaces_games: { ...input.model.spaces_games, [spaceId]: gameUpdated.model } },
    msgOut: gameUpdated.msgOut,
    eff: Eff.map(gameUpdated.eff, (c) => ({ t: 'game', c, spaceId })),
    msgSpace: gameUpdated.msgSpace?.map((c) => withEventId({ spaceId, t: 'game', c })),
    msgEvt: [],
  }
}

const subscriptions: SpaceFrontendModule['subscriptions'] = (input) => {
  return subscriptionsCurrentUserGame(input)
}

const subscriptionsCurrentUserGame: SpaceFrontendModule['subscriptions'] = (input) => {
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

  const sub = Sub.map(gameSub, (c): MsgFrontend => ({ t: 'game', c, spaceId: currentUserSpaceId }))

  return sub
}

const View: SpaceFrontendModule['View'] = (input) => {
  if (!input.ctx.space) return null

  if (!input.ctx.currentUser) return null

  if (!input.ctx.space.game) return h(ScreenNotInGameFrontend.View, input)

  return h(GamesFrontend.View, {
    modelSpace: input.ctx.space.game,
    ctx: { ...input.ctx, space: input.ctx.space, currentUser: input.ctx.currentUser },
    dispatch: (c) =>
      input.ctx.space?.spaceId ? input.dispatch({ t: 'game', spaceId: input.ctx.space.spaceId, c }) : null,
    model: input.model.spaces_games[input.ctx.space.spaceId] ?? GamesFrontend.init(input.ctx.space.game.t),
  })
}

export const GameFrontend = {
  View,
  update,
  subscriptions,
}
