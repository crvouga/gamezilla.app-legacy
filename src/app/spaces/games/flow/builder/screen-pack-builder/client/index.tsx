import { APP_SOUND, playSound, showToast } from '~/app/@/client'
import {
  Button,
  Drawer,
  IconArrowLeftOnRect,
  IconChevronLeft,
  IconChevronRight,
  IconDeleteForever,
  IconEllipsisVertical,
  ListItemButton,
  TopBar
} from '~/app/@/ui'
import { ViewBottomButtonBar, ViewBottomButtonBarAction } from '~/app/@/ui/actions'
import { GameClientModule } from '~/app/spaces/games/@/architecture/game-client-v2'
import { FlowPlay } from '../../../@/flow/flow-play'
import { FlowLayout } from '../../../@/flow/flow-ui/flow-layout'
import { PackPuzzlesGridClient } from '../../../@/pack/pack-puzzles-grid/client'
import { PackPuzzlesGridUI } from '../../../@/pack/pack-puzzles-grid/ui'
import { FlowPuzzleResult } from '../../../@/puzzle-result'
import { FlowPuzzle } from '../../../@/puzzle/puzzle'
import { PuzzleListClient } from '../../../@/puzzle/puzzle-list'
import type { ClientModule } from '../../types'
import { ScreenPackBuilderCore } from '../core'
import { EditPackNameClient } from '../edit-pack-name/client'

//
//
//
//
//
//

const ButtonExitBuilder: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    return { model: input.model }
  },

  View(input) {
    return (
      <Button
        iconStart={(inputIcons) => <IconArrowLeftOnRect {...inputIcons} />}
        className='w-full'
        text={input.ctx.t('app.exit')}
        onClick={() =>
          input.dispatch({
            t: 'got-msg-core',
            c: {
              t: 'user-clicked-back-button',
              userId: input.ctx.currentUserId
            }
          })
        }
      />
    )
  }
}

//
//
//
//
//
//
//
//

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

//
//
//
//
//
//

const ScreenAddPuzzle: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    switch (input.msgCore?.t) {
      case 'screen-pack-builder.user-clicked-add-puzzle-item': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.puzzle-added'))]
        }
      }

      case 'screen-pack-builder.user-closed-add-puzzle-screen': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.navBackwardMin)]
        }
      }
    }

    return { model: input.model }
  },

  View(input) {
    return (
      <div className='flex h-full max-h-full w-full flex-col overflow-hidden'>
        <TopBar
          ctx={input.ctx}
          title={input.ctx.t('flow.add-puzzle')}
          onBack={() =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'screen-pack-builder.user-closed-add-puzzle-screen'
              }
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
                    userId: input.ctx.currentUserId
                  }
                })
            }}
          />
        </div>
      </div>
    )
  }
}

//
//
//
//
//
//

const ScreenPuzzleGrid: Pick<ClientModule, 'update' | 'View'> = {
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
          input.msgEvt?.t === 'space/synced' ||
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
              onSlideIndexChanged={(newSlideIndex) =>
                input.dispatch({
                  t: 'got-msg-core',
                  c: { t: 'screen-pack-builder.user-changed-slide', newSlideIndex, userId: input.ctx.currentUserId }
                })
              }
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

//
//
//
//
//
//
//

export const ScreenPuzzleMore: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    switch (input.msgCore?.t) {
      case 'screen-pack-builder.puzzle-screen.user-closed-more-drawer':
      case 'screen-pack-builder.puzzle-screen.user-clicked-more-button': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.tap)]
        }
      }
    }

    return { model: input.model }
  },

  View(input) {
    const { dispatch, ctx, modelCore } = input

    if (!modelCore.screenPackBuilder) {
      return null
    }

    const screen = modelCore.screenPackBuilder.screen

    if (screen.t !== 'screen-puzzle') {
      return null
    }

    return (
      <>
        <ViewBottomButtonBarAction
          icon={(input) => <IconEllipsisVertical {...input} />}
          label={ctx.t('app.more')}
          onClick={() =>
            dispatch({
              t: 'got-msg-core',
              c: {
                t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
                userId: ctx.currentUserId
              }
            })
          }
        />
        <Drawer
          id='screen-puzzle-more'
          open={screen.opened === 'more'}
          onClose={() =>
            dispatch({
              t: 'got-msg-core',
              c: {
                t: 'screen-pack-builder.puzzle-screen.user-closed-more-drawer',
                userId: ctx.currentUserId
              }
            })
          }
          position='bottom'
        >
          <ListItemButton
            icon={(inputIcon) => <IconDeleteForever {...inputIcon} />}
            label={input.ctx.t('flow.remove-from-pack')}
            color='danger'
            onClick={() =>
              dispatch({
                t: 'got-msg-core',
                c: {
                  t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
                  userId: ctx.currentUserId,
                  puzzleIndex: screen.puzzleIndex
                }
              })
            }
          />
          <div className='w-full p-2' />
        </Drawer>
      </>
    )
  }
}

