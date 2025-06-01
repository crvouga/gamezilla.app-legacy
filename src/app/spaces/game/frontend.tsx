import { Eff } from '~/@/eff'
import { withEventId } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { UserAccount } from '~/app/@/data/user-account'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { ExitGameCmd } from '../@/frontend/exit-game-cmd'
import { SpaceFrontendModule } from '../architecture/space-frontend'
import { SpacesCore } from '../spaces-core/spaces-core'
import { Space } from '../spaces-core/space'
import { MsgSpace } from '../spaces-core/space-msg/space-msg'
import type { MsgFrontend } from '../types'
import { ScreenNotInGameFrontend } from './frontend/screen-not-in-game'
import { GamesFrontend } from './games/frontend'
import { SpaceId } from '~/app/@/data/space-id'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateGame({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
  )
}

const updateFromMsg: SpaceFrontendModule['update'] = ({ msg, model, ctx }) => {
  switch (msg?.t) {
    case 'game.clicked-game-tile': {
      const currentUserId = ctx.currentUser?.userId
      if (!currentUserId) return { model }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(model.spaces, currentUserId)

      if (!currentUserSpaceId) return { model }

      return {
        model,
        msgSpace: [
          withEventId({
            t: 'user-inputted-game',
            game: msg.gameName,
            spaceId: currentUserSpaceId,
            userId: currentUserId,
          }),
        ],
      }
    }
  }
  return { model }
}

const updateFromCmd: SpaceFrontendModule['update'] = (input) => {
  if (ExitGameCmd.is(input.msgIn)) {
    const currentUserId = input.ctx.currentUser?.userId

    if (!currentUserId) return { model: input.model }

    const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, currentUserId)

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

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUser.userId)

      if (input.msgSpace.spaceId !== currentUserSpaceId) return { model: input.model }

      return {
        model: input.model,
        msgOut: [PlaySoundCmd.init(input.msgSpace.game ? APP_SOUND.navForwardMin : APP_SOUND.navBackwardMin)],
      }
    }
  }
  return { model: input.model }
}

const inputToSpaceId = (
  currentUser: UserAccount,
  input: Parameters<SpaceFrontendModule['update']>[0],
): SpaceId | null => {
  if (input.msg && 'spaceId' in input.msg) {
    return input.msg.spaceId
  }

  if (input.msgSpace && 'spaceId' in input.msgSpace) {
    return input.msgSpace.spaceId
  }

  const spaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, currentUser.userId) ?? null

  return spaceId
}

const updateGame: SpaceFrontendModule['update'] = (input) => {
  const currentUser = input.ctx.currentUser ?? null

  if (!currentUser) return { model: input.model }

  const spaceId = inputToSpaceId(currentUser, input)

  if (!spaceId) return { model: input.model }

  const spaceState = SpacesCore.toSpaceStarted(input.model.spaces, spaceId)

  if (!spaceState) return { model: input.model }

  if (!spaceState.game) return { model: input.model }

  const modelGame = input.model.games[spaceId] ?? GamesFrontend.init(spaceState.game.t)

  const gameUpdated = GamesFrontend.update({
    ctx: {
      ...input.ctx,
      space: spaceState,
      currentUserId: currentUser.userId,
      currentUserRole: currentUser.role,
      currentUser: currentUser,
    },
    model: modelGame,
    msgSpace: input.msgSpace?.t === 'game' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    modelSpace: spaceState.game,
    msg: input.msg?.t === 'game' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  return {
    model: { ...input.model, games: { ...input.model.games, [spaceId]: gameUpdated.model } },
    msgOut: gameUpdated.msgOut,
    eff: Eff.map(gameUpdated.eff, (c) => ({ t: 'game', c, spaceId })),
    msgSpace: gameUpdated.msgSpace?.map((c) => withEventId<MsgSpace>({ spaceId, t: 'game', c })),
    msgEvt: [],
  }
}

//
//
//
//
//
//
//

const subscriptions: SpaceFrontendModule['subscriptions'] = (input) => {
  return subscriptionsCurrentUserGame(input)
}

const subscriptionsCurrentUserGame: SpaceFrontendModule['subscriptions'] = (input) => {
  if (!input.ctx.currentUser) return Sub.none()

  const frontendCtx: AppFrontendCtx = {
    ...input.ctx,
    currentUserId: input.ctx.currentUser.userId,
    currentUserRole: input.ctx.currentUser.role,
    currentUser: input.ctx.currentUser,
  }

  const spaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, frontendCtx.currentUser?.userId)

  if (!spaceId) return Sub.none()

  const spaceModel = input.model.spaces.spaces[spaceId]

  const spaceState = Space.toSpaceStarted(spaceModel)

  const modelSpace = spaceState?.game

  if (!modelSpace) return Sub.none()

  const gameModel = input.model.games[spaceId] ?? GamesFrontend.init(modelSpace.t)

  const gameSub = GamesFrontend.subscriptions({
    ctx: { ...frontendCtx, space: spaceState },
    modelSpace: modelSpace,
    model: gameModel,
  })

  const sub = Sub.map(gameSub, (c): MsgFrontend => ({ t: 'game', c, spaceId }))

  return sub
}

//
//
//
//
//
//
//

const View: SpaceFrontendModule['View'] = (input) => {
  if (!input.ctx.space) return null

  if (!input.ctx.currentUser) return null

  const space = SpacesCore.toSpaceStarted(input.model.spaces, input.ctx.space?.spaceId)

  if (!space) return null

  if (!space.game) return <ScreenNotInGameFrontend.View {...input} />

  return (
    <GamesFrontend.View
      modelSpace={space.game}
      ctx={{
        ...input.ctx,
        space,
        currentUserId: input.ctx.currentUser.userId,
        currentUserRole: input.ctx.currentUser.role,
        currentUser: input.ctx.currentUser,
      }}
      dispatch={(c) => input.dispatch({ t: 'game', spaceId: space.spaceId, c })}
      model={input.model.games[space.spaceId] ?? GamesFrontend.init(space.game.t)}
    />
  )
}

export const GameFrontend = {
  View,
  update,
  subscriptions,
}
