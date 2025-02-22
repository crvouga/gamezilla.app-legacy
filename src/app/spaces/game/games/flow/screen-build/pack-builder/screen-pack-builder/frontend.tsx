import { Sub } from '~/@/sub'
import { Button, IconArrowLeftOnRect } from '~/@/ui'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { PackLoaderFrontend } from '../../../@/pack/pack-loader/frontend'
import { PuzzleLoaderFrontend } from '../../../@/puzzle/puzzle-loader/frontend'
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
  return Sub.batch([ScreenAddPuzzle.subscriptions(input)])
}

const View: FrontendModule['View'] = (input) => {
  return (
    <>
      <ViewScreen {...input} />
      <EditPackNameFrontend.ViewSurface {...input} />
    </>
  )
}

const ViewScreen: FrontendModule['View'] = (input) => {
  switch (input.modelSpace.screen.t) {
    case 'screen-add-puzzle': {
      return <ScreenAddPuzzle.View {...input} />
    }

    case 'screen-puzzle-grid': {
      return <ScreenPuzzleGrid.View {...input} />
    }

    case 'screen-puzzle': {
      return <ScreenPuzzlePlay.View {...input} />
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
    case 'got-pack-loader-msg': {
      return { model: input.model, msgCmd: [PackLoaderFrontend.gotMsg(input.msg.c)] }
    }
    case 'got-puzzle-loader-msg': {
      return { model: input.model, msgCmd: [PuzzleLoaderFrontend.gotMsg(input.msg.c)] }
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
        return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }
      }
    }
    return { model: input.model }
  },

  View(input) {
    return (
      <Button
        renderIconStart={(inputIcons) => <IconArrowLeftOnRect {...inputIcons} />}
        className='w-full'
        text={input.ctx.t('app.exit')}
        onClick={() =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.user-clicked-back-button',
              userId: input.ctx.currentUserId,
            },
          })
        }
      />
    )
  },
}

const updateRecordPack: FrontendModule['update'] = (input) => {
  const hasMsg = input.msgSpace || input.msgCmd || input.msgEvt || input.msgBackend || input.msg
  if (hasMsg && input.modelSpace?.pack) {
    return {
      model: input.model,
      msgCmd: [
        {
          t: 'flow-cmd.add-packs',
          packs: {
            [input.modelSpace.pack.id]: input.modelSpace.pack,
          },
          causedBy: input,
        },
      ],
    }
  }
  return { model: input.model }
}
