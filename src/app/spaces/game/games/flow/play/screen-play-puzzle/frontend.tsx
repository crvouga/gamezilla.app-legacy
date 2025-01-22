import { TimeSpan } from '~/@/time/time-span'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { Button, Dialog, DialogHeader, DialogSurface, TopBar } from '~/app/@/ui'
import { BottomButtons } from '~/app/@/ui/bottom-buttons'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { LayoutGame } from '../../../@/ui/layout-game'
import { PrebuiltBottomButtons } from '../../../@/ui/prebuilt-bottom-buttons'
import { ProfileListItem } from '../../../@/ui/profile-list-item'
import { ModePlay } from '../../@/mode-play'
import { PuzzleResult } from '../../@/puzzle/puzzle-result'
import { BoardLayout } from '../../@/ui/layout'
import type { FrontendModule } from '../types'
import * as CopyPuzzleFrontend from './button-copy-puzzle/frontend'
import { ScreenPlayPuzzleSpace } from './space'
import { LastPuzzleFrontend } from './dialog-last-puzzle/frontend'
import { Sub } from '~/@/sub'

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
      return {
        model: input.model,
      }
    }

    case 'user-clicked-reset-puzzle': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navTransitionLeft)],
      }
    }

    case 'user-clicked-exit-play-puzzle-screen': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      }
    }

    case 'user-clicked-next-puzzle': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }

    case 'user-clicked-prev-puzzle': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      }
    }

    case 'user-closed-puzzle-complete-dialog': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      }
    }

    case 'user-toggled-action-buttons-drawer': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }

    case 'got-flow-play-msg': {
      if (input.modelSpace.screen.t !== 'screen-play-puzzle') {
        return {
          model: input.model,
        }
      }

      if (input.modelSpace.screen.puzzleResult.t === 'not-found') {
        return {
          model: input.model,
        }
      }
      const ModePlay =
        input.modelSpace.screen.ModePlay ??
        ModePlay.init({
          ctx: ModePlay.initCtx({
            flow: input.modelSpace.screen.puzzleResult.c.flow,
            solutions: input.ctx.solutions,
          }),
        })

      const output = ModePlay.update({
        msg: input.msgSpace.c,
        model: ModePlay,
        ctx: ModePlay.initCtx({
          flow: input.modelSpace.screen.puzzleResult.c.flow,
          solutions: input.ctx.solutions,
        }),
      })

      return {
        model: input.model,
        msgCmd: ModePlay.eventsToFrontendCmd(input.ctx, output.events),
      }
    }
  }
  return {
    model: input.model,
  }
}

const subscriptions: FrontendModule['subscriptions'] = (_input) => {
  return Sub.None
}

const CHECKMARK_DURATION = TimeSpan.seconds(1 / 2)

