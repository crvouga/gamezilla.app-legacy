import { Sub } from '~/@/sub'
import { Button } from '~/@/ui/button'
import { Dialog } from '~/@/ui/surface-dialog/dialog'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { SurfaceActions } from '~/@/ui/surface/surface-actions'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { Box } from '~/@/vdom/primitives/box'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { LayoutGame } from '../../../@/ui/game-layout'
import { ProfileListItem } from '../../../@/ui/list-item-profile'
import { PrebuiltActions } from '../../../@/ui/prebuilt-actions'
import { ModePlay } from '../../@/mode-play'
import { ModePlayFrontend } from '../../@/mode-play/frontend'
import { PuzzleDbQueryCache } from '../../@/puzzle/puzzle-db-query-cache'
import { PuzzleResult } from '../../@/puzzle/puzzle-result'
import { SolutionHash } from '../../@/solutions/solution-hash/solution-hash'
import { SolutionsDbQueryCache } from '../../@/solutions/solutions-db-query-cache'
import type { FrontendModule, MsgFrontend } from '../types'
import * as CopyPuzzleFrontend from './button-copy-puzzle/frontend'
import { LastPuzzleFrontend } from './last-puzzle/frontend'
import { ScreenPlayPuzzleSpace } from './space'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => CopyPuzzleFrontend.update({ ...input, model }),
    (model) => LastPuzzleFrontend.update({ ...input, model }),
  )
}

const updateFromMsgSpace: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-clicked-open-pack-puzzle-grid-item': {
      return { model: input.model }
    }

    case 'user-clicked-exit-play-puzzle-screen': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] }
    }

    case 'user-clicked-next-puzzle': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)] }
    }

    case 'user-clicked-prev-puzzle': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] }
    }

    case 'user-closed-puzzle-complete-dialog': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] }
    }

    case 'user-toggled-action-buttons-drawer': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }

    case 'got-numberlink-play-msg': {
      if (input.modelSpace.screen.t !== 'screen-play-puzzle') return { model: input.model }
      if (input.modelSpace.screen.puzzleResult.t === 'not-found') return { model: input.model }

      const playCtx = ModePlay.initCtx({
        numberlink: input.modelSpace.screen.puzzleResult.c.model,
        solutions: SolutionsDbQueryCache.read(
          input.ctx,
          SolutionHash.init(input.modelSpace.screen.puzzleResult.c.model),
        ),
      })
      const modePlay = input.modelSpace.screen.modePlay ?? ModePlay.init({ ctx: playCtx })
      const output = ModePlay.update({ msg: input.msgSpace.c, model: modePlay, ctx: playCtx })

      return { model: input.model, msgOut: ModePlay.eventsToFrontendCmd(input.ctx, output.events) }
    }
  }
  return { model: input.model }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') return Sub.none()
  if (input.modelSpace.screen.puzzleResult.t !== 'got') return Sub.none()
  const numberlink = input.modelSpace.screen.puzzleResult.c.model
  const play = input.modelSpace.screen.modePlay
  if (!play) return Sub.none()
  return ModePlayFrontend.subscriptions(
    { model: play, ctx: { ...input.ctx, numberlink: numberlink } },
    (c): MsgFrontend => ({ t: 'got-msg-out', c }),
  )
}

// const CHECKMARK_DURATION = TimeSpan.seconds(1 / 2)

const View: FrontendModule['View'] = (input) => {
  const isSpectating = input.ctx.currentUser.userId !== input.ctx.space.hostId
  return isSpectating ? ViewSpectating(input) : ViewHosting(input)
}

const ViewHosting: FrontendModule['View'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') return null

  const puzzle = input.modelSpace.screen.puzzleResult
  const modePlay = input.modelSpace.screen.modePlay
  const isSolved = ScreenPlayPuzzleSpace.toStatus(input.modelSpace.screen) === 'solved'
  const puzzleIndex = input.modelSpace.screen.puzzleIndex

  const nextPuzzleIndex = puzzleIndex + 1
  const nextPuzzleId = input.modelSpace.screen.pack.puzzleIds[nextPuzzleIndex]
  const nextPuzzle = PuzzleDbQueryCache.entity(input.ctx, nextPuzzleId)

  const onNextPuzzle = () => {
    input.dispatch({
      t: 'got-msg-space',
      c: {
        t: 'user-clicked-next-puzzle',
        userId: input.ctx.currentUser.userId,
        nextPuzzle: nextPuzzle
          ? {
              t: 'got',
              c: nextPuzzle,
            }
          : {
              t: 'not-found',
            },
        nextPuzzleIndex,
      },
    })
  }

  return h(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    dataTestId: 'numberlink/play-puzzle-screen',
    id: 'screen-play-puzzle',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('game.numberlink.level', puzzleIndex + 1),
      back: {
        onPress: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: { userId: input.ctx.currentUser.userId, t: 'user-clicked-exit-play-puzzle-screen' },
          }),
      },
    },
    renderBody: () =>
      h(
        Box,
        {
          class: 'flex flex-row w-full flex-1 items-center justify-center',
          'data-puzzle-id': puzzle.t === 'got' ? puzzle.c.id : null,
        },
        [
          puzzle.t === 'got'
            ? h(ModePlayFrontend.View, {
                key: puzzle.c.id,
                numberlink: puzzle.c.model,
                model:
                  modePlay ??
                  ModePlay.init({
                    ctx: ModePlay.initCtx({
                      numberlink: puzzle.c.model,
                      solutions: SolutionsDbQueryCache.read(input.ctx, SolutionHash.init(puzzle.c.model)),
                    }),
                  }),
                dispatch: (c) =>
                  input.dispatch({
                    t: 'got-msg-space',
                    c: { t: 'got-numberlink-play-msg', c, userId: input.ctx.currentUser.userId },
                  }),
                showSolvedAnimation: true,
              })
            : h(PuzzleResult.ViewNotFound, { ctx: input.ctx }),
          ViewSolvedModal(input),
        ],
      ),
    actionBar: {
      id: 'screen-play-puzzle-bottom-bar',
      variant: {
        t: 'uniform',
        limit: {
          max: 3,
          open: input.modelSpace.screen.opened === 'action-drawer',
          onToggle: () =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                userId: input.ctx.currentUser.userId,
                t: 'user-toggled-action-buttons-drawer',
              },
            }),
        },
        actions: [
          ...LastPuzzleFrontend.viewActions(input),

          PrebuiltActions.next({
            ...input,
            hidden: (!isSolved && puzzle.t === 'got') || ScreenPlayPuzzleSpace.isLastPuzzle(input.modelSpace.screen),
            color: 'success',
            onPress: onNextPuzzle,
          }),

          ...(puzzle.t === 'got' ? [CopyPuzzleFrontend.viewButtonAction(input)] : []),

          ...(puzzle.t === 'got' && modePlay
            ? ModePlayFrontend.viewActions({
                model: modePlay,
                ctx: ModePlay.initCtx({ ...input.ctx, numberlink: puzzle.c.model }),
                dispatchCmd: (c) => input.dispatch({ t: 'got-msg-out', c }),
                dispatch: (c) =>
                  input.dispatch({
                    t: 'got-msg-space',
                    c: { t: 'got-numberlink-play-msg', c, userId: input.ctx.currentUser.userId },
                  }),
              })
            : []),
        ],
      },
    },
  })
}

