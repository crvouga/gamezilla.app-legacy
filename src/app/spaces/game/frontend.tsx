import { Eff } from '~/@/eff'
import { WithEventId, withEventId } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { UserAccount } from '~/app/@/data/account'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { Typography } from '~/@/ui'
import { ScreenLayout } from '~/app/@/ui/screen-layout'
import { SpaceFrontendCmd } from '~/app/spaces/@/frontend/cmd'
import { SpaceFrontendModule } from '../@/architecture/space-frontend'
import { SpacesCore } from '../core/core'
import { Space } from '../core/space'
import { MsgSpace } from '../core/space-msg'
import type { MsgFrontend } from '../types'
import { ViewUsersInSpaceList } from './games/@/ui/users-in-space-list'
import { GameCoverArt } from './games/cover-art'
import { GamesFrontend } from './games/frontend'
import { gameNameList } from './games/types'

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
    case 'clicked-game-tile': {
      const currentUserId = ctx.currentUserId

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(model, currentUserId)

      if (!currentUserId || !currentUserSpaceId) {
        return {
          model,
        }
      }

      const spaceEventNew = withEventId<MsgSpace>({
        t: 'user-inputted-game',
        game: msg.gameName,
        spaceId: currentUserSpaceId,
        userId: currentUserId,
      })

      return {
        model,
        msgSpace: [spaceEventNew],
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}
const updateFromCmd: SpaceFrontendModule['update'] = ({ msgCmd, model, ctx }) => {
  switch (msgCmd?.t) {
    case 'space-cmd.exit-game': {
      const currentUserId = ctx.currentUserId
      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(model, currentUserId)

      if (!currentUserSpaceId || !currentUserId) {
        return {
          model,
        }
      }

      return {
        model,
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

    default: {
      return {
        model,
      }
    }
  }
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-inputted-game': {
      if (!input.ctx.currentUserId) {
        return {
          model: input.model,
        }
      }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model, input.ctx.currentUserId)

      if (input.msgSpace.spaceId === currentUserSpaceId) {
        return {
          model: input.model,
          msgCmd: [playSound(input.msgSpace.game ? APP_SOUND.navForwardMin : APP_SOUND.navBackwardMin)],
        }
      }
      return {
        model: input.model,
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const inputToSpaceId = (currentUser: UserAccount, input: Parameters<SpaceFrontendModule['update']>[0]) => {
  if (input.msg && 'spaceId' in input.msg) {
    return input.msg.spaceId
  }

  if (input.msgBackend && 'spaceId' in input.msgBackend) {
    return input.msgBackend.spaceId
  }

  if (input.msgSpace && 'spaceId' in input.msgSpace) {
    return input.msgSpace.spaceId
  }

  const spaceId = input.model.indexSpaceIdByUserId[currentUser.userId] ?? null

  return spaceId
}

const updateGame: SpaceFrontendModule['update'] = (input) => {
  const currentUser = input.ctx.currentUser ?? input.msgEvt?.currentUser ?? null

  if (!currentUser) {
    return { model: input.model }
  }

  const spaceId = inputToSpaceId(currentUser, input)

  if (!spaceId) {
    return { model: input.model }
  }

  const spaceState = SpacesCore.toSpaceStarted(input.model, spaceId)

  if (!spaceState || !spaceState.game) {
    return { model: input.model }
  }

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
    msgBackend: input.msgBackend?.t === 'game' ? input.msgBackend.c : null,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msg: input.msg?.t === 'game' ? input.msg.c : null,
  })

  return {
    model: {
      ...input.model,
      games: {
        ...input.model.games,
        [spaceId]: gameUpdated.model,
      },
    },
    msgCmd: SpaceFrontendCmd.map(
      gameUpdated.msgCmd ?? [],
      (c) => ({ t: 'game', c, spaceId }),
      (c) => ({ t: 'game', c, spaceId }),
    ),
    eff: Eff.map(gameUpdated.eff, (c) => ({ t: 'game', c, spaceId })),
    msgEvt: [],
    msgSpace: (gameUpdated.msgSpace ?? []).map(
      (c): WithEventId<MsgSpace> =>
        withEventId({
          spaceId,
          t: 'game',
          c,
        }),
    ),
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
  if (!input.ctx.currentUser) return Sub.None

  const frontendCtx: AppFrontendCtx = {
    ...input.ctx,
    currentUserId: input.ctx.currentUser.userId,
    currentUserRole: input.ctx.currentUser.role,
    currentUser: input.ctx.currentUser,
  }

  const spaceId = SpacesCore.toSpaceIdByUserId(input.model, frontendCtx.currentUserId)

  if (!spaceId) return Sub.None

  const spaceModel = input.model.spaces[spaceId]

  const spaceState = Space.toSpaceStarted(spaceModel)

  const modelSpace = spaceState?.game

  if (!modelSpace) return Sub.None

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

  const space = SpacesCore.toSpaceStarted(input.model, input.ctx.space?.spaceId)

  if (!space) return null

  if (!space.game) return <ViewScreenNotInGame {...input} />

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
      dispatch={(c) =>
        input.dispatch({
          t: 'game',
          spaceId: space.spaceId,
          c,
        })
      }
      model={input.model.games[space.spaceId] ?? GamesFrontend.init(space.game.t)}
    />
  )
}

const ViewScreenNotInGame: SpaceFrontendModule['View'] = (input) => {
  if (!input.ctx.space) return null
  if (!input.ctx.currentUser) return null

  const isSpectator = input.ctx.space.hostId !== input.ctx.currentUser.userId
  const spaceCtx = {
    ...input.ctx,
    space: input.ctx.space,
    currentUserId: input.ctx.currentUser.userId,
    currentUserRole: input.ctx.currentUser.role,
    currentUser: input.ctx.currentUser,
  }
  return (
    <ScreenLayout
      id='game-selection-screen'
      ctx={input.ctx}
      nav={{
        title: input.ctx.t('spaces.games'),
        onBack: () => input.dispatch({ t: 'clicked-go-home-button' }),
      }}
      renderBody={() =>
        isSpectator ? (
          <ViewUsersInSpaceList
            onOpenUserDetails={(userId) => input.dispatch({ t: 'clicked-user', userId })}
            ctx={spaceCtx}
          />
        ) : (
          <div className='3xl:grid-cols-8 grid flex-1 grid-cols-3 justify-between gap-8 p-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'>
            {gameNameList.map((gameName) => (
              <div key={gameName}>
                <button
                  type='button'
                  aria-label={gameName}
                  onClick={() =>
                    input.dispatch({
                      t: 'clicked-game-tile',
                      gameName,
                    })
                  }
                  className='flex aspect-square overflow-hidden rounded-lg border'
                >
                  <GameCoverArt gameName={gameName} />
                </button>

                <Typography
                  className='mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold'
                  variant='label'
                  text={input.ctx.t(gameName)}
                />
              </div>
            ))}
          </div>
        )
      }
    />
  )
}

export const GameFrontend = {
  View,
  update,
  subscriptions,
}
