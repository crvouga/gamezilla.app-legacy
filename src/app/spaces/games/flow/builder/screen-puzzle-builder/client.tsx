import { withEventId } from '~/@/event-sourced/event'
import { APP_SOUND, playSound } from '~/app/@/client'
import { Drawer, IconEllipsisVertical, IconPen, IconPlay, TopBar } from '~/app/@/ui'
import { Actions, ViewBottomButtonBar, ViewBottomButtonBarAction } from '~/app/@/ui/actions'
import { GameClientModule } from '~/app/spaces/games/@/architecture/game-client-v2'
import { LayoutGame } from '../../../@/game/layout-game'
import { ProfileCard } from '../../../@/game/profile-card'
import { FlowVariantUI } from '../../@/flow'
import { FlowEdit } from '../../@/flow/flow-edit'
import { FlowPlay } from '../../@/flow/flow-play'
import { FlowLayout } from '../../@/flow/flow-ui/flow-layout'
import * as BuilderTypes from '../types'
import { toFlow, toStatus } from './core'
import { DeleteForeverClient } from './delete-forever/client'
import { EditPuzzleNameClient } from './edit-puzzle-name/client'
import { SaveChangesClient } from './save-changes/client'

//
//
//
//
//
//
//

const update: BuilderTypes.ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => DeleteForeverClient.update({ ...input, model }),
    (model) => SaveChangesClient.update({ ...input, model }),
    (model) => EditPuzzleNameClient.update({ ...input, model }),
    (model) => updateFromMsgCore({ ...input, model }),
    (model) => updateMoreDrawer({ ...input, model }),
    (model) => updateFromMsg({ ...input, model })
  )
}

const updateFromMsg: BuilderTypes.ClientModule['update'] = (input) => {
  const { model, msg, ctx } = input

  switch (msg?.t) {
    case 'screen-puzzle-builder.got-flow-ui-play-msg':
    case 'screen-puzzle-builder.got-flow-ui-edit-msg': {
      return {
        model,
        msgCore: [withEventId(msg)]
      }
    }

    case 'screen-puzzle-builder.user-clicked-edit-mode-button': {
      return {
        model,
        msgCore: [
          withEventId({
            t: 'screen-puzzle-builder.user-clicked-edit-mode-button',
            userId: ctx.currentUserId
          })
        ],
        msgCmd: [playSound(APP_SOUND.navBackwardMin)]
      }
    }

    case 'screen-puzzle-builder.user-clicked-play-mode-button': {
      return {
        model,
        msgCore: [
          withEventId({
            t: 'screen-puzzle-builder.user-clicked-play-mode-button',
            userId: ctx.currentUserId
          })
        ],
        msgCmd: [playSound(APP_SOUND.navForwardMin)]
      }
    }

    case 'screen-puzzle-builder.user-clicked-more-button': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: 'more'
        },
        msgCmd: [playSound(APP_SOUND.tap)]
      }
    }

    case 'screen-puzzle-builder.user-closed-more-drawer': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: null
        },
        msgCmd: [playSound(APP_SOUND.tap)]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

