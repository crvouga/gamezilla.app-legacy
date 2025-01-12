import { withEventId } from '~/@/event-sourced/event'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { Drawer, IconEllipsisVertical, IconPen, IconPlay, TopBar } from '~/app/@/ui'
import { BottomButtons } from '~/app/@/ui/bottom-buttons'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { LayoutGame } from '../../../@/ui/layout-game'
import { ProfileListItem } from '../../../@/ui/profile-list-item'
import { EditMode } from '../../@/edit-mode'
import { PlayMode } from '../../@/play-mode'
import { BoardLayout } from '../../@/ui/layout'
import { VariantBoard } from '../../@/variant'
import * as BuilderTypes from '../types'
import { ScreenPuzzleBuilderSpace } from './space'
import { DeleteForeverFrontend } from './delete-forever/frontend'
import { EditPuzzleNameFrontend } from './edit-puzzle-name/frontend'
import { SaveChangesFrontend } from './save-changes/frontend'

//
//
//
//
//
//
//

const update: BuilderTypes.FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => DeleteForeverFrontend.update({ ...input, model }),
    (model) => SaveChangesFrontend.update({ ...input, model }),
    (model) => EditPuzzleNameFrontend.update({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateMoreDrawer({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
  )
}

const updateFromMsg: BuilderTypes.FrontendModule['update'] = (input) => {
  const { model, msg, ctx } = input

  switch (msg?.t) {
    case 'screen-puzzle-builder.got-play-msg':
    case 'screen-puzzle-builder.got-edit-msg': {
      return {
        model,
        msgSpace: [withEventId(msg)],
      }
    }

    case 'screen-puzzle-builder.user-clicked-edit-mode-button': {
      return {
        model,
        msgSpace: [
          withEventId({
            t: 'screen-puzzle-builder.user-clicked-edit-mode-button',
            userId: ctx.currentUserId,
          }),
        ],
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      }
    }

    case 'screen-puzzle-builder.user-clicked-play-mode-button': {
      return {
        model,
        msgSpace: [
          withEventId({
            t: 'screen-puzzle-builder.user-clicked-play-mode-button',
            userId: ctx.currentUserId,
          }),
        ],
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }

    case 'screen-puzzle-builder.user-clicked-more-button': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: 'more',
        },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }

    case 'screen-puzzle-builder.user-closed-more-drawer': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: null,
        },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}

const updateFromMsgSpace: BuilderTypes.FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-puzzle-builder.got-play-msg': {
      if (input.modelSpace.screenPuzzleBuilder?.mode.t !== 'play') {
        return {
          model: input.model,
        }
      }
      const flow = ScreenPuzzleBuilderSpace.toFlow(input.modelSpace.screenPuzzleBuilder)
      const updated = PlayMode.update({
        msg: input.msgSpace.c,
        model: input.modelSpace.screenPuzzleBuilder.playMode,
        ctx: PlayMode.initCtx({
          flow,
          solutions: input.ctx.solutions,
        }),
      })

      return {
        model: input.model,
        msgCmd: PlayMode.eventsToFrontendCmd(input.ctx, updated.events),
      }
    }
    case 'screen-puzzle-builder.got-edit-msg': {
      if (input.modelSpace.screenPuzzleBuilder?.mode.t !== 'edit') {
        return {
          model: input.model,
        }
      }
      const updated = EditMode.update({
        model: input.modelSpace.screenPuzzleBuilder.editMode,
        msg: input.msgSpace.c,
        flow: input.modelSpace.screenPuzzleBuilder.puzzle.flow,
      })

      if (!updated.msgCmd) {
        return {
          model: input.model,
        }
      }

      switch (updated.msgCmd.t) {
        case 'play-sound': {
          return {
            model: input.model,
            msgCmd: [playSound(updated.msgCmd.sourceSrc)],
          }
        }

        default: {
          return {
            model: input.model,
          }
        }
      }
    }

    default: {
      return {
        model: input.model,
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

const View: BuilderTypes.FrontendModule['View'] = (input) => {
  const { ctx } = input

  if (!input.modelSpace.screenPuzzleBuilder) {
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
        title={input.ctx.t('flow-puzzle-name', input.modelSpace.screenPuzzleBuilder.puzzle.name)}
      />
      <ViewMode {...input} />
      <ViewMoreDrawer {...input} />
      <SaveChangesFrontend.ViewUnsavedChangesDrawer {...input} />
    </>
  )
}

const ViewMode: BuilderTypes.FrontendModule['View'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder

  if (!puzzleBuilder) {
    return null
  }

  const more = (
    <BottomButtons.Button
      icon={(input) => <IconEllipsisVertical {...input} />}
      label={input.ctx.t('app.more')}
      onClick={() => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-more-button' })}
    />
  )

  switch (puzzleBuilder.mode.t) {
    case 'edit': {
      return (
        <div className='flex h-full w-full flex-col items-center justify-center overflow-hidden'>
          <EditMode.View
            model={puzzleBuilder.editMode}
            ctx={input.ctx}
            dispatch={(c) => input.dispatch({ t: 'screen-puzzle-builder.got-edit-msg', c })}
          />

          <BottomButtons.Root>
            <SaveChangesFrontend.ViewBottomButtons {...input} model={input.model} />

            <BottomButtons.Button
              icon={(input) => <IconPlay {...input} />}
              label={input.ctx.t('flow.play-mode')}
              classNames={{
                button: 'text-blue-500',
              }}
              onClick={() =>
                input.dispatch({
                  t: 'screen-puzzle-builder.user-clicked-play-mode-button',
                })
              }
            />
            {more}
          </BottomButtons.Root>
        </div>
      )
    }

    case 'play': {
      const flow = ScreenPuzzleBuilderSpace.toFlow(puzzleBuilder)
      const status = input.modelSpace.screenPuzzleBuilder
        ? ScreenPuzzleBuilderSpace.toStatus(input.modelSpace.screenPuzzleBuilder)
        : 'solving'
      return (
        <div className='flex h-full w-full flex-col items-center justify-center overflow-hidden'>
          <BoardLayout
            top={<div className='flex w-full items-center justify-center gap-1 p-2'>{input.ctx.t('flow.playing')}</div>}
            board={
              <PlayMode.View
                model={puzzleBuilder.playMode}
                flow={flow}
                dispatch={(c) => input.dispatch({ t: 'screen-puzzle-builder.got-play-msg', c })}
                showSolvedAnimation
              />
            }
            bottom={
              <BottomButtons.View
                ctx={input.ctx}
                id='hint-button'
                open={false}
                onToggle={() => {}}
                buttons={[
                  PlayMode.viewHintAction({
                    ctx: PlayMode.initCtx({ ...input.ctx, flow }),
                    dispatch: (c) => input.dispatch({ t: 'screen-puzzle-builder.got-play-msg', c }),
                    model: puzzleBuilder.playMode,
                    disabled: status === 'solved',
                  }),
                  PlayMode.viewResetAction({
                    ctx: input.ctx,
                    dispatch: (c) => input.dispatch({ t: 'screen-puzzle-builder.got-play-msg', c }),
                    flow,
                    model: puzzleBuilder.playMode,
                  }),
                ]}
              />
            }
          />

          <BottomButtons.Root>
            <SaveChangesFrontend.ViewBottomButtons {...input} model={input.model} />

            <BottomButtons.Button
              icon={(input) => <IconPen {...input} />}
              label={input.ctx.t('flow.edit-mode')}
              classNames={{ button: 'text-amber-500' }}
              onClick={() => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-edit-mode-button' })}
            />
            {more}
          </BottomButtons.Root>
        </div>
      )
    }
  }
}

const ViewSpectating: BuilderTypes.FrontendModule['View'] = (input) => {
  if (!input.modelSpace.screenPuzzleBuilder) {
    return null
  }

  return (
    <LayoutGame ctx={input.ctx} isSpectating>
      <div className='flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll'>
        <ProfileListItem
          ctx={input.ctx}
          profile={input.ctx.profiles[input.ctx.space.hostId]}
          subtitle={input.ctx.t('app.editor')}
        />
        <VariantBoard.View disabled model={ScreenPuzzleBuilderSpace.toFlow(input.modelSpace.screenPuzzleBuilder)} />
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

const updateMoreDrawer: BuilderTypes.FrontendModule['update'] = (input) => {
  const { msg, model } = input
  switch (msg?.t) {
    case 'screen-puzzle-builder.user-closed-more-drawer': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: null,
        },
      }
    }
    case 'screen-puzzle-builder.user-clicked-more-button': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: 'more',
        },
      }
    }
    default: {
      return {
        model,
      }
    }
  }
}

export const ViewMoreDrawer: BuilderTypes.FrontendModule['View'] = (input) => {
  return (
    <Drawer
      id='more-drawer'
      open={input.model.puzzleBuilderOpened === 'more'}
      onClose={() =>
        input.dispatch({
          t: 'screen-puzzle-builder.user-closed-more-drawer',
        })
      }
      position='bottom'
    >
      <EditPuzzleNameFrontend.View {...input} />
      <DeleteForeverFrontend.View {...input} />
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

export const ScreenPuzzleBuilderFrontend = {
  update,
  View,
}
