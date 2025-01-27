import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { IconGamepad, TopBar } from '~/app/@/ui'
import { LayoutGameCoverArtHeader } from '../../../@/ui/layout-game-cover-art-header'
import { ViewUsersInSpaceList } from '../../../@/ui/users-in-space-list'
import { PackPuzzleGridUI } from '../../@/pack/pack-puzzle-grid-ui'
import { PuzzleDbQueryFrontend } from '../../@/puzzle/puzzle-db-query/frontend'
import { PuzzleDbQuery } from '../../@/puzzle/puzzle-db/query'
import type { FrontendModule, ModelSpace } from '../types'

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

  if (isSpectating) {
    return (
      <LayoutGameCoverArtHeader
        ctx={input.ctx}
        onBack={false}
        title={input.ctx.t('flow.play')}
        renderCoverArt={(input) => (
          <div {...input}>
            <div className='h-full w-full p-4'>
              <IconGamepad className='h-full w-full' />
            </div>
          </div>
        )}
        renderContent={() => (
          <ViewUsersInSpaceList
            onOpenUserDetails={(userId) =>
              input.dispatch({ t: 'game-main-menu.clicked-open-user-details-button', userId })
            }
            ctx={input.ctx}
          />
        )}
      />
    )
  }

  return (
    <div className='flex h-full w-full flex-1 flex-col'>
      <TopBar
        ctx={input.ctx}
        onBack={() =>
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'user-clicked-exit-screen-open-pack', userId: input.ctx.currentUserId },
          })
        }
        title={input.ctx.t('flow-pack-name', pack.name)}
      />
      <div className='flex w-full flex-1 flex-col items-center justify-center'>
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
          onClickPuzzleCell={({ puzzleIndex, puzzleId }) => {
            const puzzle = input.ctx.puzzles[puzzleId]
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'user-clicked-open-screen-play-puzzle',
                puzzle: puzzle ? { t: 'got', c: puzzle } : { t: 'not-found' },
                puzzleIndex,
                userId: input.ctx.currentUserId,
              },
            })
          }}
        />
      </div>
    </div>
  )
}

export const ScreenOpenPuzzleFrontend = {
  update,
  subscriptions,
  View,
}
