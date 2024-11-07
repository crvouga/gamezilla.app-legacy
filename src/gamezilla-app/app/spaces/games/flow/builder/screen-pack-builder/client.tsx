import { Eff, Sub } from '@/core'
import { APP_SOUND, playSound, showToast } from 'gamezilla-app/app/@/client'
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
} from 'gamezilla-app/app/@/ui'
import { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import { GameClientModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-client-v2'
import { FlowPlay } from '../../@/flow/flow-play'
import { FlowLayout } from '../../@/flow/flow-ui/flow-layout'
import { PackPuzzlesGridUI } from '../../@/pack/pack-puzzles-grid/ui'
import { PackPuzzlesGridClient } from '../../@/pack/pack-puzzles-grid/client'
import { PuzzleListClient } from '../../@/puzzle/puzzle-list'
import type { ClientModule } from '../types'
import { ScreenPackBuilderCore } from './core'
import { EditPackNameClient } from './edit-pack-name/client'
import { ViewBottomButtonBar, ViewBottomButtonBarAction } from 'gamezilla-app/app/@/ui/actions'

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
        renderIconStart={(inputIcons) => <IconArrowLeftOnRect {...inputIcons} />}
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
    switch (input.msgCore?.t) {
      case 'screen-pack-builder.user-clicked-pack-item': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.navForwardMin)]
        }
      }
    }

    return { model: input.model }
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
                  c: {
                    t: 'screen-pack-builder.user-changed-slide',
                    newSlideIndex,
                    userId: input.ctx.currentUserId
                  }
                })
              }
              renderCell={(inputCell) => {
                const puzzleId = packBuilder.pack.puzzleIds[inputCell.index]

                if (puzzleId) {
                  const puzzle = puzzleId ? input.ctx.puzzles[puzzleId] : null

                  if (!puzzle) {
                    return <PackPuzzlesGridUI.ViewLoadingCell />
                  }

                  return (
                    <PackPuzzlesGridUI.ViewPuzzleCell
                      onClick={() =>
                        input.dispatch({
                          t: 'got-msg-core',
                          c: {
                            t: 'screen-pack-builder.user-clicked-pack-item',
                            puzzle,
                            puzzleIndex: inputCell.index
                          }
                        })
                      }
                      index={inputCell.index}
                    />
                  )
                }

                if (inputCell.index === packBuilder.pack.puzzleIds.length) {
                  return <ButtonAddPuzzle.View {...input} />
                }

                return <PackPuzzlesGridUI.ViewEmptyCell />
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
        const flowPuzzle =
          input.modelCore.screenPackBuilder?.screen.t === 'screen-puzzle'
            ? input.modelCore.screenPackBuilder.screen.puzzle
            : null

        if (!flowPlay || !flowPuzzle) {
          return { model: input.model }
        }
        const updated = FlowPlay.update({
          ctx: FlowPlay.initCtx({
            flowPuzzle
          }),
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
          subtitle={input.ctx.t('flow-puzzle-name', screen.puzzle.name)}
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
              flow={screen.puzzle.flow}
              model={screen.play}
              showSolvedAnimation
            />
          }
          bottom={
            <ViewBottomButtonBar>
              <ViewBottomButtonBarAction
                icon={(input) => <IconChevronLeft {...input} />}
                label={input.ctx.t('app.prev')}
                disabled={!canGoPrevious}
                onClick={() => {
                  if (previousPuzzle) {
                    input.dispatch({
                      t: 'got-msg-core',
                      c: {
                        t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
                        userId: input.ctx.currentUserId,
                        previousPuzzle
                      }
                    })
                  }
                }}
              />

              <ViewBottomButtonBarAction
                icon={(input) => <IconChevronRight {...input} />}
                label={input.ctx.t('app.next')}
                disabled={!canGoNext}
                onClick={() => {
                  if (nextPuzzle) {
                    input.dispatch({
                      t: 'got-msg-core',
                      c: {
                        t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
                        userId: input.ctx.currentUserId,
                        nextPuzzle
                      }
                    })
                  }
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

const PackPuzzleGrid: Pick<ClientModule, 'update' | 'subscriptions'> = {
  update(input) {
    const pack = input.modelCore.screenPackBuilder?.pack ?? null

    if (!pack) {
      return {
        model: input.model
      }
    }

    const updated = PackPuzzlesGridClient.update({
      ctx: {
        ...input.ctx,
        pack
      },
      model: {
        ...PackPuzzlesGridClient.initClient,
        ...input.model.packBuilder?.flowPackPuzzleGrid,
        puzzles: input.ctx.puzzles
      },
      msg: input.msg?.t === 'screen-pack-builder.flow-pack-grid' ? input.msg.c : null,
      msgCmd: input.msgCmd,
      msgEvt: input.msgEvt,
      msgServer: input.msgServer?.t === 'screen-pack-builder.flow-pack-grid' ? input.msgServer.c : null
    })

    return {
      model: {
        ...input.model,
        puzzles: {
          ...input.ctx.puzzles,
          ...updated.model?.puzzles
        },
        packBuilder: {
          ...input.model.packBuilder,
          flowPackPuzzleGrid: updated.model
        }
      },
      eff: Eff.tag('screen-pack-builder.flow-pack-grid', updated.eff),
      msgCmd: SpaceClientCmd.tag('screen-pack-builder.flow-pack-grid', updated.msgCmd),
      msgEvt: updated.msgEvt
    }
  },
  subscriptions(input) {
    const pack = input.modelCore.screenPackBuilder?.pack
    if (!pack) {
      return Sub.None
    }
    return Sub.tag(
      'screen-pack-builder.flow-pack-grid',
      PackPuzzlesGridClient.subscriptions({
        ctx: {
          ...input.ctx,
          pack
        },
        model: input.model.packBuilder.flowPackPuzzleGrid
      })
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
      msgCore:
        input.msgCore?.t === 'got-edit-pack-name-msg'
          ? {
              ...input.msgCore,
              ...input.msgCore.c
            }
          : null
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

export const ScreenPackBuilderClient: Pick<ClientModule, 'update' | 'View' | 'subscriptions'> = {
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
      (model) => PackPuzzleGrid.update({ ...input, model }),
      (model) => ScreenPuzzleMore.update({ ...input, model }),
      (model) => EditPackName.update({ ...input, model }),
      (model) => updateRecordPack({ ...input, model })
    )
  },

  View(input) {
    return (
      <div className='flex h-full w-full flex-col'>
        <PackPuzzlesGridClient.ViewObserver
          dispatch={(c) =>
            input.dispatch({
              t: 'screen-pack-builder.flow-pack-grid',
              c
            })
          }
        />
        <ViewScreen {...input} />
      </div>
    )
  },

  subscriptions(input) {
    return PackPuzzleGrid.subscriptions(input)
  }
}

const ViewScreen: ClientModule['View'] = (input) => {
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
