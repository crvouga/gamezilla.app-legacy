import { TimeSpan } from 'gamezilla-app/@/core'
import { APP_SOUND, playSound } from 'gamezilla-app/app/@/client'
import { Button, Dialog, DialogHeader, DialogSurface, TopBar } from 'gamezilla-app/app/@/ui'
import { Actions } from 'gamezilla-app/app/@/ui/actions'
import { withEventId } from 'gamezilla-app/app/spaces/@/event'
import { GameClientModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import { ViewPuzzleNotFound } from '../../@/puzzle/not-found'
import { FlowPlay } from '../../@/flow/flow-play'
import type { ClientModule } from '../play.types'
import * as CopyPuzzleClient from './copy-puzzle/copy-puzzle.client'
import { LastPuzzleClient } from './last-puzzle/last-puzzle.client'
import { ScreenPlayPuzzleCore } from './core'

const update: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => updateFromMsgCore({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => CopyPuzzleClient.update({ ...input, model }),
    (model) => LastPuzzleClient.update({ ...input, model })
  )
}

const updateFromMsg: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case undefined: {
      return {
        model: input.model
      }
    }

    default: {
      return {
        model: input.model,
        msgCore: [withEventId(input.msg)]
      }
    }
  }
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
        input.modelCore.screen.flowPlay ?? FlowPlay.init({ ctx: { flowPuzzle: input.modelCore.screen.puzzleResult.c } })

      const output = FlowPlay.update({
        msg: input.msgCore.c,
        model: flowPlay,
        ctx: {
          flowPuzzle: input.modelCore.screen.puzzleResult.c
        }
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

  const isLastPuzzle = input.modelCore.screen.puzzleIndex >= input.modelCore.screen.flowPack.puzzleIds.length - 1

  const isSolvedPuzzleDialogOpen = isSolved && input.modelCore.screen.opened === 'puzzle-complete'

  const checkmarkDuration = TimeSpan.seconds(1 / 2)

  return (
    <div
      className='flex w-full flex-1 flex-col overflow-y-scroll'
      data-puzzle-id={flowPuzzle.t === 'got' ? flowPuzzle.c.id : null}
    >
      <TopBar
        ctx={input.ctx}
        onBack={() =>
          input.dispatch({
            t: 'user-clicked-exit-puzzle'
          })
        }
        title={input.ctx.t('flow.level', puzzleIndex + 1)}
      />
      <div className='relative flex flex-1 flex-col items-center justify-center overflow-hidden'>
        {flowPuzzle.t === 'got' && (
          <FlowPlay.View
            key={flowPuzzle.c.id}
            flow={flowPuzzle.c.flow}
            model={flowPlay ?? FlowPlay.init({ ctx: { flowPuzzle: flowPuzzle.c } })}
            dispatch={(c) =>
              input.dispatch({
                t: 'got-flow-play-msg',
                c,
                userId: input.ctx.currentUserId
              })
            }
            showSolvedAnimation
          />
        )}

        {flowPuzzle.t === 'not-found' && <ViewPuzzleNotFound ctx={input.ctx} />}

        {isLastPuzzle ? (
          <LastPuzzleClient.View
            delay={checkmarkDuration}
            open={isSolvedPuzzleDialogOpen}
            ctx={input.ctx}
            dispatch={(c) => input.dispatch(c)}
          />
        ) : (
          <Dialog
            delay={checkmarkDuration}
            open={isSolvedPuzzleDialogOpen}
            onClose={() =>
              input.dispatch({
                t: 'user-closed-puzzle-complete-dialog'
              })
            }
          >
            <DialogSurface>
              <DialogHeader title={input.ctx.t('flow.puzzle-completed')} />

              <Button
                text={input.ctx.t('flow.next-puzzle')}
                onClick={() =>
                  input.dispatch({
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
                  })
                }
              />
            </DialogSurface>
          </Dialog>
        )}
      </div>
      <Actions.View
        id='screen-play-puzzle-bottom-bar'
        ctx={input.ctx}
        onToggle={() =>
          input.dispatch({
            t: 'user-toggled-action-buttons-drawer'
          })
        }
        open={input.modelCore.screen.opened === 'action-drawer'}
        buttons={[
          Actions.next({
            ...input,
            disabled: puzzleIndex >= input.modelCore.screen.flowPack.puzzleIds.length - 1,
            hidden: !isSolved && flowPuzzle.t !== 'not-found',
            color: 'success',
            onClick: () =>
              input.dispatch({
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
              })
          }),

          flowPuzzle.t === 'got' && !isSolved
            ? FlowPlay.viewHintAction({
                model: flowPlay ?? FlowPlay.init({ ctx: { flowPuzzle: flowPuzzle.c } }),
                ctx: { ...input.ctx, flowPuzzle: flowPuzzle.c },
                disabled: false,
                dispatch: (c) =>
                  input.dispatch({
                    t: 'got-flow-play-msg',
                    c,
                    userId: input.ctx.currentUserId
                  })
              })
            : null,

          Actions.reset({
            ...input,
            hidden: flowPuzzle.t === 'not-found',
            onClick: () =>
              input.dispatch({
                t: 'user-clicked-reset-puzzle'
              })
          }),

          flowPuzzle.t === 'not-found' ? null : CopyPuzzleClient.viewButtonAction(input)
        ]}
      />
    </div>
  )
}

export const ScreenPuzzleClient = {
  View,
  update
}
