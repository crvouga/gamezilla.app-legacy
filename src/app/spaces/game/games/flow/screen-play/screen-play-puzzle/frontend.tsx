import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { Button } from '~/@/ui/button'
import { Dialog } from '~/@/ui/surface-dialog/dialog'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { SurfaceActions } from '~/@/ui/surface/surface-actions'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { LayoutGame } from '../../../@/ui/game-layout'
import { ProfileListItem } from '../../../@/ui/list-item-profile'
import { PrebuiltActions } from '../../../@/ui/prebuilt-actions'
import { ModePlay } from '../../@/mode-play'
import { ModePlayFrontend } from '../../@/mode-play/frontend'
import { PuzzleResult } from '../../@/puzzle/puzzle-result'
import type { FrontendModule } from '../types'
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
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }
    }

    case 'user-clicked-next-puzzle': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navForwardMin)] }
    }

    case 'user-clicked-prev-puzzle': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }
    }

    case 'user-closed-puzzle-complete-dialog': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }
    }

    case 'user-toggled-action-buttons-drawer': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.tap)] }
    }

    case 'got-flow-play-msg': {
      if (input.modelSpace.screen.t !== 'screen-play-puzzle') return { model: input.model }
      if (input.modelSpace.screen.puzzleResult.t === 'not-found') return { model: input.model }

      const playCtx = ModePlay.initCtx({
        flow: input.modelSpace.screen.puzzleResult.c.flow,
        solutions: input.ctx.solutions,
      })
      const modePlay = input.modelSpace.screen.modePlay ?? ModePlay.init({ ctx: playCtx })
      const output = ModePlay.update({ msg: input.msgSpace.c, model: modePlay, ctx: playCtx })

      return { model: input.model, msgCmd: ModePlay.eventsToFrontendCmd(input.ctx, output.events) }
    }
  }
  return { model: input.model }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') return Sub.None
  if (input.modelSpace.screen.puzzleResult.t !== 'got') return Sub.None
  const flow = input.modelSpace.screen.puzzleResult.c.flow
  const play = input.modelSpace.screen.modePlay
  if (!play) return Sub.None
  return ModePlayFrontend.subscriptions({ model: play, ctx: { ...input.ctx, flow } }, (c) => ({
    t: 'got-msg-cmd',
    c,
  }))
}

const CHECKMARK_DURATION = TimeSpan.seconds(1 / 2)

const View: FrontendModule['View'] = (input) => {
  const isSpectating = input.ctx.currentUser.userId !== input.ctx.space.hostId
  if (isSpectating) return <ViewSpectating {...input} />
  return <ViewHosting {...input} />
}

const ViewHosting: FrontendModule['View'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') return null

  const puzzle = input.modelSpace.screen.puzzleResult
  const modePlay = input.modelSpace.screen.modePlay
  const isSolved = ScreenPlayPuzzleSpace.toStatus(input.modelSpace.screen) === 'solved'
  const puzzleIndex = input.modelSpace.screen.puzzleIndex

  //
  const nextPuzzleIndex = puzzleIndex + 1
  const nextPuzzleId = input.modelSpace.screen.pack.puzzleIds[nextPuzzleIndex]
  const nextPuzzle = nextPuzzleId ? input.ctx.puzzles[nextPuzzleId] : null

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

  return (
    <ScreenLayout
      parentScreen={input.ctx.parentScreen}
      id='screen-play-puzzle'
      ctx={input.ctx}
      navBar={{
        title: input.ctx.t('flow.level', puzzleIndex + 1),
        back: {
          onClick: () =>
            input.dispatch({
              t: 'got-msg-space',
              c: { userId: input.ctx.currentUser.userId, t: 'user-clicked-exit-play-puzzle-screen' },
            }),
        },
      }}
      renderBody={() => (
        <div
          className='flex w-full flex-1 items-center justify-center'
          data-puzzle-id={puzzle.t === 'got' ? puzzle.c.id : null}
        >
          {puzzle.t === 'got' ? (
            <ModePlayFrontend.View
              key={puzzle.c.id}
              flow={puzzle.c.flow}
              model={
                modePlay ??
                ModePlay.init({ ctx: ModePlay.initCtx({ flow: puzzle.c.flow, solutions: input.ctx.solutions }) })
              }
              dispatch={(c) =>
                input.dispatch({
                  t: 'got-msg-space',
                  c: { t: 'got-flow-play-msg', c, userId: input.ctx.currentUser.userId },
                })
              }
              showSolvedAnimation
            />
          ) : (
            <PuzzleResult.ViewNotFound ctx={input.ctx} />
          )}
          <ViewSolvedModal {...input} />
        </div>
      )}
      actionBar={{
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
              onClick: onNextPuzzle,
            }),

            ...(puzzle.t === 'got' ? [CopyPuzzleFrontend.viewButtonAction(input)] : []),

            ...(puzzle.t === 'got' && modePlay
              ? ModePlayFrontend.viewActions({
                  model: modePlay,
                  ctx: ModePlay.initCtx({ ...input.ctx, flow: puzzle.c.flow }),
                  dispatchCmd: (c) => input.dispatch({ t: 'got-msg-cmd', c }),
                  dispatch: (c) =>
                    input.dispatch({
                      t: 'got-msg-space',
                      c: { t: 'got-flow-play-msg', c, userId: input.ctx.currentUser.userId },
                    }),
                })
              : []),
          ],
        },
      }}
    />
  )
}