const View: FrontendModule['View'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') {
    return null
  }
  const flowPuzzle = input.modelSpace.screen.puzzleResult
  const ModePlay = input.modelSpace.screen.ModePlay
  const isSolved = ScreenPlayPuzzleSpace.toStatus(input.modelSpace.screen) === 'solved'
  const puzzleIndex = input.modelSpace.screen.puzzleIndex

  //
  const nextPuzzleIndex = puzzleIndex + 1
  const nextPuzzleId = input.modelSpace.screen.pack.puzzleIds[nextPuzzleIndex]
  const nextPuzzle = nextPuzzleId ? input.ctx.puzzles[nextPuzzleId] : null

  const isSpectating = input.ctx.currentUserId !== input.ctx.space.hostId

  if (isSpectating) {
    return (
      <LayoutGame ctx={input.ctx} isSpectating>
        <TopBar ctx={input.ctx} onBack={false} title={input.ctx.t('flow.level', puzzleIndex + 1)} />
        {flowPuzzle.t === 'got' ? (
          <BoardLayout
            top={
              <ProfileListItem
                ctx={input.ctx}
                profile={input.ctx.profiles[input.ctx.space.hostId]}
                subtitle={input.ctx.t('game.player')}
              />
            }
            board={
              <ModePlay.View
                disabled
                key={flowPuzzle.c.id}
                flow={flowPuzzle.c.flow}
                model={
                  ModePlay ??
                  ModePlay.init({ ctx: ModePlay.initCtx({ flow: flowPuzzle.c.flow, solutions: input.ctx.solutions }) })
                }
                dispatch={() => {}}
                showSolvedAnimation
              />
            }
            bottom={null}
          />
        ) : (
          <PuzzleResult.ViewNotFound ctx={input.ctx} />
        )}
      </LayoutGame>
    )
  }
  return (
    <div
      className='flex w-full flex-1 flex-col overflow-hidden'
      data-puzzle-id={flowPuzzle.t === 'got' ? flowPuzzle.c.id : null}
    >
      <TopBar
        ctx={input.ctx}
        onBack={() =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              userId: input.ctx.currentUserId,
              t: 'user-clicked-exit-play-puzzle-screen',
            },
          })
        }
        title={input.ctx.t('flow.level', puzzleIndex + 1)}
      />

      <BoardLayout
        top={null}
        board={
          flowPuzzle.t === 'got' ? (
            <ModePlay.View
              key={flowPuzzle.c.id}
              flow={flowPuzzle.c.flow}
              model={
                ModePlay ??
                ModePlay.init({ ctx: ModePlay.initCtx({ flow: flowPuzzle.c.flow, solutions: input.ctx.solutions }) })
              }
              dispatch={(c) =>
                input.dispatch({
                  t: 'got-msg-space',
                  c: { t: 'got-flow-play-msg', c, userId: input.ctx.currentUserId },
                })
              }
              showSolvedAnimation
            />
          ) : (
            <PuzzleResult.ViewNotFound ctx={input.ctx} />
          )
        }
        bottom={null}
      />

      <BottomButtons.View
        id='screen-play-puzzle-bottom-bar'
        ctx={input.ctx}
        onToggle={() =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              userId: input.ctx.currentUserId,
              t: 'user-toggled-action-buttons-drawer',
            },
          })
        }
        open={input.modelSpace.screen.opened === 'action-drawer'}
        buttons={[
          PrebuiltBottomButtons.next({
            ...input,
            disabled: puzzleIndex >= input.modelSpace.screen.pack.puzzleIds.length - 1,
            hidden: !isSolved && flowPuzzle.t !== 'not-found',
            color: 'success',
            onClick: () =>
              input.dispatch({
                t: 'got-msg-space',
                c: {
                  t: 'user-clicked-next-puzzle',
                  userId: input.ctx.currentUserId,
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
              }),
          }),

          flowPuzzle.t === 'got' && !isSolved
            ? ModePlay.viewHintAction({
                model:
                  ModePlay ??
                  ModePlay.init({
                    ctx: ModePlay.initCtx({
                      flow: flowPuzzle.c.flow,
                      solutions: input.ctx.solutions,
                    }),
                  }),
                ctx: ModePlay.initCtx({
                  ...input.ctx,
                  flow: flowPuzzle.c.flow,
                  solutions: input.ctx.solutions,
                }),
                disabled: false,
                dispatch: (c) =>
                  input.dispatch({
                    t: 'got-msg-space',
                    c: {
                      t: 'got-flow-play-msg',
                      c,
                      userId: input.ctx.currentUserId,
                    },
                  }),
              })
            : null,

          PrebuiltBottomButtons.reset({
            ...input,
            hidden: flowPuzzle.t === 'not-found',
            onClick: () =>
              input.dispatch({
                t: 'got-msg-space',
                c: {
                  t: 'user-clicked-reset-puzzle',
                  userId: input.ctx.currentUserId,
                },
              }),
          }),

          flowPuzzle.t === 'not-found' ? null : CopyPuzzleFrontend.viewButtonAction(input),
        ]}
      />

      <ViewSolvedModal {...input} />
    </div>
  )
}

const ViewSolvedModal: FrontendModule['View'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') {
    return null
  }
  const isSolved = ScreenPlayPuzzleSpace.toStatus(input.modelSpace.screen) === 'solved'
  const puzzleIndex = input.modelSpace.screen.puzzleIndex

  //
  const nextPuzzleIndex = puzzleIndex + 1
  const nextPuzzleId = input.modelSpace.screen.pack.puzzleIds[nextPuzzleIndex]
  const nextPuzzle = nextPuzzleId ? input.ctx.puzzles[nextPuzzleId] : null

  const isLastPuzzle = input.modelSpace.screen.puzzleIndex >= input.modelSpace.screen.pack.puzzleIds.length - 1

  const isSolvedPuzzleDialogOpen = isSolved && input.modelSpace.screen.opened === 'puzzle-complete'

  return isLastPuzzle ? (
    <LastPuzzleFrontend.View
      delay={CHECKMARK_DURATION}
      open={isSolvedPuzzleDialogOpen}
      ctx={input.ctx}
      dispatch={(c) => input.dispatch(c)}
    />
  ) : (
    <Dialog
      delay={CHECKMARK_DURATION}
      open={isSolvedPuzzleDialogOpen}
      onClose={() =>
        input.dispatch({
          t: 'got-msg-space',
          c: {
            t: 'user-closed-puzzle-complete-dialog',
            userId: input.ctx.currentUserId,
          },
        })
      }
    >
      <DialogSurface>
        <DialogHeader title={input.ctx.t('flow.puzzle-completed')} />

        <Button
          text={input.ctx.t('flow.next-puzzle')}
          onClick={() =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                userId: input.ctx.currentUserId,
                t: 'user-clicked-next-puzzle',
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
        />
      </DialogSurface>
    </Dialog>
  )
}

export const ScreenPuzzleFrontend = {
  View,
  update,
  subscriptions,
}
