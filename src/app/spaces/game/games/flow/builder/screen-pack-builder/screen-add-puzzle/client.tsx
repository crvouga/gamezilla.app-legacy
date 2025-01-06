import { APP_SOUND, playSound, showToast } from '~/app/@/client/cmd'
import { TopBar } from '~/app/@/ui'
import { PuzzleListClient } from '../../../@/puzzle/puzzle-list'
import type { ClientModule } from '../../types'

const update: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
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
const View: ClientModule['View'] = (input) => {
  return (
    <div className='flex h-full max-h-full w-full flex-col overflow-hidden'>
      <TopBar
        ctx={input.ctx}
        title={input.ctx.t('flow.add-puzzle')}
        onBack={() =>
          input.dispatch({
            t: 'got-msg-core',
            c: {
              t: 'screen-pack-builder.user-closed-add-puzzle-screen',
            },
          })
        }
      />
      <div className='h-full max-h-full w-full max-w-full flex-1 overflow-hidden overflow-y-scroll'>
        <PuzzleListClient.View
          ctx={input.ctx}
          dispatch={(_c) => {}}
          model={input.ctx.puzzleList}
          emits={{
            clickedPuzzleItem: (puzzle) =>
              input.dispatch({
                t: 'got-msg-core',
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
