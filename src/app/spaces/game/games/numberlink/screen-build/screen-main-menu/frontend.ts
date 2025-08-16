import { Sub } from '~/@/sub'
import { Box } from '~/@/vdom/primitives/box'
import { IconBox, IconPuzzlePiece, IconScrewdriverWrench } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { GameMainMenu } from '../../../@/ui/game-main-menu'
import type { FrontendModule } from '../types'
import { sx } from '~/@/vdom/style/sx'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen({ model: input.model }, (model) => updateFromMsgSpace({ ...input, model }))
}

const updateFromMsgSpace: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'game.numberlink.build.screen-main-menu.user-clicked-option': {
      return {
        model: input.model,
        msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)],
      }
    }

    case 'screen-main-menu.user-clicked-back-button': {
      return {
        model: input.model,
        msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)],
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

export const TEST_ID_NUMBERLINK_BUILD_MAIN_MENU_SCREEN = 'numberlink-build-main-menu-screen'

const View: FrontendModule['View'] = (input) => {
  return h(GameMainMenu.View, {
    dataTestId: TEST_ID_NUMBERLINK_BUILD_MAIN_MENU_SCREEN,
    ctx: input.ctx,
    dispatch: (c) => input.dispatch(c),
    onBack: () =>
      input.dispatch({
        t: 'got-msg-space',
        c: {
          t: 'screen-main-menu.user-clicked-back-button',
          userId: input.ctx.currentUser.userId,
        },
      }),
    renderCoverArt: (input) =>
      h(Box, input, [
        h(Box, { style: sx({ height: 'full', width: 'full', padding: 4 }) }, [
          h(IconScrewdriverWrench, { style: sx({ height: 'full', width: 'full' }) }),
        ]),
      ]),
    title: input.ctx.t('game.numberlink.build'),
    buttons: [
      {
        renderIcon: (input) => h(IconPuzzlePiece, input),
        title: input.ctx.t('game.numberlink.open-puzzle-builder-title'),
        description: input.ctx.t('game.numberlink.open-puzzle-builder-description'),
        onPress: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'game.numberlink.build.screen-main-menu.user-clicked-option',
              option: 'puzzle-builder',
              userId: input.ctx.currentUser.userId,
            },
          }),
      },
      {
        renderIcon: (input) => h(IconBox, input),
        title: input.ctx.t('game.numberlink.open-pack-builder-title'),
        description: input.ctx.t('game.numberlink.open-pack-builder-description'),
        onPress: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'game.numberlink.build.screen-main-menu.user-clicked-option',
              option: 'pack-builder',
              userId: input.ctx.currentUser.userId,
            },
          }),
      },
    ],
  })
}

const subscriptions: FrontendModule['subscriptions'] = (_input) => {
  return Sub.none()
}

export const ScreenMainMenuFrontend = {
  update,
  subscriptions,
  View,
}
