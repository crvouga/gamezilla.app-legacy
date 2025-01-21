import { cn, TopBar } from '~/app/@/ui'
import { GameFrontendModule } from '../../../@/architecture/game-frontend-v2'
import { LayoutGame } from '../../../@/ui/layout-game'
import { Pack } from '../../@/pack/pack'
import { PackPuzzlesGridFrontend } from '../../@/pack/pack-puzzles-grid/frontend'
import { PackPuzzlesGridUI } from '../../@/pack/pack-puzzles-grid/ui'
import type { FrontendModule } from '../types'
import { PlaySpace } from '../space'
import { playSound, APP_SOUND } from '~/app/@/frontend/cmd'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => updateMain({ ...input, model }),
    (model) => updateLoadPuzzlesForPack({ ...input, model }),
  )
}

const updateLoadPuzzlesForPack: typeof update = (input) => {
  if (
    input.msgEvt?.t === 'space-evt.synced' ||
    input.msgSpace?.t === 'user-clicked-open-pack-list-item' ||
    input.msgSpace?.t === 'user-clicked-exit-puzzle'
  ) {
    const modelSpace = input.msgSpace
      ? PlaySpace.updateSpace({ ctx: input.ctx, modelSpace: input.modelSpace, msgSpace: input.msgSpace })
      : input.modelSpace

    const pack: Pack | null = 'flowPack' in modelSpace.screen ? modelSpace.screen.flowPack : null

    if (!pack) {
      return { model: input.model }
    }

    return {
      model: input.model,
      msgCmd: [PackPuzzlesGridFrontend.load(pack)],
    }
  }

  return {
    model: input.model,
  }
}

const updateMain: typeof update = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-clicked-exit-pack-button': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      }
    }

    case 'user-clicked-open-puzzle-grid-item': {
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
  if (input.modelSpace.screen.t !== 'screen-select-puzzle') {
    return null
  }
  const flowPack = input.modelSpace.screen.flowPack
  const isSpectating = input.ctx.currentUserId !== input.ctx.space.hostId
  return (
    <LayoutGame ctx={input.ctx} isSpectating={isSpectating} className='flex h-full w-full flex-1 flex-col'>
      <TopBar
        ctx={input.ctx}
        onBack={
          isSpectating ? false : () => input.dispatch({ t: 'got-msg-space', c: { t: 'user-clicked-exit-pack-button' } })
        }
        title={input.ctx.t('flow-pack-name', flowPack.name)}
      />
      <div
        className={cn(
          'flex w-full flex-1 flex-col items-center justify-center',
          isSpectating && 'pointer-events-none select-none',
        )}
      >
        <PackPuzzlesGridUI.View
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
          puzzleIds={flowPack.puzzleIds}
          renderCell={(inputCell) => {
            if (!inputCell.puzzleId) {
              return <PackPuzzlesGridUI.ViewEmptyCell />
            }

            if (PackPuzzlesGridFrontend.shouldShowLoading(input.ctx.packPuzzleGrid, flowPack.puzzleIds)) {
              return <PackPuzzlesGridUI.ViewLoadingCell />
            }

            const puzzle = input.ctx.puzzles[inputCell.puzzleId]

            return (
              <PackPuzzlesGridUI.ViewPuzzleCell
                index={inputCell.index}
                onClick={() =>
                  input.dispatch({
                    t: 'got-msg-space',
                    c: {
                      t: 'user-clicked-open-puzzle-grid-item',
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
  View,
}
