import { Sub } from '~/@/sub'
import { Button, IconArrowLeftOnRect } from '~/app/@/ui'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { PackDbQueryFrontend } from '../../@/pack/pack-db-query/frontend'
import { PuzzleDbQueryFrontend } from '../../@/puzzle/puzzle-db-query/frontend'
import { DrawerEditPackNameFrontend } from './drawer-edit-pack-name/frontend'
import { ScreenAddPuzzle } from './screen-add-puzzle/frontend'
import { ScreenPuzzlePlay } from './screen-play-puzzle/frontend'
import { ScreenPuzzleGrid } from './screen-puzzle-grid/frontend'
import type { FrontendModule } from './types'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => ButtonExitBuilder.update({ ...input, model }),
    (model) => DrawerEditPackNameFrontend.update({ ...input, model }),
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
      <DrawerEditPackNameFrontend.ViewDrawer {...input} />
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
    case 'got-pack-db-query-msg': {
      return { model: input.model, msgCmd: [PackDbQueryFrontend.gotMsg(input.msg.c)] }
    }
    case 'got-puzzle-db-query-msg': {
      return { model: input.model, msgCmd: [PuzzleDbQueryFrontend.gotMsg(input.msg.c)] }
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
    return { model: input.model }
  },

  View(input) {
    return (
      <Button
        iconStart={(inputIcons) => <IconArrowLeftOnRect {...inputIcons} />}
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
