import { Typography } from '~/@/ui'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { SpaceFrontendModule } from '../../architecture/space-frontend'
import { SpaceFrontendCtx } from '../../@/frontend/ctx'
import type { MsgFrontend } from '../../types'
import { GameName } from '../games/@/game-name'
import { ScreenLayoutHostSettingUpGame } from '../games/@/ui/screen-layout-host-setting-up-game/screen-layout-host-setting-up-game'
import { GameCoverArt } from '../games/cover-art'
import { gameNameList } from '../games/types'

const View: SpaceFrontendModule['View'] = (input) => {
  if (!input.ctx.space) return null
  if (!input.ctx.currentUser) return null

  const isGuest = input.ctx.space.hostId !== input.ctx.currentUser.userId

  const spaceCtx = {
    ...input.ctx,
    space: input.ctx.space,
    currentUserId: input.ctx.currentUser.userId,
    currentUserRole: input.ctx.currentUser.role,
    currentUser: input.ctx.currentUser,
  }

  if (isGuest) {
    return (
      <ScreenLayoutHostSettingUpGame
        parentScreen={input.ctx.parentScreen}
        ctx={spaceCtx}
        navBar={{
          title: input.ctx.t('spaces.games'),
          onBack: () => input.dispatch({ t: 'clicked-exit-space-button' }),
        }}
      />
    )
  }

  return (
    <ScreenLayout
      parentScreen={input.ctx.parentScreen}
      id='game-selection-screen'
      ctx={input.ctx}
      navBar={{
        title: input.ctx.t('spaces.games'),
        onBack: () => input.dispatch({ t: 'clicked-exit-space-button' }),
      }}
      renderBody={() => <ViewHostGameSelection ctx={spaceCtx} dispatch={input.dispatch} />}
    />
  )
}

const ViewHostGameSelection = (input: { ctx: SpaceFrontendCtx; dispatch: (msg: MsgFrontend) => void }) => {
  return (
    <div className='grid flex-1 grid-cols-3 justify-between gap-8 p-4 md:grid-cols-4 md:gap-12'>
      {gameNameList.map((gameName) => (
        <GameTile key={gameName} gameName={gameName} ctx={input.ctx} dispatch={input.dispatch} />
      ))}
    </div>
  )
}

const GameTile = (input: { gameName: GameName; ctx: SpaceFrontendCtx; dispatch: (msg: MsgFrontend) => void }) => {
  return (
    <div>
      <button
        type='button'
        aria-label={input.gameName}
        onClick={() => input.dispatch({ t: 'clicked-game-tile', gameName: input.gameName })}
        className='flex aspect-square overflow-hidden rounded-lg border'
      >
        <GameCoverArt gameName={input.gameName} />
      </button>

      <Typography
        className='mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold'
        variant='label'
        sizeClassName='text-base'
        text={input.ctx.t(input.gameName)}
      />
    </div>
  )
}

export const NotInGameScreenFrontend = {
  View,
}
