import { APP_SOUND, playSound, showToast } from '~/app/@/frontend/cmd'
import { IconChevronLeft, IconChevronRight, IconDeleteForever } from '~/@/ui'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ModePlay } from '../../../@/mode-play'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { PuzzleResult } from '../../../@/puzzle/puzzle-result'
import type { FrontendModule } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.puzzle-screen.user-closed-more-drawer': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.drawerClosed)] }
    }
    case 'screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.drawerOpened)] }
    }

    case 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }
    }

    case 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.tap)] }
    }

    case 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.tap)] }
    }

    case 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.puzzle-removed'))],
      }
    }

    case 'screen-pack-builder.got-flow-play-msg': {
      const modePlay = input.modelSpace?.screen.t === 'screen-puzzle' ? input.modelSpace.screen.play : null

      if (!modePlay) return { model: input.model }

      const puzzle: Puzzle | null =
        input.modelSpace?.screen.t === 'screen-puzzle' && input.modelSpace.screen.puzzleResult.t === 'got'
          ? input.modelSpace.screen.puzzleResult.c
          : null

      if (!puzzle) return { model: input.model }

      const updated = ModePlay.update({
        ctx: ModePlay.initCtx({ flow: puzzle.flow, solutions: input.ctx.solutions }),
        model: modePlay,
        msg: input.msgSpace.c,
      })

      return {
        model: input.model,
        msgCmd: ModePlay.eventsToFrontendCmd(input.ctx, updated.events),
      }
    }
  }

  return { model: input.model }
}

const View: FrontendModule['View'] = (input) => {
  const screen = input.modelSpace.screen
  if (screen.t !== 'screen-puzzle') return null

  const pack = input.modelSpace.pack

  const previousPuzzleId = pack.puzzleIds[screen.puzzleIndex - 1]
  const previousPuzzle = previousPuzzleId ? input.ctx.puzzles[previousPuzzleId] : null
  const canGoPrevious = screen.puzzleIndex - 1 >= 0

  const nextPuzzleId = pack.puzzleIds[screen.puzzleIndex + 1]
  const nextPuzzle = nextPuzzleId ? input.ctx.puzzles[nextPuzzleId] : null
  const canGoNext = screen.puzzleIndex + 1 < pack.puzzleIds.length

  return (
    <ScreenLayout
      id='screen-puzzle'
      ctx={input.ctx}
      navBar={{
        title: input.ctx.t('flow.level', screen.puzzleIndex + 1),
        subtitle: screen.puzzleResult.t === 'got' ? input.ctx.t('flow-puzzle-name', screen.puzzleResult.c.name) : null,
        onBack: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen',
              userId: input.ctx.currentUserId,
            },
          }),
      }}
      renderBody={() =>
        screen.puzzleResult.t === 'got' && screen.play ? (
          <ModePlay.View
            dispatch={(c) =>
              input.dispatch({ t: 'got-msg-space', c: { t: 'screen-pack-builder.got-flow-play-msg', c } })
            }
            flow={screen.puzzleResult.c.flow}
            model={screen.play}
            showSolvedAnimation
          />
        ) : (
          <PuzzleResult.ViewNotFound ctx={input.ctx} />
        )
      }
      actionBar={{
        id: 'screen-puzzle-buttons',

        variant: {
          limit: {
            max: 2,
            open: input.modelSpace.opened === 'more',
            onToggle: () =>
              input.dispatch({
                t: 'got-msg-space',
                c: {
                  t:
                    input.modelSpace.opened === 'more'
                      ? 'screen-pack-builder.puzzle-screen.user-closed-more-drawer'
                      : 'screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button',
                  userId: input.ctx.currentUserId,
                },
              }),
          },
          t: 'uniform',
          actions: [
            {
              icon: (input) => <IconChevronLeft {...input} />,
              label: input.ctx.t('app.prev'),
              disabled: !canGoPrevious,
              onClick: () => {
                input.dispatch({
                  t: 'got-msg-space',
                  c: {
                    t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
                    userId: input.ctx.currentUserId,
                    previousPuzzleResult: previousPuzzle ? { t: 'got', c: previousPuzzle } : { t: 'not-found' },
                  },
                })
              },
            },
            {
              icon: (input) => <IconChevronRight {...input} />,
              label: input.ctx.t('app.next'),
              disabled: !canGoNext,
              onClick: () => {
                input.dispatch({
                  t: 'got-msg-space',
                  c: {
                    t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
                    userId: input.ctx.currentUserId,
                    nextPuzzleResult: nextPuzzle ? { t: 'got', c: nextPuzzle } : { t: 'not-found' },
                  },
                })
              },
            },
            {
              icon: (input) => <IconDeleteForever {...input} />,
              label: input.ctx.t('app.remove'),
              color: 'danger',
              onClick: () =>
                input.dispatch({
                  t: 'got-msg-space',
                  c: {
                    t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
                    userId: input.ctx.currentUserId,
                    puzzleIndex: screen.puzzleIndex,
                  },
                }),
            },
          ],
        },
      }}
    />
  )
}

export const ScreenPuzzlePlay: Pick<FrontendModule, 'update' | 'View'> = {
  update,
  View,
}
