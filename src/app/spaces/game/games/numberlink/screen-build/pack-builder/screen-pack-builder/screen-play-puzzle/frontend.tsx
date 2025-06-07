import { Sub } from '~/@/sub'
import { IconChevronLeft } from '~/@/ui/icon/icon-chevron-left'
import { IconChevronRight } from '~/@/ui/icon/icon-chevron-right'
import { IconDeleteForever } from '~/@/ui/icon/icon-delete-forever'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ParentScreenProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { ModePlay } from '../../../../@/mode-play'
import { ModePlayFrontend } from '../../../../@/mode-play/frontend'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { PuzzleResult } from '../../../../@/puzzle/puzzle-result'
import type { FrontendModule, MsgFrontend } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.puzzle-screen.user-closed-more-drawer': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceClosed)] }
    }
    case 'screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceOpened)] }
    }

    case 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] }
    }

    case 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }

    case 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }

    case 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button': {
      return {
        model: input.model,
        msgOut: [
          PlaySoundCmd.init(APP_SOUND.refreshFeed),
          ShowToastCmd.init(input.ctx.t('game.numberlink.puzzle-removed')),
        ],
      }
    }

    case 'screen-pack-builder.got-numberlink-play-msg': {
      const modePlay = input.modelSpace?.screen.t === 'screen-puzzle' ? input.modelSpace.screen.play : null

      if (!modePlay) return { model: input.model }

      const puzzle: Puzzle | null =
        input.modelSpace?.screen.t === 'screen-puzzle' && input.modelSpace.screen.puzzleResult.t === 'got'
          ? input.modelSpace.screen.puzzleResult.c
          : null

      if (!puzzle) return { model: input.model }

      const updated = ModePlay.update({
        ctx: ModePlay.initCtx({ numberlink: puzzle.numberlink, solutions: input.ctx.solutions }),
        model: modePlay,
        msg: input.msgSpace.c,
      })

      return {
        model: input.model,
        msgOut: ModePlay.eventsToFrontendCmd(input.ctx, updated.events),
      }
    }
  }

  return { model: input.model }
}

const View: FrontendModule['View'] = (input) => {
  const screen = input.modelSpace.screen

  if (screen.t !== 'screen-puzzle') return null

  const parentScreen = toParentScreenProps(input)

  if (!parentScreen) return null

  const { puzzleResult, play } = screen

  if (puzzleResult.t === 'got' && play) {
    return (
      <ScreenLayout
        parentScreen={parentScreen}
        id='mode-play'
        ctx={input.ctx}
        renderBody={() => (
          <ModePlayFrontend.View
            dispatch={(c) =>
              input.dispatch({ t: 'got-msg-space', c: { t: 'screen-pack-builder.got-numberlink-play-msg', c } })
            }
            numberlink={puzzleResult.c.numberlink}
            model={play}
            showSolvedAnimation
          />
        )}
        actionBar={{
          variant: {
            t: 'uniform',
            actions: ModePlayFrontend.viewActions({
              ctx: { ...input.ctx, numberlink: puzzleResult.c.numberlink },
              model: play,
              dispatchCmd: (c) => input.dispatch({ t: 'got-msg-out', c }),
              dispatch: (c) =>
                input.dispatch({ t: 'got-msg-space', c: { t: 'screen-pack-builder.got-numberlink-play-msg', c } }),
            }),
          },
        }}
      />
    )
  }

  return (
    <ScreenLayout
      parentScreen={parentScreen}
      id='screen-puzzle'
      ctx={input.ctx}
      renderBody={() => <PuzzleResult.ViewNotFound ctx={input.ctx} />}
    />
  )
}

const toParentScreenProps = (input: Parameters<FrontendModule['View']>[0]): ParentScreenProps | null => {
  const screen = input.modelSpace.screen
  if (screen.t !== 'screen-puzzle') return input.ctx.parentScreen

  const pack = input.modelSpace.pack

  const previousPuzzleId = pack.puzzleIds[screen.puzzleIndex - 1]
  const previousPuzzle = previousPuzzleId ? input.ctx.puzzles[previousPuzzleId] : null
  const canGoPrevious = screen.puzzleIndex - 1 >= 0

  const nextPuzzleId = pack.puzzleIds[screen.puzzleIndex + 1]
  const nextPuzzle = nextPuzzleId ? input.ctx.puzzles[nextPuzzleId] : null
  const canGoNext = screen.puzzleIndex + 1 < pack.puzzleIds.length

  const onNextPuzzle = () => {
    input.dispatch({
      t: 'got-msg-space',
      c: {
        t: 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle',
        userId: input.ctx.currentUser.userId,
        nextPuzzleResult: nextPuzzle ? { t: 'got', c: nextPuzzle } : { t: 'not-found' },
      },
    })
  }

  return {
    parentScreen: input.ctx.parentScreen,
    id: 'screen-puzzle',
    navBar: {
      title: input.ctx.t('game.numberlink.level', screen.puzzleIndex + 1),
      subtitle:
        screen.puzzleResult.t === 'got' ? input.ctx.t('numberlink-puzzle-name', screen.puzzleResult.c.name) : null,
      back: {
        onClick: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen',
              userId: input.ctx.currentUser.userId,
            },
          }),
      },
    },
    actionBar: {
      id: 'screen-puzzle-buttons',
      variant: {
        limit: {
          max: 3,
          open: input.modelSpace.opened === 'more',
          onToggle: () =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t:
                  input.modelSpace.opened === 'more'
                    ? 'screen-pack-builder.puzzle-screen.user-closed-more-drawer'
                    : 'screen-pack-builder.puzzle-screen.user-clicked-open-more-drawer-button',
                userId: input.ctx.currentUser.userId,
              },
            }),
        },
        t: 'uniform',
        actions: [
          {
            id: input.ctx.t('app.prev'),
            icon: (input) => <IconChevronLeft {...input} />,
            label: input.ctx.t('app.prev'),
            disabled: !canGoPrevious,
            onClick: () => {
              input.dispatch({
                t: 'got-msg-space',
                c: {
                  t: 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button',
                  userId: input.ctx.currentUser.userId,
                  previousPuzzleResult: previousPuzzle ? { t: 'got', c: previousPuzzle } : { t: 'not-found' },
                },
              })
            },
          },
          {
            id: input.ctx.t('app.next'),
            icon: (input) => <IconChevronRight {...input} />,
            label: input.ctx.t('app.next'),
            disabled: !canGoNext,
            onClick: onNextPuzzle,
          },
          {
            id: input.ctx.t('app.remove'),
            icon: (input) => <IconDeleteForever {...input} />,
            label: input.ctx.t('app.remove'),
            color: 'danger',
            onClick: () =>
              input.dispatch({
                t: 'got-msg-space',
                c: {
                  t: 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button',
                  userId: input.ctx.currentUser.userId,
                  puzzleIndex: screen.puzzleIndex,
                },
              }),
          },
        ],
      },
    },
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-puzzle') return Sub.none()
  if (input.modelSpace.screen.puzzleResult.t !== 'got') return Sub.none()
  const numberlink = input.modelSpace.screen.puzzleResult.c.numberlink
  const play = input.modelSpace.screen.play
  if (!play) return Sub.none()
  return ModePlayFrontend.subscriptions(
    { model: play, ctx: { ...input.ctx, numberlink: numberlink } },
    (c): MsgFrontend => ({ t: 'got-msg-out', c: c }),
  )
}

export const ScreenPuzzlePlay = {
  subscriptions,
  update,
  View,
}
