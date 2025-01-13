import { Sub } from '~/@/sub'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { TopBar } from '~/app/@/ui'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { PuzzleListFrontend } from '../../@/puzzle/puzzle-list/frontend'
import type { FrontendModule } from '../types'
import { CreateNewPuzzleFrontend } from './create-new-puzzle/frontend'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => CreateNewPuzzleFrontend.update({ ...input, model }),
    (model) => updateMain({ ...input, model }),
    (model) => updateLoadPuzzles({ ...input, model }),
  )
}

const updateLoadPuzzles: FrontendModule['update'] = (input) => {
  if (
    (input.msgSpace?.t === 'flow.builder.screen-main-menu.user-clicked-option' &&
      input.msgSpace.option === 'puzzle-builder') ||
    input.msgEvt?.t === 'space-evt.synced'
  ) {
    return {
      model: input.model,
      msgCmd: [PuzzleListFrontend.load()],
    }
  }
  return {
    model: input.model,
  }
}

const updateMain: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-puzzle-builder-open.clicked-puzzle-list-item': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }
  }

  return {
    model: input.model,
  }
}

const View: FrontendModule['View'] = (input) => {
  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden'>
      <TopBar
        onBack={() =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'user-clicked-back-button',
              userId: input.ctx.currentUserId,
            },
          })
        }
        ctx={input.ctx}
        title={input.ctx.t('flow.puzzle-builder')}
      />
      <PuzzleListFrontend.View
        ctx={input.ctx}
        dispatch={(_c) => {}}
        model={input.ctx.puzzleList}
        emits={{
          clickedPuzzleItem: (puzzle) =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'screen-puzzle-builder-open.clicked-puzzle-list-item',
                puzzle,
                userId: input.ctx.currentUserId,
              },
            }),
        }}
        slots={{
          fab: () => <CreateNewPuzzleFrontend.ViewCreateFab {...input} />,
        }}
      />
    </div>
  )
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([CreateNewPuzzleFrontend.subscriptions(input)])
}

export const ScreenPuzzleBuilderOpenFrontend = {
  update,
  View,
  subscriptions,
}
