import { APP_SOUND, playSound, showToast } from '~/app/@/frontend/cmd'
import { TopBar } from '~/app/@/ui'
import { PuzzleListFrontend } from '../../../@/puzzle/puzzle-list/frontend'
import type { FrontendModule } from '../../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.user-clicked-add-puzzle-item': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.puzzle-added'))],
      }
    }

    case 'screen-pack-builder.user-closed-add-puzzle-screen': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      }
    }
  }

  return { model: input.model }
}
const View: FrontendModule['View'] = (input) => {
  return (
    <div className='flex h-full max-h-full w-full flex-col overflow-hidden'>
      <TopBar
        ctx={input.ctx}
        title={input.ctx.t('flow.add-puzzle')}
        onBack={() =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.user-closed-add-puzzle-screen',
            },
          })
        }
      />
      <div className='h-full max-h-full w-full max-w-full flex-1 overflow-hidden overflow-y-scroll'>
        <PuzzleListFrontend.View
          ctx={input.ctx}
          dispatch={(_c) => {}}
          model={input.ctx.puzzleList}
          emits={{
            clickedPuzzleItem: (puzzle) =>
              input.dispatch({
                t: 'got-msg-space',
                c: {
                  t: 'screen-pack-builder.user-clicked-add-puzzle-item',
                  puzzle,
                  userId: input.ctx.currentUserId,
                },
              }),
          }}
        />
      </div>
    </div>
  )
}

export const ScreenAddPuzzle = {
  update,
  View,
}
