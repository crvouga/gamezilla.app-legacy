import { APP_SOUND, playSound } from '~/app/@/client'
import { cn, TopBar } from '~/app/@/ui'
import { andThen } from '../../../@/architecture/game-client-v2'
import { LayoutGame } from '../../../@/game/layout-game'
import { FlowPack } from '../../@/pack/pack'
import { PackPuzzlesGridClient } from '../../@/pack/pack-puzzles-grid/client'
import { PackPuzzlesGridUI } from '../../@/pack/pack-puzzles-grid/ui'
import type { ClientModule } from '../types'
import { PlayCore } from '../core'

const update: ClientModule['update'] = (input) => {
  return andThen(
    { model: input.model },
    (model) => updateMain({ ...input, model }),
    (model) => updateLoadPuzzlesForPack({ ...input, model })
  )
}

const updateLoadPuzzlesForPack: typeof update = (input) => {
  if (
    input.msgEvt?.t === 'space/synced' ||
    input.msgCore?.t === 'user-clicked-open-pack-list-item' ||
    input.msgCore?.t === 'user-clicked-exit-puzzle'
  ) {
    const modelCore = input.msgCore
      ? PlayCore.updateCore({ ctx: input.ctx, modelCore: input.modelCore, msgCore: input.msgCore })
      : input.modelCore

    const pack: FlowPack | null = 'flowPack' in modelCore.screen ? modelCore.screen.flowPack : null

    if (!pack) {
      return { model: input.model }
    }

    return {
      model: input.model,
      msgCmd: [PackPuzzlesGridClient.load(pack)]
    }
  }

  return {
    model: input.model
  }
}

const updateMain: typeof update = (input) => {
  switch (input.msgCore?.t) {
    case 'user-clicked-exit-pack-button': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)]
      }
    }

    case 'user-clicked-open-puzzle-grid-item': {
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
  if (input.modelCore.screen.t !== 'screen-select-puzzle') {
    return null
  }
  const flowPack = input.modelCore.screen.flowPack
  const isSpectating = input.ctx.currentUserId !== input.ctx.space.hostId
  return (
    <LayoutGame ctx={input.ctx} isSpectating={isSpectating} className='flex h-full w-full flex-1 flex-col'>
      <TopBar
        ctx={input.ctx}
        onBack={
          isSpectating ? false : () => input.dispatch({ t: 'got-msg-core', c: { t: 'user-clicked-exit-pack-button' } })
        }
        title={input.ctx.t('flow-pack-name', flowPack.name)}
      />
      <div
        className={cn(
          'flex w-full flex-1 flex-col items-center justify-center',
          isSpectating && 'pointer-events-none select-none'
        )}
      >
        <PackPuzzlesGridUI.View
          id='pack-puzzle-grid'
          slideIndex={input.modelCore.screen.slideIndex}
          onSlideIndexChanged={(slideIndex) =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'user-changed-slides',
                slideIndex,
                userId: input.ctx.currentUserId
              }
            })
          }
          puzzleIds={flowPack.puzzleIds}
          renderCell={(inputCell) => {
            if (!inputCell.puzzleId) {
              return <PackPuzzlesGridUI.ViewEmptyCell />
            }

            if (PackPuzzlesGridClient.showLoading(input.ctx.packPuzzleGrid, flowPack.puzzleIds)) {
              return <PackPuzzlesGridUI.ViewLoadingCell />
            }

            const puzzle = input.ctx.puzzles[inputCell.puzzleId]

            if (!puzzle) {
              return (
                <PackPuzzlesGridUI.ViewErrorCell
                  index={inputCell.index}
                  onClick={() =>
                    input.dispatch({
                      t: 'got-msg-core',
                      c: {
                        t: 'user-clicked-open-puzzle-grid-item',
                        flowPuzzle: {
                          t: 'not-found'
                        },
                        puzzleIndex: inputCell.index
                      }
                    })
                  }
                />
              )
            }

            return (
              <PackPuzzlesGridUI.ViewPuzzleCell
                index={inputCell.index}
                onClick={() =>
                  input.dispatch({
                    t: 'got-msg-core',
                    c: {
                      t: 'user-clicked-open-puzzle-grid-item',
                      flowPuzzle: { t: 'got', c: puzzle },
                      puzzleIndex: inputCell.index
                    }
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

export const ScreenSelectPuzzleClient = {
  update,
  View
}