const ViewSpectating: FrontendModule['View'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') return null

  const puzzle = input.modelSpace.screen.puzzleResult
  const modePlay = input.modelSpace.screen.modePlay
  const puzzleIndex = input.modelSpace.screen.puzzleIndex

  return (
    <ScreenLayout
      parentScreen={input.ctx.parentScreen}
      id='flow-spectating'
      ctx={input.ctx}
      navBar={{
        title: input.ctx.t('flow.level', puzzleIndex + 1),
      }}
      renderBody={() => (
        <LayoutGame isSpectating ctx={input.ctx}>
          <ProfileListItem
            ctx={input.ctx}
            profile={input.ctx.profilesByUserId[input.ctx.space.hostId]}
            subtitle={input.ctx.t('game.player')}
          />
          <div className='flex flex-1 items-center justify-center'>
            {puzzle.t === 'got' ? (
              <ModePlayFrontend.View
                disabled
                key={puzzle.c.id}
                flow={puzzle.c.flow}
                model={
                  modePlay ??
                  ModePlay.init({ ctx: ModePlay.initCtx({ flow: puzzle.c.flow, solutions: input.ctx.solutions }) })
                }
                dispatch={() => {}}
                showSolvedAnimation
              />
            ) : (
              <PuzzleResult.ViewNotFound ctx={input.ctx} />
            )}
          </div>
        </LayoutGame>
      )}
    />
  )
}

const ViewSolvedModal: FrontendModule['View'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') return null

  const isSolved = ScreenPlayPuzzleSpace.toStatus(input.modelSpace.screen) === 'solved'
  const puzzleIndex = input.modelSpace.screen.puzzleIndex

  const nextPuzzleIndex = puzzleIndex + 1
  const nextPuzzleId = input.modelSpace.screen.pack.puzzleIds[nextPuzzleIndex]
  const nextPuzzle = nextPuzzleId ? input.ctx.puzzles[nextPuzzleId] : null

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
    return (
      <LastPuzzleFrontend.ViewDialog
        delay={CHECKMARK_DURATION}
        open={isSolvedPuzzleDialogOpen}
        ctx={input.ctx}
        dispatch={(c) => input.dispatch(c)}
      />
    )
  }

  return (
    <Dialog delay={CHECKMARK_DURATION} open={isSolvedPuzzleDialogOpen} onClose={onClose}>
      <DialogSurface>
        <SurfaceHeader ctx={input.ctx} title={input.ctx.t('flow.puzzle-completed')} onClose={onClose} />

        <SurfaceActions>
          <Button
            text={input.ctx.t('flow.next-puzzle')}
            className='w-full'
            onClick={() =>
              input.dispatch({
                t: 'got-msg-space',
                c: {
                  userId: input.ctx.currentUser.userId,
                  t: 'user-clicked-next-puzzle',
                  nextPuzzle: nextPuzzle ? { t: 'got', c: nextPuzzle } : { t: 'not-found' },
                  nextPuzzleIndex,
                },
              })
            }
          />
        </SurfaceActions>
      </DialogSurface>
    </Dialog>
  )
}

export const ScreenPuzzleFrontend = {
  View,
  update,
  subscriptions,
}
