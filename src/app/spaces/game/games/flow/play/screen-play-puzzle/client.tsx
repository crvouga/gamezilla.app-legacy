import { TimeSpan } from '~/@/time/time-span'
import { APP_SOUND, playSound } from '~/app/@/client/cmd'
import { Button, Dialog, DialogHeader, DialogSurface, TopBar } from '~/app/@/ui'
import { BottomButtons } from '~/app/@/ui/bottom-buttons'
import { GameClientModule } from '~/app/spaces/game/games/@/architecture/game-client-v2'
import { LayoutGame } from '../../../@/ui/layout-game'
import { PrebuiltBottomButtons } from '../../../@/ui/prebuilt-bottom-buttons'
import { ProfileListItem } from '../../../@/ui/profile-list-item'
import { FlowPlay } from '../../@/flow/flow-play'
import { BoardLayout } from '../../@/flow/ui/layout'
import { PuzzleResult } from '../../@/puzzle/puzzle-result'
import type { ClientModule } from '../types'
import * as CopyPuzzleClient from './copy-puzzle/client'
import { ScreenPlayPuzzleCore } from './core'
import { LastPuzzleClient } from './last-puzzle/client'

const update: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => updateFromMsgCore({ ...input, model }),
    (model) => CopyPuzzleClient.update({ ...input, model }),
    (model) => LastPuzzleClient.update({ ...input, model })
  )
}

const updateFromMsgCore: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'user-clicked-open-pack-list-item': {
      return {
        model: input.model
      }
    }

    case 'user-clicked-reset-puzzle': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navTransitionLeft)]
      }
    }

    case 'user-clicked-exit-puzzle': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)]
      }
    }

    case 'user-clicked-next-puzzle': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)]
      }
    }

    case 'user-clicked-prev-puzzle': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)]
      }
    }

    case 'user-closed-puzzle-complete-dialog': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)]
      }
    }

    case 'user-toggled-action-buttons-drawer': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.tap)]
      }
    }

    case 'got-flow-play-msg': {
      if (input.modelCore.screen.t !== 'screen-play-puzzle') {
        return {
          model: input.model
        }
      }

      if (input.modelCore.screen.puzzleResult.t === 'not-found') {
        return {
          model: input.model
        }
      }
      const flowPlay =
        input.modelCore.screen.flowPlay ??
        FlowPlay.init({ ctx: FlowPlay.initCtx({ flowPuzzle: input.modelCore.screen.puzzleResult.c }) })

      const output = FlowPlay.update({
        msg: input.msgCore.c,
        model: flowPlay,
        ctx: FlowPlay.initCtx({ flowPuzzle: input.modelCore.screen.puzzleResult.c })
      })

      return {
        model: input.model,
        msgCmd: FlowPlay.eventsToClientCmd(input.ctx, output.events)
      }
    }
  }
  return {
    model: input.model
  }
}

const CHECKMARK_DURATION = TimeSpan.seconds(1 / 2)

