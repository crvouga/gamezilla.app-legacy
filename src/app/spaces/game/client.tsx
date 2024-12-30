import { Eff } from '~/@/eff'
import { WithEventId, withEventId } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { APP_SOUND, playSound } from '~/app/@/client/client-cmd'
import { AppClientCtx } from '~/app/@/client/client-ctx'
import { UserAccount } from '~/app/@/data/account'
import { TopBar, Typography } from '~/app/@/ui'
import { SpaceClientModule } from '../@/architecture/space-client'
import { SpaceClientCmd } from '../@/space-client-cmd'
import { SpacesCoreClient } from '../core/client'
import { SpaceCore } from '../core/space-core'
import { SpaceEvent } from '../core/space-event'
import { ViewUsersInSpaceList } from '../games/@/game/users-in-space-list'
import { GamesClient } from '../games/client'
import { GameCoverArt } from '../games/cover-art'
import { gameNameList } from '../games/types'
import type { MsgClient } from '../types'

const update: SpaceClientModule['update'] = (input) => {
  return SpaceClientModule.andThen(
    { model: input.model },
    (model) => updateGame({ ...input, model }),
    (model) => updateFromSpaceEvent({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model })
  )
}

const updateFromMsg: SpaceClientModule['update'] = ({ msg, model, ctx }) => {
  switch (msg?.t) {
    case 'clicked-game-tile': {
      const currentUserId = ctx.currentUserId

      const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(model, currentUserId)

      if (!currentUserId || !currentUserSpaceId) {
        return {
          model
        }
      }

      const spaceEventNew = withEventId<SpaceEvent>({
        t: 'user-inputted-game',
        game: msg.gameName,
        spaceId: currentUserSpaceId,
        userId: currentUserId
      })

      return {
        model,
        msgCore: [spaceEventNew]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}
const updateFromCmd: SpaceClientModule['update'] = ({ msgCmd, model, ctx }) => {
  switch (msgCmd?.t) {
    case 'space/exit-game': {
      const currentUserId = ctx.currentUserId
      const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(model, currentUserId)
      if (!currentUserSpaceId || !currentUserId) {
        return {
          model
        }
      }
      return {
        model,
        msgCore: [
          withEventId({
            t: 'user-inputted-game',
            game: null,
            spaceId: currentUserSpaceId,
            userId: currentUserId
          })
        ]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

const updateFromSpaceEvent: SpaceClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'user-inputted-game': {
      if (!input.ctx.currentUserId) {
        return {
          model: input.model
        }
      }

      const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(input.model, input.ctx.currentUserId)

      if (input.msgCore.spaceId === currentUserSpaceId) {
        return {
          model: input.model,
          msgCmd: [playSound(input.msgCore.game ? APP_SOUND.navForwardMin : APP_SOUND.navBackwardMin)]
        }
      }
      return {
        model: input.model
      }
    }

    default: {
      return {
        model: input.model
      }
    }
  }
}

const inputToSpaceId = (currentUser: UserAccount, input: Parameters<SpaceClientModule['update']>[0]) => {
  if (input.msg && 'spaceId' in input.msg) {
    return input.msg.spaceId
  }

  if (input.msgServer && 'spaceId' in input.msgServer) {
    return input.msgServer.spaceId
  }

  if (input.msgCore && 'spaceId' in input.msgCore) {
    return input.msgCore.spaceId
  }

  const spaceId = input.model.indexSpaceIdByUserId[currentUser.userId] ?? null

  return spaceId
}

const updateGame: SpaceClientModule['update'] = (input) => {
  const currentUser = input.ctx.currentUser ?? input.msgEvt?.currentUser ?? null

  if (!currentUser) {
    return { model: input.model }
  }

  const spaceId = inputToSpaceId(currentUser, input)

  if (!spaceId) {
    return { model: input.model }
  }

  const spaceState = SpacesCoreClient.toSpaceStarted(input.model, spaceId)

  if (!spaceState || !spaceState.game) {
    return { model: input.model }
  }

  const modelGame = input.model.games[spaceId] ?? GamesClient.init(spaceState.game.t)

  const gameUpdated = GamesClient.update({
    ctx: {
      ...input.ctx,
      space: spaceState,
      currentUserId: currentUser.userId,
      currentUserRole: currentUser.role,
      currentUser: currentUser
    },
    model: modelGame,
    msgCore: input.msgCore?.t === 'game' ? { ...input.msgCore, ...input.msgCore.c } : null,
    modelCore: spaceState.game,
    msgServer: input.msgServer?.t === 'game' ? input.msgServer.c : null,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msg: input.msg?.t === 'game' ? input.msg.c : null
  })

  return {
    model: {
      ...input.model,
      games: {
        ...input.model.games,
        [spaceId]: gameUpdated.model
      }
    },
    msgCmd: SpaceClientCmd.map(
      gameUpdated.msgCmd ?? [],
      (c) => ({ t: 'game', c, spaceId }),
      (c) => ({ t: 'game', c, spaceId })
    ),
    eff: Eff.map(gameUpdated.eff, (c) => ({ t: 'game', c, spaceId })),
    msgEvt: [],
    msgCore: (gameUpdated.msgCore ?? []).map(
      (c): WithEventId<SpaceEvent> =>
        withEventId({
          spaceId,
          t: 'game',
          c
        })
    )
  }
}

//
//
//
//
//
//
//

const subscriptions: SpaceClientModule['subscriptions'] = (input) => {
  return subscriptionsCurrentUserGame(input)
}

const subscriptionsCurrentUserGame: SpaceClientModule['subscriptions'] = (input) => {
  if (!input.ctx.currentUser) {
    return Sub.None
  }

  const clientCtx: AppClientCtx = {
    ...input.ctx,
    currentUserId: input.ctx.currentUser.userId,
    currentUserRole: input.ctx.currentUser.role,
    currentUser: input.ctx.currentUser
  }

  const spaceId = SpacesCoreClient.toSpaceIdByUserId(input.model, clientCtx.currentUserId)

  if (!spaceId) {
    return Sub.None
  }

  const spaceModel = input.model.spaces[spaceId]

  if (!spaceModel) {
    return Sub.None
  }

  const spaceState = SpaceCore.toSpaceStarted(spaceModel)

  if (!spaceState) {
    return Sub.None
  }

  const modelCore = spaceState.game

  if (!modelCore) {
    return Sub.None
  }

  const gameModel = input.model.games[spaceId] ?? GamesClient.init(modelCore.t)

  const gameSub = GamesClient.subscriptions({
    ctx: { ...clientCtx, space: spaceState },
    modelCore: modelCore,
    model: gameModel
  })

  const sub = Sub.map(gameSub, (c): MsgClient => ({ t: 'game', c, spaceId }))

  return sub
}

//
//
//
//
//
//
//

const View: SpaceClientModule['View'] = (input) => {
  const { model, ctx, dispatch } = input

  if (!ctx.space || !ctx.currentUser) {
    return null
  }

  const space = SpacesCoreClient.toSpaceStarted(model, ctx.space?.spaceId)

  if (!space) {
    return null
  }

  if (space.game) {
    return (
      <GamesClient.View
        modelCore={space.game}
        ctx={{
          ...ctx,
          space,
          currentUserId: ctx.currentUser.userId,
          currentUserRole: ctx.currentUser.role,
          currentUser: ctx.currentUser
        }}
        dispatch={(c) =>
          dispatch({
            t: 'game',
            spaceId: space.spaceId,
            c
          })
        }
        model={model.games[ctx.space.spaceId] ?? GamesClient.init(space.game.t)}
      />
    )
  }

  return <ViewScreenNotInGame {...input} />
}

const ViewScreenNotInGame: SpaceClientModule['View'] = (input) => {
  if (!input.ctx.space || !input.ctx.currentUser) {
    return null
  }

  if (input.ctx.space.hostId !== input.ctx.currentUserId) {
    return (
      <div className='flex h-full w-full flex-1 flex-col'>
        <div className='w-full flex-1'>
          <ViewUsersInSpaceList
            onOpenUserDetails={(userId) =>
              input.dispatch({
                t: 'clicked-user',
                userId
              })
            }
            ctx={{
              ...input.ctx,
              space: input.ctx.space,
              currentUserId: input.ctx.currentUser.userId,
              currentUserRole: input.ctx.currentUser.role,
              currentUser: input.ctx.currentUser
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-full w-full flex-1 flex-col'>
      <TopBar
        ctx={input.ctx}
        center
        onBack={() =>
          input.dispatch({
            t: 'clicked-go-home-button'
          })
        }
        title={input.ctx.t('spaces.games')}
      />

      <div className='grid flex-1 grid-cols-3 justify-between gap-8 p-4'>
        {gameNameList.map((gameName) => (
          <div key={gameName}>
            <button
              type='button'
              aria-label={gameName}
              onClick={() =>
                input.dispatch({
                  t: 'clicked-game-tile',
                  gameName
                })
              }
              className='flex aspect-square overflow-hidden rounded-lg border'
            >
              <GameCoverArt gameName={gameName} />
            </button>

            <Typography
              className='mt-2 w-full overflow-hidden text-center text-sm font-semibold text-ellipsis whitespace-nowrap'
              variant='label'
              text={input.ctx.t(gameName)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

//
//
//
//
//
//
//

export const GameClient = {
  View,
  update,
  subscriptions
}