const updateFromMsgCore: BuilderTypes.ClientModule['update'] = (input) => {
  const { model, modelCore, msgCore } = input

  switch (msgCore?.t) {
    case 'screen-puzzle-builder.got-flow-ui-play-msg': {
      if (modelCore.screenPuzzleBuilder?.mode.t !== 'play') {
        return {
          model
        }
      }
      const flow = toFlow(modelCore.screenPuzzleBuilder)
      const updated = FlowPlay.update({
        msg: msgCore.c,
        model: modelCore.screenPuzzleBuilder.play,
        ctx: FlowPlay.initCtx({
          flowPuzzle: {
            ...modelCore.screenPuzzleBuilder.puzzle,
            flow
          }
        })
      })

      return {
        model,
        msgCmd: FlowPlay.eventsToClientCmd(input.ctx, updated.events)
      }
    }
    case 'screen-puzzle-builder.got-flow-ui-edit-msg': {
      if (modelCore.screenPuzzleBuilder?.mode.t !== 'edit') {
        return {
          model
        }
      }
      const updated = FlowEdit.update({
        model: modelCore.screenPuzzleBuilder.edit,
        msg: msgCore.c,
        flow: modelCore.screenPuzzleBuilder.puzzle.flow
      })

      if (!updated.msgCmd) {
        return {
          model
        }
      }

      switch (updated.msgCmd.t) {
        case 'play-sound': {
          return {
            model,
            msgCmd: [playSound(updated.msgCmd.sourceSrc)]
          }
        }

        default: {
          return {
            model
          }
        }
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

//
//
//
//
//
//
//

const View: BuilderTypes.ClientModule['View'] = (input) => {
  const { ctx } = input

  if (!input.modelCore.screenPuzzleBuilder) {
    return null
  }

  const isSpectating = ctx.currentUserId !== ctx.space.hostId

  if (isSpectating) {
    return <ViewSpectating {...input} />
  }

  return (
    <>
      <TopBar
        ctx={input.ctx}
        onBack={() => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-exit-button' })}
        title={input.ctx.t('flow-puzzle-name', input.modelCore.screenPuzzleBuilder.puzzle.name)}
      />
      <ViewMode {...input} />
      <ViewMoreDrawer {...input} />
      <SaveChangesClient.ViewUnsavedChangesDrawer {...input} />
    </>
  )
}

const ViewMode: BuilderTypes.ClientModule['View'] = (input) => {
  const { model, modelCore, dispatch } = input

  const puzzleBuilder = modelCore.screenPuzzleBuilder

  if (!puzzleBuilder) {
    return null
  }

  const more = (
    <ViewBottomButtonBarAction
      icon={(input) => <IconEllipsisVertical {...input} />}
      label={input.ctx.t('app.more')}
      onClick={() =>
        dispatch({
          t: 'screen-puzzle-builder.user-clicked-more-button'
        })
      }
    />
  )

  switch (puzzleBuilder.mode.t) {
    case 'edit': {
      return (
        <div className='flex h-full w-full flex-col items-center justify-center overflow-hidden'>
          <div className='flex w-full flex-1 flex-col items-center justify-center overflow-hidden'>
            <FlowEdit.View
              model={puzzleBuilder.edit}
              ctx={input.ctx}
              dispatch={(c) =>
                dispatch({
                  t: 'screen-puzzle-builder.got-flow-ui-edit-msg',
                  c
                })
              }
            />
          </div>

          <ViewBottomButtonBar>
            <SaveChangesClient.ViewActionButtons {...input} model={model} />

            <ViewBottomButtonBarAction
              icon={(input) => <IconPlay {...input} />}
              label={input.ctx.t('flow.play-mode')}
              classNames={{
                button: 'text-blue-500'
              }}
              onClick={() =>
                dispatch({
                  t: 'screen-puzzle-builder.user-clicked-play-mode-button'
                })
              }
            />
            {more}
          </ViewBottomButtonBar>
        </div>
      )
    }

    case 'play': {
      const flow = toFlow(puzzleBuilder)
      const status = modelCore.screenPuzzleBuilder ? toStatus(modelCore.screenPuzzleBuilder) : 'solving'
      return (
        <div className='flex h-full max-h-full w-full flex-col items-center justify-center overflow-hidden'>
          <FlowLayout
            top={<div className='flex w-full items-center justify-center gap-1 p-2'>{input.ctx.t('flow.playing')}</div>}
            middle={
              <FlowPlay.View
                model={puzzleBuilder.play}
                flow={flow}
                dispatch={(c) => dispatch({ t: 'screen-puzzle-builder.got-flow-ui-play-msg', c })}
                showSolvedAnimation
              />
            }
            bottom={
              <Actions.View
                ctx={input.ctx}
                id='hint-button'
                open={false}
                onToggle={() => {}}
                buttons={[
                  FlowPlay.viewHintAction({
                    ctx: FlowPlay.initCtx({ ...input.ctx, flowPuzzle: { ...puzzleBuilder.puzzle, flow } }),
                    dispatch: (c) => dispatch({ t: 'screen-puzzle-builder.got-flow-ui-play-msg', c }),
                    model: puzzleBuilder.play,
                    disabled: status === 'solved'
                  }),
                  FlowPlay.viewResetAction({
                    ctx: input.ctx,
                    dispatch: (c) => dispatch({ t: 'screen-puzzle-builder.got-flow-ui-play-msg', c }),
                    flowPuzzle: { ...puzzleBuilder.puzzle, flow },
                    model: puzzleBuilder.play
                  })
                ]}
              />
            }
          />

          <ViewBottomButtonBar>
            <SaveChangesClient.ViewActionButtons {...input} model={model} />

            <ViewBottomButtonBarAction
              icon={(input) => <IconPen {...input} />}
              label={input.ctx.t('flow.edit-mode')}
              classNames={{
                button: 'text-amber-500'
              }}
              onClick={() =>
                dispatch({
                  t: 'screen-puzzle-builder.user-clicked-edit-mode-button'
                })
              }
            />
            {more}
          </ViewBottomButtonBar>
        </div>
      )
    }
  }
}

const ViewSpectating: BuilderTypes.ClientModule['View'] = (input) => {
  if (!input.modelCore.screenPuzzleBuilder) {
    return null
  }

  return (
    <LayoutGame ctx={input.ctx} isSpectating>
      <div className='flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll'>
        <ProfileCard
          ctx={input.ctx}
          profile={input.ctx.profiles[input.ctx.space.hostId]}
          subtitle={input.ctx.t('app.editor')}
        />
        <FlowVariantUI.View disabled model={toFlow(input.modelCore.screenPuzzleBuilder)} />
      </div>
    </LayoutGame>
  )
}

export const capitalize = (s: string) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`
}

//
//
//
//
//
//
//

const updateMoreDrawer: BuilderTypes.ClientModule['update'] = (input) => {
  const { msg, model } = input
  switch (msg?.t) {
    case 'screen-puzzle-builder.user-closed-more-drawer': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: null
        }
      }
    }
    case 'screen-puzzle-builder.user-clicked-more-button': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: 'more'
        }
      }
    }
    default: {
      return {
        model
      }
    }
  }
}

export const ViewMoreDrawer: BuilderTypes.ClientModule['View'] = (input) => {
  return (
    <Drawer
      id='more-drawer'
      open={input.model.puzzleBuilderOpened === 'more'}
      onClose={() =>
        input.dispatch({
          t: 'screen-puzzle-builder.user-closed-more-drawer'
        })
      }
      position='bottom'
    >
      <EditPuzzleNameClient.View {...input} />
      <DeleteForeverClient.View {...input} />
      <div className='w-full pb-2' />
    </Drawer>
  )
}

//
//
//
//
//
//

export const ScreenPuzzleBuilderClient = {
  update,
  View
}
