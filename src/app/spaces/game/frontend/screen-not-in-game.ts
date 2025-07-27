import { chunk } from '~/@/array/chunk'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { SpaceFrontendCtx } from '../../@/frontend/ctx'
import { SpaceFrontendModule } from '../../frontend/space-frontend'
import type { MsgFrontend } from '../../types'
import { GameName } from '../games/@/game-name'
import { ScreenLayoutHostSettingUpGame } from '../games/@/ui/screen-layout-host-setting-up-game/screen-layout-host-setting-up-game'
import { GameCoverArt } from '../games/cover-art'
import { GAME_NAME_LIST } from '../games/types'

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
    return h(ScreenLayoutHostSettingUpGame, {
      parentScreen: input.ctx.parentScreen,
      ctx: spaceCtx,
      navBar: {
        title: input.ctx.t('spaces.games'),
        back: {
          onPress: () => input.dispatch({ t: 'exit-space-action.clicked-exit-space-button' }),
        },
      },
    })
  }

  return h(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    id: 'game-selection-screen',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('spaces.games'),
      back: {
        onPress: () => input.dispatch({ t: 'exit-space-action.clicked-exit-space-button' }),
      },
    },
    renderBody: () => h(ViewHostGameSelection, { ctx: spaceCtx, dispatch: input.dispatch }),
  })
}

const ViewHostGameSelection = (input: { ctx: SpaceFrontendCtx; dispatch: (msg: MsgFrontend) => void }) => {
  return h(
    Box,
    { class: 'flex flex-1 flex-col gap-4' },
    chunk(GAME_NAME_LIST, 3).map((gameNames) =>
      h(
        Box,
        { class: 'flex flex-row gap-4' },
        [...gameNames, null, null, null].slice(0, 3).map((gameName, index) =>
          h(Box, { class: 'flex-1', key: gameName ?? index }, [
            gameName
              ? h(GameTile, {
                  key: gameName,
                  gameName,
                  ctx: input.ctx,
                  dispatch: input.dispatch,
                })
              : null,
          ]),
        ),
      ),
    ),
  )
}

const GameTile = (input: { gameName: GameName; ctx: SpaceFrontendCtx; dispatch: (msg: MsgFrontend) => void }) => {
  return h(Box, { class: 'flex flex-col gap-2 flex-1' }, [
    h(
      Pressable,
      {
        type: 'button',
        role: 'button',
        'aria-label': input.gameName,
        onPress: () => {
          console.log('clicked', input.gameName)
          input.dispatch({ t: 'game.clicked-game-tile', gameName: input.gameName })
        },
      },
      [h(GameCoverArt, { rounded: true, gameName: input.gameName })],
    ),
    h(Typography, {
      class: 'mt-2 w-full overflow-hidden text-center text-sm font-semibold text-ellipsis whitespace-nowrap',
      variant: 'label',
      sizeClassName: 'text-base',
      text: input.ctx.t(input.gameName),
    }),
  ])
}

export const ScreenNotInGameFrontend = {
  View,
}
