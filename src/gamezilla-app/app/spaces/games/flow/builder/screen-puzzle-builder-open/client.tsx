import { Sub } from 'gamezilla-app/@/core'
import { APP_SOUND, playSound } from 'gamezilla-app/app/@/client'
import { GameClientModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-client-v2'
import { FlowPuzzleListClient } from '../../@/puzzle/puzzle-list'
import type { ClientModule } from '../types'
import { CreateNewPuzzleClient } from './create-new-puzzle/client'
import { TopBar } from 'gamezilla-app/app/@/ui'

const update: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => CreateNewPuzzleClient.update({ ...input, model }),
    (model) => updateMain({ ...input, model }),
    (model) => updateLoadPuzzles({ ...input, model })
  )
}

const updateLoadPuzzles: ClientModule['update'] = (input) => {
  if (
    (input.msgCore?.t === 'screen-main-menu.user-clicked-option' && input.msgCore.option === 'puzzles') ||
    input.msgEvt?.t === 'space/synced'
  ) {
    return {
      model: input.model,
      msgCmd: [FlowPuzzleListClient.load()]
    }
  }
  return {
    model: input.model
  }
}

const updateMain: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'screen-puzzle-builder-open.clicked-puzzle-list-item': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)]
      }
    }
  }

  return {
    model: input.model
  }
}

const View: ClientModule['View'] = (input) => {
  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden'>
      <TopBar
        onBack={() =>
          input.dispatch({
            t: 'got-msg-core',
            c: {
              t: 'user-clicked-back-button',
              userId: input.ctx.currentUserId
            }
          })
        }
        ctx={input.ctx}
        title={input.ctx.t('flow.puzzle-builder')}
      />
      <FlowPuzzleListClient.View
        ctx={input.ctx}
        dispatch={(_c) => {}}
        model={{
          ...input.ctx.puzzleList,
          puzzles: input.ctx.puzzles
        }}
        emits={{
          clickedPuzzleItem: (puzzle) =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'screen-puzzle-builder-open.clicked-puzzle-list-item',
                puzzle,
                userId: input.ctx.currentUserId
              }
            })
        }}
        slots={{
          fab: () => <CreateNewPuzzleClient.ViewCreateFab {...input} />
        }}
      />
    </div>
  )
}

const subscriptions: ClientModule['subscriptions'] = (input) => {
  return Sub.batch([CreateNewPuzzleClient.subscriptions(input)])
}

export const ScreenPuzzleBuilderOpenClient = {
  update,
  View,
  subscriptions
}
