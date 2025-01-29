import { withEventId } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { IconDeleteForever, IconPen, IconPlay } from '~/@/ui'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { LayoutGame } from '../../../@/ui/layout-game'
import { ProfileListItem } from '../../../@/ui/profile-list-item'
import { FlowFrontendCtx } from '../../@/frontend/ctx'
import { ModeEdit } from '../../@/mode-edit'
import { ModePlay } from '../../@/mode-play'
import { VariantBoard } from '../../@/variant'
import * as BuilderTypes from '../types'
import { ScreenPuzzleBuildSpace } from './space'
import { DeleteForeverFrontend } from './surface-delete-forever/frontend'
import { EditPuzzleNameFrontend } from './surface-edit-puzzle-name/frontend'
import { SaveChangesFrontend } from './surface-save-changes/frontend'

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
          withEventId({ t: 'screen-puzzle-builder.user-clicked-play-mode-button', userId: ctx.currentUserId }),
        ],
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }

    case 'screen-puzzle-builder.user-clicked-open-more-drawer-button': {
      return {
        model: { ...model, puzzleBuilderOpened: 'more' },
        msgCmd: [playSound(APP_SOUND.drawerOpened)],
      }
    }

    case 'screen-puzzle-builder.user-closed-more-drawer': {
      return {
        model: { ...model, puzzleBuilderOpened: null },
        msgCmd: [playSound(APP_SOUND.drawerClosed)],
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
      if (input.modelSpace.screenPuzzleBuilder?.mode.t !== 'play') return { model: input.model }

      const flow = ScreenPuzzleBuildSpace.toFlow(input.modelSpace.screenPuzzleBuilder)
      const updated = ModePlay.update({
        msg: input.msgSpace.c,
        model: input.modelSpace.screenPuzzleBuilder.ModePlay,
        ctx: ModePlay.initCtx({
          flow,
          solutions: input.ctx.solutions,
        }),
      })

      return {
        model: input.model,
        msgCmd: ModePlay.eventsToFrontendCmd(input.ctx, updated.events),
      }
    }
    case 'screen-puzzle-builder.got-edit-msg': {
      if (input.modelSpace.screenPuzzleBuilder?.mode.t !== 'edit') return { model: input.model }

      const updated = ModeEdit.update({
        model: input.modelSpace.screenPuzzleBuilder.ModeEdit,
        msg: input.msgSpace.c,
        flow: input.modelSpace.screenPuzzleBuilder.puzzle.flow,
      })

      if (!updated.msgCmd) return { model: input.model }

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

  if (!input.modelSpace.screenPuzzleBuilder) return null

  const isSpectating = ctx.currentUserId !== ctx.space.hostId

  if (isSpectating) return <ViewSpectating {...input} />

  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder

  const screenCtx: FlowFrontendCtx = {
    ...input.ctx,
    parentScreen: {
      parentScreen: input.ctx.parentScreen,
      actionBar: {
        id: 'puzzle-builder-actions',
        variant: {
          limit: {
            max: 3,
            onToggle: () => {
              if (input.model.puzzleBuilderOpened === 'more') {
                input.dispatch({ t: 'screen-puzzle-builder.user-closed-more-drawer' })
                return
              }

              input.dispatch({ t: 'screen-puzzle-builder.user-clicked-open-more-drawer-button' })
            },
            open: input.model.puzzleBuilderOpened === 'more',
          },
          t: 'uniform',
          actions: [
            ...SaveChangesFrontend.viewBottomButtons({ model: input.model, dispatch: input.dispatch, ctx: input.ctx }),
            puzzleBuilder.mode.t === 'edit'
              ? {
                  icon: (input) => <IconPlay {...input} />,
                  label: input.ctx.t('flow.play-mode'),
                  classNames: { button: 'text-blue-500' },
                  onClick: () => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-play-mode-button' }),
                }
              : null,

            puzzleBuilder.mode.t === 'play'
              ? {
                  icon: (input) => <IconPen {...input} />,
                  label: input.ctx.t('flow.edit-mode'),
                  classNames: { button: 'text-amber-500' },
                  onClick: () => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-edit-mode-button' }),
                }
              : null,
            {
              icon: (input) => <IconPen {...input} />,
              label: input.ctx.t('app.edit-name'),
              onClick: () => input.dispatch({ t: 'puzzle.edit-name.user-clicked-button' }),
            },
            {
              icon: (input) => <IconDeleteForever {...input} />,
              label: input.ctx.t('app.delete'),
              color: 'danger',
              onClick: () => input.dispatch({ t: 'delete-forever.user-clicked-delete-button' }),
            },
          ],
        },
      },
    },
  }

  return (
    <>
      <EditPuzzleNameFrontend.View {...input} ctx={screenCtx} />
      <DeleteForeverFrontend.View {...input} ctx={screenCtx} />
      <SaveChangesFrontend.ViewSurface {...input} ctx={screenCtx} />
      <ViewMode {...input} ctx={screenCtx} />
    </>
  )
}

const ViewMode: BuilderTypes.FrontendModule['View'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder

  if (!puzzleBuilder) return null

  switch (puzzleBuilder.mode.t) {
    case 'edit':
      return (
        <ModeEdit.View
          model={puzzleBuilder.ModeEdit}
          ctx={input.ctx}
          dispatch={(c) => input.dispatch({ t: 'screen-puzzle-builder.got-edit-msg', c })}
          screenLayout={{
            navBar: {
              onBack: () => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-exit-button' }),
              title: input.ctx.t('flow-puzzle-name', puzzleBuilder.puzzle.name),
            },
          }}
        />
      )
    case 'play':
      return <ViewModePlay {...input} />
  }
}

const ViewModePlay: BuilderTypes.FrontendModule['View'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
  if (!puzzleBuilder) return null

  const flow = ScreenPuzzleBuildSpace.toFlow(puzzleBuilder)
  const status = input.modelSpace.screenPuzzleBuilder
    ? ScreenPuzzleBuildSpace.toStatus(input.modelSpace.screenPuzzleBuilder)
    : 'solving'

  return (
    <ScreenLayout
      parentScreen={input.ctx.parentScreen}
      id='puzzle-builder-screen-mode-play'
      ctx={input.ctx}
      navBar={{
        onBack: () => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-exit-button' }),
        title: input.ctx.t('flow-puzzle-name', puzzleBuilder.puzzle.name),
      }}
      renderBody={() => (
        <div className='flex w-full flex-1 flex-col'>
          <div className='flex w-full items-center justify-center gap-1 p-2'>{input.ctx.t('flow.playing')}</div>
          <ModePlay.View
            model={puzzleBuilder.ModePlay}
            flow={flow}
            dispatch={(c) => input.dispatch({ t: 'screen-puzzle-builder.got-play-msg', c })}
            showSolvedAnimation
          />
        </div>
      )}
      actionBar={{
        variant: {
          t: 'uniform',
          actions: [
            ModePlay.viewHintAction({
              ctx: ModePlay.initCtx({ ...input.ctx, flow }),
              dispatch: (c) => input.dispatch({ t: 'screen-puzzle-builder.got-play-msg', c }),
              model: puzzleBuilder.ModePlay,
              disabled: status === 'solved',
            }),
            ModePlay.viewResetAction({
              ctx: input.ctx,
              dispatch: (c) => input.dispatch({ t: 'screen-puzzle-builder.got-play-msg', c }),
              flow,
              model: puzzleBuilder.ModePlay,
            }),
          ],
        },
      }}
    />
  )
}

const ViewSpectating: BuilderTypes.FrontendModule['View'] = (input) => {
  if (!input.modelSpace.screenPuzzleBuilder) return null

  return (
    <LayoutGame ctx={input.ctx} isSpectating>
      <div className='flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll'>
        <ProfileListItem
          ctx={input.ctx}
          profile={input.ctx.profiles[input.ctx.space.hostId]}
          subtitle={input.ctx.t('app.editor')}
        />
        <VariantBoard.View disabled model={ScreenPuzzleBuildSpace.toFlow(input.modelSpace.screenPuzzleBuilder)} />
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
      return { model: { ...model, puzzleBuilderOpened: null } }
    }
    case 'screen-puzzle-builder.user-clicked-open-more-drawer-button': {
      return { model: { ...model, puzzleBuilderOpened: 'more' } }
    }
    default: {
      return { model }
    }
  }
}

const subscriptions: BuilderTypes.FrontendModule['subscriptions'] = (_input) => {
  return Sub.None
}

export const ScreenPuzzleBuilderFrontend = {
  update,
  View,
  subscriptions,
}
