import { Sub } from '~/@/sub'
import { Button } from '~/@/ui/button'
import { IconArrowLeft } from '~/@/ui/icon'
import { v } from '~/@/vdom/v'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { AddPacksCmd } from '../../../@/frontend/add-packs-cmd.$msg'
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
    (model) => updateRecordPack({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
  )
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([ScreenAddPuzzle.subscriptions(input), ScreenPuzzlePlay.subscriptions(input)])
}

const View: FrontendModule['View'] = (input) => {
  return v('div', {}, [v(ViewScreen, input), v(EditPackNameFrontend.ViewSurface, input)])
}

const ViewScreen: FrontendModule['View'] = (input) => {
  switch (input.modelSpace.screen.t) {
    case 'screen-add-puzzle': {
      return v(ScreenAddPuzzle.View, input)
    }

    case 'screen-puzzle-grid': {
      return v(ScreenPuzzleGrid.View, input)
    }

    case 'screen-puzzle': {
      return v(ScreenPuzzlePlay.View, input)
    }
  }
}

export const ScreenPackBuilderFrontend: Pick<FrontendModule, 'update' | 'View' | 'subscriptions'> = {
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
    return v(Button, {
      renderIconStart: (inputIcons) => v(IconArrowLeft, inputIcons),
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

const updateRecordPack: FrontendModule['update'] = (input) => {
  if (!AddPacksCmd.is(input.msgIn) && input.modelSpace?.pack) {
    return {
      model: input.model,
      msgOut: [
        AddPacksCmd.init(
          {
            [input.modelSpace.pack.id]: input.modelSpace.pack,
          },
          input,
        ),
      ],
    }
  }
  return { model: input.model }
}