export const ScreenPuzzlePlay: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    switch (input.msgCore?.t) {
      case 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.navBackwardMin)]
        }
      }

      case 'screen-pack-builder.got-flow-play-msg': {
        const flowPlay =
          input.modelCore.screenPackBuilder?.screen.t === 'screen-puzzle'
            ? input.modelCore.screenPackBuilder.screen.play
            : null

        if (!flowPlay) {
          return { model: input.model }
        }

        const flowPuzzle: FlowPuzzle | null =
          input.modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' &&
          input.modelCore.screenPackBuilder.screen.puzzleResult.t === 'got'
            ? input.modelCore.screenPackBuilder.screen.puzzleResult.c
            : null

        if (!flowPuzzle) {
          return { model: input.model }
        }

        const updated = FlowPlay.update({
          ctx: FlowPlay.initCtx({ flowPuzzle }),
          model: flowPlay,
          msg: input.msgCore.c
        })

        return {
          model: input.model,
          msgCmd: FlowPlay.eventsToClientCmd(input.ctx, updated.events)
        }
      }

      case 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.tap)]
        }
      }

      case 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.tap)]
        }
      }

      case 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.puzzle-removed'))]
        }
      }
    }

    return { model: input.model }
  },

  View(input) {
    if (!input.modelCore.screenPackBuilder) {
      return null
    }

    if (input.modelCore.screenPackBuilder.screen.t !== 'screen-puzzle') {
      return null
    }

    const pack = input.modelCore.screenPackBuilder.pack
    const screen = input.modelCore.screenPackBuilder.screen

    const previousPuzzleId = pack.puzzleIds[screen.puzzleIndex - 1]
    const previousPuzzle = previousPuzzleId ? input.ctx.puzzles[previousPuzzleId] : null
    const canGoPrevious = Boolean(previousPuzzle)

    const nextPuzzleId = pack.puzzleIds[screen.puzzleIndex + 1]
    const nextPuzzle = nextPuzzleId ? input.ctx.puzzles[nextPuzzleId] : null
    const canGoNext = Boolean(nextPuzzle)

    return (
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <TopBar
          ctx={input.ctx}
          title={input.ctx.t('flow.level', screen.puzzleIndex + 1)}
          subtitle={
            screen.puzzleResult.t === 'got' ? input.ctx.t('flow-puzzle-name', screen.puzzleResult.c.name) : null
          }
          onBack={() =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle',
                userId: input.ctx.currentUserId
              }
            })
          }
        />

        <FlowLayout
          top={null}
          middle={
            screen.puzzleResult.t === 'got' && screen.play ? (
              <FlowPlay.View
                dispatch={(c) =>
                  input.dispatch({
                    t: 'got-msg-core',
                    c: {
                      t: 'screen-pack-builder.got-flow-play-msg',
                      c
                    }
                  })
                }
                flow={screen.puzzleResult.c.flow}
                model={screen.play}
                showSolvedAnimation
              />
            ) : (
              <FlowPuzzleResult.ViewNotFound ctx={input.ctx} />
            )
          }
          bottom={
            <ViewBottomButtonBar>
              <ViewBottomButtonBarAction
                icon={(input) => <IconChevronLeft {...input} />}
                label={input.ctx.t('app.prev')}
                disabled={!canGoPrevious}
                onClick={() => {
                  input.dispatch({
                    t: 'got-msg-core',
                    c: {
                      t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
                      userId: input.ctx.currentUserId,
                      previousPuzzleResult: previousPuzzle ? { t: 'got', c: previousPuzzle } : { t: 'not-found' }
                    }
                  })
                }}
              />

              <ViewBottomButtonBarAction
                icon={(input) => <IconChevronRight {...input} />}
                label={input.ctx.t('app.next')}
                disabled={!canGoNext}
                onClick={() => {
                  input.dispatch({
                    t: 'got-msg-core',
                    c: {
                      t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
                      userId: input.ctx.currentUserId,
                      nextPuzzleResult: nextPuzzle ? { t: 'got', c: nextPuzzle } : { t: 'not-found' }
                    }
                  })
                }}
              />

              <ScreenPuzzleMore.View {...input} />
            </ViewBottomButtonBar>
          }
        />
      </div>
    )
  }
}