const View: ClientModule['View'] = (input) => {
  if (input.modelCore.screen.t !== 'screen-play-puzzle') {
    return null
  }
  const flowPuzzle = input.modelCore.screen.puzzleResult
  const flowPlay = input.modelCore.screen.flowPlay
  const isSolved = ScreenPlayPuzzleCore.toStatus(input.modelCore.screen) === 'solved'
  const puzzleIndex = input.modelCore.screen.puzzleIndex

  //
  const nextPuzzleIndex = puzzleIndex + 1
  const nextPuzzleId = input.modelCore.screen.flowPack.puzzleIds[nextPuzzleIndex]
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
              <FlowPlay.View
                disabled
                key={flowPuzzle.c.id}
                flow={flowPuzzle.c.flow}
                model={flowPlay ?? FlowPlay.init({ ctx: FlowPlay.initCtx({ flowPuzzle: flowPuzzle.c }) })}
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
        onBack={() => input.dispatch({ t: 'got-msg-core', c: { t: 'user-clicked-exit-puzzle' } })}
        title={input.ctx.t('flow.level', puzzleIndex + 1)}
      />

      <BoardLayout
        top={null}
        board={
          flowPuzzle.t === 'got' ? (
            <FlowPlay.View
              key={flowPuzzle.c.id}
              flow={flowPuzzle.c.flow}
              model={flowPlay ?? FlowPlay.init({ ctx: FlowPlay.initCtx({ flowPuzzle: flowPuzzle.c }) })}
              dispatch={(c) =>
                input.dispatch({ t: 'got-msg-core', c: { t: 'got-flow-play-msg', c, userId: input.ctx.currentUserId } })
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
        onToggle={() => input.dispatch({ t: 'got-msg-core', c: { t: 'user-toggled-action-buttons-drawer' } })}
        open={input.modelCore.screen.opened === 'action-drawer'}
        buttons={[
          PrebuiltBottomButtons.next({
            ...input,
            disabled: puzzleIndex >= input.modelCore.screen.flowPack.puzzleIds.length - 1,
            hidden: !isSolved && flowPuzzle.t !== 'not-found',
            color: 'success',
            onClick: () =>
              input.dispatch({
                t: 'got-msg-core',
                c: {
                  t: 'user-clicked-next-puzzle',
                  nextPuzzle: nextPuzzle
                    ? {
                        t: 'got',
                        c: nextPuzzle
                      }
                    : {
                        t: 'not-found'
                      },
                  nextPuzzleIndex
                }
              })
          }),

          flowPuzzle.t === 'got' && !isSolved
            ? FlowPlay.viewHintAction({
                model: flowPlay ?? FlowPlay.init({ ctx: FlowPlay.initCtx({ flowPuzzle: flowPuzzle.c }) }),
                ctx: FlowPlay.initCtx({ ...input.ctx, flowPuzzle: flowPuzzle.c }),
                disabled: false,
                dispatch: (c) =>
                  input.dispatch({
                    t: 'got-msg-core',
                    c: {
                      t: 'got-flow-play-msg',
                      c,
                      userId: input.ctx.currentUserId
                    }
                  })
              })
            : null,

          PrebuiltBottomButtons.reset({
            ...input,
            hidden: flowPuzzle.t === 'not-found',
            onClick: () =>
              input.dispatch({
                t: 'got-msg-core',
                c: {
                  t: 'user-clicked-reset-puzzle'
                }
              })
          }),

          flowPuzzle.t === 'not-found' ? null : CopyPuzzleClient.viewButtonAction(input)
        ]}
      />

      <ViewSolvedModal {...input} />
    </div>
  )
}

const ViewSolvedModal: ClientModule['View'] = (input) => {
  if (input.modelCore.screen.t !== 'screen-play-puzzle') {
    return null
  }
  const isSolved = ScreenPlayPuzzleCore.toStatus(input.modelCore.screen) === 'solved'
  const puzzleIndex = input.modelCore.screen.puzzleIndex

  //
  const nextPuzzleIndex = puzzleIndex + 1
  const nextPuzzleId = input.modelCore.screen.flowPack.puzzleIds[nextPuzzleIndex]
  const nextPuzzle = nextPuzzleId ? input.ctx.puzzles[nextPuzzleId] : null

  const isLastPuzzle = input.modelCore.screen.puzzleIndex >= input.modelCore.screen.flowPack.puzzleIds.length - 1

  const isSolvedPuzzleDialogOpen = isSolved && input.modelCore.screen.opened === 'puzzle-complete'

  return isLastPuzzle ? (
    <LastPuzzleClient.View
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
          t: 'got-msg-core',
          c: {
            t: 'user-closed-puzzle-complete-dialog'
          }
        })
      }
    >
      <DialogSurface>
        <DialogHeader title={input.ctx.t('flow.puzzle-completed')} />

        <Button
          text={input.ctx.t('flow.next-puzzle')}
          onClick={() =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'user-clicked-next-puzzle',
                nextPuzzle: nextPuzzle
                  ? {
                      t: 'got',
                      c: nextPuzzle
                    }
                  : {
                      t: 'not-found'
                    },
                nextPuzzleIndex
              }
            })
          }
        />
      </DialogSurface>
    </Dialog>
  )
}

export const ScreenPuzzleClient = {
  View,
  update
}
