import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { cn, TopBar } from '~/app/@/ui'
import { LayoutGame } from '../../../@/ui/layout-game'
import { PackPuzzleGridUI } from '../../@/pack/pack-puzzle-grid-ui'
import { PuzzleDbQueryFrontend } from '../../@/puzzle/puzzle-db-query/frontend'
import type { FrontendModule, ModelSpace } from '../types'
import { PuzzleDbQuery } from '../../@/puzzle/puzzle-db/query'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-clicked-exit-screen-open-pack': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      }
    }

    case 'user-clicked-open-screen-play-puzzle': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }
  }

  return { model: input.model }
}

const toQuery = (input: { modelSpace: ModelSpace }): PuzzleDbQuery | null => {
  if (input.modelSpace.screen.t !== 'screen-select-puzzle') {
    return null
  }
  return {
    order: {},
    pagination: { limit: 25, offset: 0 },
    where: {
      puzzleId: {
        in: input.modelSpace.screen.pack.puzzleIds,
      },
    },
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return PuzzleDbQueryFrontend.watch(input.ctx, toQuery(input), (c) => ({ t: 'got-puzzle-db-query-msg', c }))
}

const View: FrontendModule['View'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-select-puzzle') {
    return null
  }
  const pack = input.modelSpace.screen.pack
  const isSpectating = input.ctx.currentUserId !== input.ctx.space.hostId
  return (
    <LayoutGame ctx={input.ctx} isSpectating={isSpectating} className='flex h-full w-full flex-1 flex-col'>
      <TopBar
        ctx={input.ctx}
        onBack={
          isSpectating
            ? false
            : () => input.dispatch({ t: 'got-msg-space', c: { t: 'user-clicked-exit-screen-open-pack' } })
        }
        title={input.ctx.t('flow-pack-name', pack.name)}
      />

      <div
        className={cn(
          'flex w-full flex-1 flex-col items-center justify-center',
          isSpectating && 'pointer-events-none select-none',
        )}
      >
        <PackPuzzleGridUI.View
          id='pack-puzzle-grid'
          slideIndex={input.modelSpace.screen.slideIndex}
          onSlideIndexChanged={(slideIndex) =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'user-changed-slides',
                slideIndex,
                userId: input.ctx.currentUserId,
              },
            })
          }
          puzzleIds={pack.puzzleIds}
          renderCell={(inputCell) => {
            if (!inputCell.puzzleId) {
              return <PackPuzzleGridUI.ViewEmptyCell />
            }

            const puzzle = input.ctx.puzzles[inputCell.puzzleId]

            return (
              <PackPuzzleGridUI.ViewPuzzleCell
                index={inputCell.index}
                onClick={() =>
                  input.dispatch({
                    t: 'got-msg-space',
                    c: {
                      t: 'user-clicked-open-screen-play-puzzle',
                      flowPuzzle: puzzle ? { t: 'got', c: puzzle } : { t: 'not-found' },
                      puzzleIndex: inputCell.index,
                    },
                  })
                }
              />
            )
          }}
        />
      </div>
    </LayoutGame>
  )
}

export const ScreenOpenPuzzleFrontend = {
  update,
  subscriptions,
  View,
}
