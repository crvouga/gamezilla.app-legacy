import { APP_SOUND, playSound } from '~/app/@/client/cmd'
import { TopBar } from '~/app/@/ui'
import { GameClientModule } from '~/app/spaces/game/games/@/architecture/game-client-v2'
import { PackPuzzlesGridClient } from '../../../@/pack/pack-puzzles-grid/client'
import { PackPuzzlesGridUI } from '../../../@/pack/pack-puzzles-grid/ui'
import type { ClientModule } from '../../types'
import { ScreenPackBuilderCore } from '../core'

export const ScreenPuzzleGrid: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    return GameClientModule.andThen(
      { model: input.model },
      (model) => {
        switch (input.msgCore?.t) {
          case 'screen-pack-builder.user-clicked-pack-item': {
            return {
              model,
              msgCmd: [playSound(APP_SOUND.navForwardMin)]
            }
          }
          default: {
            return { model }
          }
        }
      },
      (model) => {
        if (
          input.msgEvt?.t === 'space-evt.synced' ||
          input.msgCore?.t === 'screen-pack-builder-open.user-clicked-pack-item'
        ) {
          const modelCore = input.msgCore
            ? ScreenPackBuilderCore.update({ ctx: input.ctx, modelCore: input.modelCore, msgCore: input.msgCore })
            : input.modelCore

          const pack = modelCore.screenPackBuilder?.pack ?? null

          if (!pack) {
            return { model }
          }

          return {
            model,
            msgCmd: [PackPuzzlesGridClient.load(pack)]
          }
        }

        return { model }
      }
    )
  },
  View(input) {
    const packBuilder = input.modelCore.screenPackBuilder

    if (!packBuilder) {
      return null
    }
    return (
      <div className='flex w-full flex-1 flex-col items-center justify-center'>
        <div className='flex w-full flex-1 flex-col'>
          <TopBar
            ctx={input.ctx}
            onBack={() =>
              input.dispatch({
                t: 'got-msg-core',
                c: {
                  t: 'user-clicked-back-button',
                  userId: input.ctx.currentUserId
                }
              })
            }
            title={input.ctx.t('flow-pack-name', packBuilder.pack.name)}
          />
          <div className='flex w-full flex-1 flex-col items-center justify-center'>
            <PackPuzzlesGridUI.View
              id={packBuilder.pack.id}
              slideIndex={ScreenPackBuilderCore.toSlideIndex(packBuilder)}
              puzzleIds={packBuilder.pack.puzzleIds}
              onSlideIndexChanged={(newSlideIndex) => {
                input.dispatch({
                  t: 'got-msg-core',
                  c: { t: 'screen-pack-builder.user-changed-slide', newSlideIndex, userId: input.ctx.currentUserId }
                })
              }}
              renderCell={(inputCell) => {
                if (inputCell.index === packBuilder.pack.puzzleIds.length) {
                  return <ButtonAddPuzzle.View {...input} />
                }

                if (!inputCell.puzzleId) {
                  return <PackPuzzlesGridUI.ViewEmptyCell />
                }

                if (PackPuzzlesGridClient.shouldShowLoading(input.ctx.packPuzzleGrid, packBuilder.pack.puzzleIds)) {
                  return <PackPuzzlesGridUI.ViewLoadingCell />
                }

                const puzzleId = packBuilder.pack.puzzleIds[inputCell.index]

                const puzzle = puzzleId ? input.ctx.puzzles[puzzleId] : null

                return (
                  <PackPuzzlesGridUI.ViewPuzzleCell
                    onClick={() =>
                      input.dispatch({
                        t: 'got-msg-core',
                        c: {
                          t: 'screen-pack-builder.user-clicked-pack-item',
                          puzzleResult: puzzle ? { t: 'got', c: puzzle } : { t: 'not-found' },
                          puzzleIndex: inputCell.index
                        }
                      })
                    }
                    index={inputCell.index}
                  />
                )
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}

const ButtonAddPuzzle: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    switch (input.msgCore?.t) {
      case 'screen-pack-builder.user-opened-add-puzzle-screen': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.navForwardMin)]
        }
      }
    }
    return { model: input.model }
  },

  View(input) {
    return (
      <PackPuzzlesGridUI.ViewAddCell
        onClick={() =>
          input.dispatch({
            t: 'got-msg-core',
            c: {
              t: 'screen-pack-builder.user-opened-add-puzzle-screen',
              userId: input.ctx.currentUserId
            }
          })
        }
      />
    )
  }
}
