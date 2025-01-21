import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { TopBar } from '~/app/@/ui'
import { PackPuzzleGridUI } from '../../../@/pack/pack-puzzle-grid-ui'
import type { FrontendModule } from '../types'
import { ScreenPackBuilderSpace } from '../space'

export const ScreenPuzzleGrid: Pick<FrontendModule, 'update' | 'View'> = {
  update(input) {
    switch (input.msgSpace?.t) {
      case 'screen-pack-builder.user-clicked-pack-item': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.navForwardMin)],
        }
      }
      default: {
        return { model: input.model }
      }
    }
  },
  View(input) {
    const packBuilder = input.modelSpace

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
                t: 'got-msg-space',
                c: {
                  t: 'screen-pack-builder.user-clicked-back-button',
                  userId: input.ctx.currentUserId,
                },
              })
            }
            title={input.ctx.t('flow-pack-name', packBuilder.pack.name)}
          />
          <div className='flex w-full flex-1 flex-col items-center justify-center'>
            <PackPuzzleGridUI.View
              id={packBuilder.pack.id}
              slideIndex={ScreenPackBuilderSpace.toSlideIndex(packBuilder)}
              puzzleIds={packBuilder.pack.puzzleIds}
              onSlideIndexChanged={(newSlideIndex) => {
                input.dispatch({
                  t: 'got-msg-space',
                  c: { t: 'screen-pack-builder.user-changed-slide', newSlideIndex, userId: input.ctx.currentUserId },
                })
              }}
              renderCell={(inputCell) => {
                if (inputCell.index === packBuilder.pack.puzzleIds.length) {
                  return <ButtonAddPuzzle.View {...input} />
                }

                if (!inputCell.puzzleId) {
                  return <PackPuzzleGridUI.ViewEmptyCell />
                }

                // return <PackPuzzlesGridUI.ViewLoadingCell />

                const puzzleId = packBuilder.pack.puzzleIds[inputCell.index]

                const puzzle = puzzleId ? input.ctx.puzzles[puzzleId] : null

                return (
                  <PackPuzzleGridUI.ViewPuzzleCell
                    onClick={() =>
                      input.dispatch({
                        t: 'got-msg-space',
                        c: {
                          t: 'screen-pack-builder.user-clicked-pack-item',
                          puzzleResult: puzzle ? { t: 'got', c: puzzle } : { t: 'not-found' },
                          puzzleIndex: inputCell.index,
                        },
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
  },
}

const ButtonAddPuzzle: Pick<FrontendModule, 'update' | 'View'> = {
  update(input) {
    switch (input.msgSpace?.t) {
      case 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.navForwardMin)],
        }
      }
    }
    return { model: input.model }
  },

  View(input) {
    return (
      <PackPuzzleGridUI.ViewAddCell
        onClick={() =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button',
              userId: input.ctx.currentUserId,
            },
          })
        }
      />
    )
  },
}