//
//
//
//
//
//

const EditPackName: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    if (!input.modelCore.screenPackBuilder) {
      return {
        model: input.model
      }
    }
    const updated = EditPackNameClient.update({
      ...input,
      modelCore: input.modelCore.screenPackBuilder.editPackName,
      msg: input.msgCore?.t === 'got-edit-pack-name-msg' ? input.msgCore.c : null,
      msgCore: input.msgCore?.t === 'got-edit-pack-name-msg' ? { ...input.msgCore, ...input.msgCore.c } : null
    })
    return {
      model: input.model,
      msgCore: (updated.msgCore ?? []).map((c) => ({
        c,
        t: 'got-edit-pack-name-msg'
      }))
    }
  },
  View(input) {
    if (!input.modelCore.screenPackBuilder) {
      return null
    }
    return (
      <>
        <EditPackNameClient.ViewDrawer
          ctx={input.ctx}
          model={input.modelCore.screenPackBuilder.editPackName}
          modelCore={input.modelCore.screenPackBuilder.editPackName}
          dispatch={(c) =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'got-edit-pack-name-msg',
                c
              }
            })
          }
        />
      </>
    )
  }
}

const updateRecordPack: ClientModule['update'] = (input) => {
  const hasMsg = input.msgCore || input.msgCmd || input.msgEvt || input.msgServer || input.msg
  if (hasMsg && input.modelCore.screenPackBuilder?.pack) {
    return {
      model: input.model,
      msgCmd: [
        {
          t: 'flow.new-packs',
          packs: {
            [input.modelCore.screenPackBuilder.pack.id]: input.modelCore.screenPackBuilder.pack
          },
          causedBy: input
        }
      ]
    }
  }
  return { model: input.model }
}

export const ScreenPackBuilderClient: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    return GameClientModule.andThen(
      {
        model: input.model
      },
      (model) => ButtonExitBuilder.update({ ...input, model }),
      (model) => ScreenAddPuzzle.update({ ...input, model }),
      (model) => ButtonAddPuzzle.update({ ...input, model }),
      (model) => ScreenPuzzleGrid.update({ ...input, model }),
      (model) => ScreenPuzzlePlay.update({ ...input, model }),
      (model) => ScreenPuzzleMore.update({ ...input, model }),
      (model) => EditPackName.update({ ...input, model }),
      (model) => updateRecordPack({ ...input, model })
    )
  },

  View(input) {
    switch (input.modelCore.screenPackBuilder?.screen.t) {
      case 'screen-add-puzzle': {
        return <ScreenAddPuzzle.View {...input} />
      }

      case 'screen-puzzle-grid': {
        return <ScreenPuzzleGrid.View {...input} />
      }

      case 'screen-puzzle': {
        return <ScreenPuzzlePlay.View {...input} />
      }

      default: {
        return null
      }
    }
  }
}