const ViewSpectating: FrontendModule['View'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') return null

  const puzzle = input.modelSpace.screen.puzzleResult
  const modePlay = input.modelSpace.screen.modePlay
  const puzzleIndex = input.modelSpace.screen.puzzleIndex

  return h(ScreenLayout, {
    dataTestId: 'numberlink/play-puzzle-screen',
    parentScreen: input.ctx.parentScreen,
    id: 'spectating',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('game.numberlink.level', puzzleIndex + 1),
    },
    renderBody: () =>
      h(LayoutGame, { isSpectating: true, ctx: input.ctx }, [
        h(ProfileListItem, {
          ctx: input.ctx,
          profile: input.ctx.profilesByUserId[input.ctx.space.hostId],
          subtitle: input.ctx.t('game.player'),
        }),
        h(Box, { class: 'flex flex-row flex-1 items-center justify-center' }, [
          puzzle.t === 'got'
            ? h(ModePlayFrontend.View, {
                disabled: true,
                key: puzzle.c.id,
                numberlink: puzzle.c.model,
                model:
                  modePlay ??
                  ModePlay.init({
                    ctx: ModePlay.initCtx({
                      numberlink: puzzle.c.model,
                      solutions: SolutionsDbQueryCache.read(input.ctx, SolutionHash.init(puzzle.c.model)),
                    }),
                  }),
                dispatch: () => {},
                showSolvedAnimation: true,
              })
            : h(PuzzleResult.ViewNotFound, { ctx: input.ctx }),
        ]),
      ]),
  })
}

const ViewSolvedModal: FrontendModule['View'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') return null

  const isSolved = ScreenPlayPuzzleSpace.toStatus(input.modelSpace.screen) === 'solved'
  const puzzleIndex = input.modelSpace.screen.puzzleIndex

  const nextPuzzleIndex = puzzleIndex + 1
  const nextPuzzleId = input.modelSpace.screen.pack.puzzleIds[nextPuzzleIndex]
  const nextPuzzle = PuzzleDbQueryCache.entity(input.ctx, nextPuzzleId)

  const isLastPuzzle = ScreenPlayPuzzleSpace.isLastPuzzle(input.modelSpace.screen)
  const isSolvedPuzzleDialogOpen = isSolved && input.modelSpace.screen.opened === 'puzzle-complete'

  const onClose = () => {
    input.dispatch({
      t: 'got-msg-space',
      c: {
        t: 'user-closed-puzzle-complete-dialog',
        userId: input.ctx.currentUser.userId,
      },
    })
  }

  if (isLastPuzzle) {
    return h(LastPuzzleFrontend.ViewDialog, {
      open: isSolvedPuzzleDialogOpen,
      ctx: input.ctx,
      dispatch: (c) => input.dispatch(c),
    })
  }

  return h(Dialog, { delay: '300ms', open: isSolvedPuzzleDialogOpen, onClose }, [
    h(DialogSurface, {}, [
      h(SurfaceHeader, {
        ctx: input.ctx,
        title: input.ctx.t('game.numberlink.puzzle-completed'),
        onClose,
      }),
      h(SurfaceActions, {}, [
        h(Button, {
          text: input.ctx.t('game.numberlink.next-puzzle'),
          class: 'w-full',
          onPress: () =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                userId: input.ctx.currentUser.userId,
                t: 'user-clicked-next-puzzle',
                nextPuzzle: nextPuzzle ? { t: 'got', c: nextPuzzle } : { t: 'not-found' },
                nextPuzzleIndex,
              },
            }),
        }),
      ]),
    ]),
  ])
}

export const ScreenPuzzleFrontend = {
  View,
  update,
  subscriptions,
}
