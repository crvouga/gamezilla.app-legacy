import { Sub } from '~/@/sub'
import { Button } from '~/@/ui/button'
import { IconArrowLeft } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { ScreenAddPuzzle } from './screen-add-puzzle/frontend'
import { ScreenPuzzlePlay } from './screen-play-puzzle/frontend'
import { ScreenPuzzleGrid } from './screen-puzzle-grid/frontend'
import { EditPackNameFrontend } from './surface-edit-pack-name/frontend'
import type { FrontendModule } from './types'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => ButtonExitBuilder.update({ ...input, model }),
    (model) => EditPackNameFrontend.update({ ...input, model }),
    (model) => ScreenAddPuzzle.update({ ...input, model }),
    (model) => ScreenPuzzleGrid.update({ ...input, model }),
    (model) => ScreenPuzzlePlay.update({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
  )
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([ScreenAddPuzzle.subscriptions(input), ScreenPuzzlePlay.subscriptions(input)])
}

export const TEST_ID_NUMBERLINK_PACK_BUILDER_SCREEN = 'numberlink-pack-builder-screen'

const View: FrontendModule['View'] = (input) => {
  return h(
    'div',
    { class: 'w-full h-full flex flex-col flex-1', 'data-testid': TEST_ID_NUMBERLINK_PACK_BUILDER_SCREEN },
    [h(ViewScreen, input), h(EditPackNameFrontend.ViewSurface, input)],
  )
}

const ViewScreen: FrontendModule['View'] = (input) => {
  switch (input.modelSpace.screen.t) {
    case 'screen-add-puzzle': {
      return h(ScreenAddPuzzle.View, input)
    }

    case 'screen-puzzle-grid': {
      return h(ScreenPuzzleGrid.View, input)
    }

    case 'screen-puzzle': {
      return h(ScreenPuzzlePlay.View, input)
    }
  }
}

export const ScreenPackBuilderFrontend = {
  update,
  subscriptions,
  View,
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-space': {
      return { model: input.model, msgSpace: [input.msg.c] }
    }
    case 'got-msg-out': {
      return { model: input.model, msgOut: [input.msg.c] }
    }
    default: {
      return {
        model: input.model,
      }
    }
  }
}

const ButtonExitBuilder: Pick<FrontendModule, 'update' | 'View'> = {
  update(input) {
    switch (input.msgSpace?.t) {
      case 'screen-pack-builder.user-clicked-back-button': {
        return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] }
      }
    }
    return { model: input.model }
  },

  View(input) {
    return h(Button, {
      renderIconStart: (inputIcons) => h(IconArrowLeft, inputIcons),
      class: 'w-full',
      text: input.ctx.t('app.exit'),
      onClick: () =>
        input.dispatch({
          t: 'got-msg-space',
          c: {
            t: 'screen-pack-builder.user-clicked-back-button',
            userId: input.ctx.currentUser.userId,
          },
        }),
    })
  },
}
