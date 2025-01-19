import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { TopBar } from '~/app/@/ui'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { PackPuzzlesGridFrontend } from '../../../@/pack/pack-puzzles-grid/frontend'
import { PackPuzzlesGridUI } from '../../../@/pack/pack-puzzles-grid/ui'
import type { FrontendModule } from '../../types'
import { ScreenPackBuilderSpace } from '../space'

export const ScreenPuzzleGrid: Pick<FrontendModule, 'update' | 'View'> = {
  update(input) {
    return GameFrontendModule.andThen(
      { model: input.model },
      (model) => {
        switch (input.msgSpace?.t) {
          case 'screen-pack-builder.user-clicked-pack-item': {
            return {
              model,
              msgCmd: [playSound(APP_SOUND.navForwardMin)],
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
          input.msgSpace?.t === 'screen-pack-builder-open.user-clicked-pack-item'
        ) {
          const modelSpace = input.msgSpace
            ? ScreenPackBuilderSpace.update({ ctx: input.ctx, modelSpace: input.modelSpace, msgSpace: input.msgSpace })
            : input.modelSpace

          const pack = modelSpace.screenPackBuilder?.pack ?? null

          if (!pack) {
            return { model }
          }

          return {
            model,
            msgCmd: [PackPuzzlesGridFrontend.load(pack)],
          }
        }

        return { model }
      },
    )
  },
  View(input) {
    const packBuilder = input.modelSpace.screenPackBuilder

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
                  t: 'user-clicked-back-button',
                  userId: input.ctx.currentUserId,
                },
              })
            }
            title={input.ctx.t('flow-pack-name', packBuilder.pack.name)}
          />
          <div className='flex w-full flex-1 flex-col items-center justify-center'>
            <PackPuzzlesGridUI.View
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
                  return <PackPuzzlesGridUI.ViewEmptyCell />
                }

                if (PackPuzzlesGridFrontend.shouldShowLoading(input.ctx.packPuzzleGrid, packBuilder.pack.puzzleIds)) {
                  return <PackPuzzlesGridUI.ViewLoadingCell />
                }

                const puzzleId = packBuilder.pack.puzzleIds[inputCell.index]

                const puzzle = puzzleId ? input.ctx.puzzles[puzzleId] : null

                return (
                  <PackPuzzlesGridUI.ViewPuzzleCell
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
      <PackPuzzlesGridUI.ViewAddCell
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
