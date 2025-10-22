import { Eff } from '~/@/eff'
import { WithEventId, withEventId, withEventMeta } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { h } from '~/@/vdom/h'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace, spaceMsgs } from '../space/msg-space'
import { Space } from '../space/space'
import { SpaceDbQueryCache } from '../space/space-db-query-cache'
import type { FrontendCtxModule, ModelFrontend, MsgFrontend } from '../types'
import { ScreenNotInGameFrontend } from './frontend/screen-not-in-game'
import { GamesTypes } from './games'
import { ExitGameCmd, exitGameCmds } from './games/@/exit-game-cmd'
import { GameName } from './games/@/game-name'
import { GamesFrontend } from './games/frontend'

export type Msg =
  | {
      t: 'game_gotGameMsg'
      spaceId: SpaceId
      c: GamesTypes.Msg
    }
  | {
      t: 'game_clickedGameTile'
      gameName: GameName
      userId: UserId
      spaceId: SpaceId
    }
  | {
      t: 'game_gotExitGameCmd'
      c: ExitGameCmd
    }
  | {
      t: 'game_gotMsgSpace'
      c: WithEventId<GamesTypes.MsgSpace>
      spaceId: SpaceId
    }

const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: Msg
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'game_gotMsgSpace': {
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

      const gameUpdated = GamesFrontend.update({
        ctx: { ...input.ctx, space: spaceState, currentUser },
        model: modelGame,
        modelSpace: spaceState.game,
        msgSpace: input.msg.c,
      })

      const msgSpaceOut: WithEventId<MsgSpace>[] =
        gameUpdated.msgSpace?.map((c) => withEventMeta({ spaceId, t: 'game', c })) ?? []

      return {
        model: {
          ...input.model,
          spaces_games: {
            ...input.model.spaces_games,
            [spaceId]: gameUpdated.model,
          },
        },
        eff: Eff.batch([
          Eff.map(gameUpdated.eff, (c) => ({ t: 'game_gotGameMsg', c, spaceId })),
          () => {
            for (const msg of msgSpaceOut) {
              spaceMsgs.pub(msg)
            }
          },
        ]),
      }
    }
    case 'game_gotGameMsg': {
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

      const gameUpdated = GamesFrontend.update({
        ctx: { ...input.ctx, space: spaceState, currentUser },
        model: modelGame,
        modelSpace: spaceState.game,
        msg: input.msg.c,
      })

      const msgSpaceOut: WithEventId<MsgSpace>[] =
        gameUpdated.msgSpace?.map((c) => withEventMeta({ spaceId, t: 'game', c })) ?? []

      return {
        model: {
          ...input.model,
          spaces_games: {
            ...input.model.spaces_games,
            [spaceId]: gameUpdated.model,
          },
        },
        eff: Eff.batch([
          Eff.map(gameUpdated.eff, (c) => ({ t: 'game_gotGameMsg', c, spaceId })),
          () => {
            for (const msg of msgSpaceOut) {
              spaceMsgs.pub(msg)
            }
          },
        ]),
      }
    }
    case 'game_clickedGameTile': {
      if (!input.ctx.currentUser) return input
      const msgSpace = withEventMeta<MsgSpace>({
        t: 'userInputtedGame',
        game: input.msg.gameName,
        spaceId: input.msg.spaceId,
        userId: input.ctx.currentUser.userId,
      })
      return {
        model: input.model,
        eff: () => {
          spaceMsgs.pub(msgSpace)
        },
      }
    }
    case 'game_gotExitGameCmd': {
      const currentUserId = input.ctx.currentUser?.userId

      if (!currentUserId) return input

      const currentUserSpaceId = CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)

      if (!currentUserSpaceId) return input

      return {
        model: input.model,
        eff: () => {
          spaceMsgs.pub(
            withEventId({
              t: 'userInputtedGame',
              game: null,
              spaceId: currentUserSpaceId,
              userId: currentUserId,
            }),
          )
        },
      }
    }
  }
}

const inputToSpaceId = (input: { msg: Msg; ctx: FrontendCtxModule }): SpaceId | null => {
  switch (input.msg.t) {
    case 'game_gotExitGameCmd': {
      return CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)
    }
    case 'game_gotGameMsg':
    case 'game_gotMsgSpace': {
      return input.msg.spaceId
    }
    case 'game_clickedGameTile': {
      return input.msg.spaceId
    }
  }
}

// const gameMsgs = Sub.filterMap(spaceMsgs, (msg): GamesTypes.MsgSpace | null => {
//   if (msg.t === 'game') {
//     return msg.c
//   }
//   return null
// })

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<Msg> => {
  return Sub.batch<Msg>([
    subscriptionsCurrentUserGame(input),
    // Sub.map(gameMsgs, (c): Msg => ({ t: 'game_gotMsgSpace', c: c.c, spaceId: c.spaceId })),
    Sub.map(exitGameCmds, (c): Msg => ({ t: 'game_gotExitGameCmd', c })),
  ])
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

  const sub = Sub.map(gameSub, (c): Msg => ({ t: 'game_gotGameMsg', c, spaceId: currentUserSpaceId }))

  return sub
}

const View = (input: { ctx: FrontendCtxModule; dispatch: (msg: MsgFrontend) => void; model: ModelFrontend }) => {
  if (!input.ctx.currentUser) return null

  const space = input.ctx.space

  if (!space) return null

  if (!space.game)
    return h(ScreenNotInGameFrontend.View, {
      ctx: input.ctx,
      dispatch: input.dispatch,
      model: input.model,
    })

  return h(GamesFrontend.View, {
    modelSpace: space.game,
    ctx: { ...input.ctx, space, currentUser: input.ctx.currentUser },
    dispatch: (c) => input.dispatch({ t: 'game', c: { t: 'game_gotGameMsg', c, spaceId: space.spaceId } }),
    model: input.model.spaces_games[space.spaceId] ?? GamesFrontend.init(space.game.t),
  })
}

export const GameFrontend = {
  View,
  update,
  subscriptions,
}
