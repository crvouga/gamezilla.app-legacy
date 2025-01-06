import { APP_SOUND, playSound, showToast } from '~/app/@/client/cmd'
import {
  Drawer,
  IconChevronLeft,
  IconChevronRight,
  IconDeleteForever,
  IconEllipsisVertical,
  ListItemButton,
  TopBar,
} from '~/app/@/ui'
import { BottomButtons } from '~/app/@/ui/bottom-buttons'
import { GameClientModule } from '../../../../@/architecture/game-client-v2'
import { FlowPlay } from '../../../@/play'
import { BoardLayout } from '../../../@/ui/layout'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { PuzzleResult } from '../../../@/puzzle/puzzle-result'
import type { ClientModule } from '../../types'

export const ScreenPuzzlePlay: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    return GameClientModule.andThen(
      { model: input.model },
      (model) => ScreenPuzzleMore.update({ ...input, model }),
      (model) => {
        switch (input.msgCore?.t) {
          case 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle': {
            return {
              model,
              msgCmd: [playSound(APP_SOUND.navBackwardMin)],
            }
          }

          case 'screen-pack-builder.got-flow-play-msg': {
            const flowPlay =
              input.modelCore.screenPackBuilder?.screen.t === 'screen-puzzle'
                ? input.modelCore.screenPackBuilder.screen.play
                : null

            if (!flowPlay) {
              return { model }
            }

            const flowPuzzle: Puzzle | null =
              input.modelCore.screenPackBuilder?.screen.t === 'screen-puzzle' &&
              input.modelCore.screenPackBuilder.screen.puzzleResult.t === 'got'
                ? input.modelCore.screenPackBuilder.screen.puzzleResult.c
                : null

            if (!flowPuzzle) {
              return { model }
            }

            const updated = FlowPlay.update({
              ctx: FlowPlay.initCtx({ flowPuzzle }),
              model: flowPlay,
              msg: input.msgCore.c,
            })

            return {
              model,
              msgCmd: FlowPlay.eventsToClientCmd(input.ctx, updated.events),
            }
          }

          case 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button': {
            return {
              model,
              msgCmd: [playSound(APP_SOUND.tap)],
            }
          }

          case 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle': {
            return {
              model: input.model,
              msgCmd: [playSound(APP_SOUND.tap)],
            }
          }

          case 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button': {
            return {
              model: input.model,
              msgCmd: [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.puzzle-removed'))],
            }
          }
        }

        return { model: input.model }
      },
    )
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
      <div className='flex w-full flex-1 flex-col overflow-hidden'>
        <TopBar
          ctx={input.ctx}
          title={input.ctx.t('flow.level', screen.puzzleIndex + 1)}
          subtitle={
            screen.puzzleResult.t === 'got' ? input.ctx.t('flow-puzzle-name', screen.puzzleResult.c.name) : null
          }
          onBack={() =>
            input.dispatch({
              t: 'got-msg-core',
              c: { t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle', userId: input.ctx.currentUserId },
            })
          }
        />

        <BoardLayout
          top={null}
          board={
            screen.puzzleResult.t === 'got' && screen.play ? (
              <FlowPlay.View
                dispatch={(c) =>
                  input.dispatch({ t: 'got-msg-core', c: { t: 'screen-pack-builder.got-flow-play-msg', c } })
                }
                flow={screen.puzzleResult.c.flow}
                model={screen.play}
                showSolvedAnimation
              />
            ) : (
              <PuzzleResult.ViewNotFound ctx={input.ctx} />
            )
          }
          bottom={null}
        />
        <BottomButtons.Root>
          <BottomButtons.Button
            icon={(input) => <IconChevronLeft {...input} />}
            label={input.ctx.t('app.prev')}
            disabled={!canGoPrevious}
            onClick={() => {
              input.dispatch({
                t: 'got-msg-core',
                c: {
                  t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
                  userId: input.ctx.currentUserId,
                  previousPuzzleResult: previousPuzzle ? { t: 'got', c: previousPuzzle } : { t: 'not-found' },
                },
              })
            }}
          />

          <BottomButtons.Button
            icon={(input) => <IconChevronRight {...input} />}
            label={input.ctx.t('app.next')}
            disabled={!canGoNext}
            onClick={() => {
              input.dispatch({
                t: 'got-msg-core',
                c: {
                  t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
                  userId: input.ctx.currentUserId,
                  nextPuzzleResult: nextPuzzle ? { t: 'got', c: nextPuzzle } : { t: 'not-found' },
                },
              })
            }}
          />

          <ScreenPuzzleMore.View {...input} />
        </BottomButtons.Root>
      </div>
    )
  },
}

const ScreenPuzzleMore: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    switch (input.msgCore?.t) {
      case 'screen-pack-builder.puzzle-screen.user-closed-more-drawer':
      case 'screen-pack-builder.puzzle-screen.user-clicked-more-button': {
        return {
          model: input.model,
          msgCmd: [playSound(APP_SOUND.tap)],
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
        <BottomButtons.Button
          icon={(input) => <IconEllipsisVertical {...input} />}
          label={ctx.t('app.more')}
          onClick={() =>
            dispatch({
              t: 'got-msg-core',
              c: {
                t: 'screen-pack-builder.puzzle-screen.user-clicked-more-button',
                userId: ctx.currentUserId,
              },
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
                userId: ctx.currentUserId,
              },
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
                  puzzleIndex: screen.puzzleIndex,
                },
              })
            }
          />
          <div className='w-full p-2' />
        </Drawer>
      </>
    )
  },
}
