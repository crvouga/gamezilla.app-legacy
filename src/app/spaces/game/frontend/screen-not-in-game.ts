import { Clickable } from '~/@/ui/clickable'
import { Grid } from '~/@/ui/grid/grid'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
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
  return h(Grid, {
    columnCount: 3,
    rootStyle: theme({
      gap: 4,
      padding: 4,
    }),
    rowStyle: theme({
      gap: 4,
    }),
    items: GAME_NAME_LIST.map((gameName) =>
      h(GameTile, {
        key: gameName,
        gameName,
        ctx: input.ctx,
        dispatch: input.dispatch,
      }),
    ),
  })
}

const GameTile = (input: { gameName: GameName; ctx: SpaceFrontendCtx; dispatch: (msg: MsgFrontend) => void }) => {
  return h(
    Clickable,
    {
      style: theme({
        flexDirection: 'col',
        gap: 4,
      }),
      role: 'link',
      'aria-label': input.gameName,
      onPress: () => {
        input.dispatch({
          t: 'game.clicked-game-tile',
          gameName: input.gameName,
          spaceId: input.ctx.space.spaceId,
          userId: input.ctx.currentUser.userId,
        })
      },
    },
    [
      h(GameCoverArt, {
        rounded: true,
        gameName: input.gameName,
        platform: input.ctx.platform,
      }),
      h(Typography, {
        style: theme({
          width: 'full',
          fontSize: 'md',
          textAlign: 'center',
        }),
        variant: 'label',
        text: input.ctx.t(input.gameName),
      }),
    ],
  )
}

export const ScreenNotInGameFrontend = {
  View,
}
