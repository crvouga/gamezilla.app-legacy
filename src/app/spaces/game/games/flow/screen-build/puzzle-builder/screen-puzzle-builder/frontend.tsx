import { withEventId } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { IconPen, IconPlay } from '~/@/ui'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ParentScreenProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { LayoutGame } from '../../../../@/ui/game-layout'
import { ProfileListItem } from '../../../../@/ui/list-item-profile'
import { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { ModeEdit } from '../../../@/mode-edit'
import { ModePlay } from '../../../@/mode-play'
import { SolutionHash } from '../../../@/solutions/solution-hash/solution-hash'
import { SolutionsLoaderFrontend } from '../../../@/solutions/solutions-loader/frontend'
import { BoardLayout } from '../../../@/ui/board-layout'
import { VariantBoard } from '../../../@/variant'
import * as BuilderTypes from '../../types'
import { ScreenPuzzleBuilderSpace } from './space'
import { DeleteForeverFrontend } from './surface-delete-forever/frontend'
import { EditPuzzleNameFrontend } from './surface-edit-puzzle-name/frontend'
import { SaveChangesFrontend } from './surface-save-changes/frontend'
import { MsgFrontend } from './types'

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
    (model) => updateSolutionsLoader({ ...input, model }),
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
          withEventId({ t: 'screen-puzzle-builder.user-clicked-edit-mode-button', userId: ctx.currentUser.userId }),
        ],
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      }
    }

    case 'screen-puzzle-builder.user-clicked-play-mode-button': {
      return {
        model,
        msgSpace: [
          withEventId({ t: 'screen-puzzle-builder.user-clicked-play-mode-button', userId: ctx.currentUser.userId }),
        ],
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }

    case 'screen-puzzle-builder.user-clicked-open-more-drawer-button': {
      return {
        model: { ...model, puzzleBuilderOpened: 'more' },
        msgCmd: [playSound(APP_SOUND.surfaceOpened)],
      }
    }

    case 'screen-puzzle-builder.user-closed-more-drawer': {
      return {
        model: { ...model, puzzleBuilderOpened: null },
        msgCmd: [playSound(APP_SOUND.surfaceClosed)],
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

      const flow = ScreenPuzzleBuilderSpace.toFlow(input.modelSpace.screenPuzzleBuilder)
      const updated = ModePlay.update({
        msg: input.msgSpace.c,
        model: input.modelSpace.screenPuzzleBuilder.modePlay,
        ctx: ModePlay.initCtx({ flow, solutions: input.ctx.solutions }),
      })

      return {
        model: input.model,
        msgCmd: ModePlay.eventsToFrontendCmd(input.ctx, updated.events),
      }
    }
    case 'screen-puzzle-builder.got-edit-msg': {
      if (input.modelSpace.screenPuzzleBuilder?.mode.t !== 'edit') return { model: input.model }

      const updated = ModeEdit.update({
        model: input.modelSpace.screenPuzzleBuilder.modeEdit,
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
          return { model: input.model }
        }
      }
    }

    default: {
      return { model: input.model }
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
  if (!input.modelSpace.screenPuzzleBuilder) return <ViewSpectating {...input} />

  const isSpectating = input.ctx.currentUser.userId !== input.ctx.space.hostId

  if (isSpectating) return <ViewSpectating {...input} />

  const parentScreen = toParentScreenProps(input)

  if (!parentScreen) return <ViewSpectating {...input} />

  const screenCtx: FlowFrontendCtx = { ...input.ctx, parentScreen }

  return <ViewMode {...input} ctx={screenCtx} />
}

const toParentScreenProps = (input: Parameters<BuilderTypes.FrontendModule['View']>[0]): ParentScreenProps | null => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
  if (!puzzleBuilder) return input.ctx.parentScreen
  return {
    id: 'puzzle-builder-screen',
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
          ...viewToggleModeAction(puzzleBuilder.mode.t, input),
          ...SaveChangesFrontend.viewActions(input),
          ...EditPuzzleNameFrontend.viewActions(input),
          ...DeleteForeverFrontend.viewActions(input),
        ],
      },
    },
  }
}

const viewToggleModeAction = (
  mode: 'edit' | 'play',
  input: Parameters<BuilderTypes.FrontendModule['View']>[0],
): ScreenAction[] => {
  switch (mode) {
    case 'edit': {
      return [
        {
          icon: (input) => <IconPlay {...input} />,
          label: input.ctx.t('flow.play-mode'),
          classNames: { button: 'text-blue-500' },
          onClick: () => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-play-mode-button' }),
        },
      ]
    }
    case 'play': {
      return [
        {
          icon: (input) => <IconPen {...input} />,
          label: input.ctx.t('flow.edit-mode'),
          classNames: { button: 'text-amber-500' },
          onClick: () => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-edit-mode-button' }),
        },
      ]
    }
  }
}

const ViewMode: BuilderTypes.FrontendModule['View'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
  if (!puzzleBuilder) return null
  switch (puzzleBuilder.mode.t) {
    case 'edit':
      return <ViewModeEdit {...input} />
    case 'play':
      return <ViewModePlay {...input} />
  }
}

const ViewModeEdit: BuilderTypes.FrontendModule['View'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
  if (!puzzleBuilder) return null

  return (
    <ModeEdit.View
      {...input}
      model={puzzleBuilder.modeEdit}
      dispatch={(c) => input.dispatch({ t: 'screen-puzzle-builder.got-edit-msg', c })}
      screenLayout={{
        parentScreen: input.ctx.parentScreen,
        navBar: {
          onBack: () => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-exit-button' }),
          title: input.ctx.t('flow-puzzle-name', puzzleBuilder.puzzle.name),
        },
      }}
    />
  )
}
const ViewModePlay: BuilderTypes.FrontendModule['View'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
  if (!puzzleBuilder) return null

  const flow = ScreenPuzzleBuilderSpace.toFlow(puzzleBuilder)

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
        <BoardLayout>
          <div className='flex w-full items-center justify-center gap-1 p-2'>{input.ctx.t('flow.playing')}</div>
          <ModePlay.View
            model={puzzleBuilder.modePlay}
            flow={flow}
            dispatch={(c) => input.dispatch({ t: 'screen-puzzle-builder.got-play-msg', c })}
            showSolvedAnimation
          />
        </BoardLayout>
      )}
      actionBar={{
        variant: {
          t: 'uniform',
          actions: [
            ...ModePlay.viewScreenActions({
              ctx: ModePlay.initCtx({ ...input.ctx, flow }),
              dispatch: (c) => input.dispatch({ t: 'screen-puzzle-builder.got-play-msg', c }),
              model: puzzleBuilder.modePlay,
              flow,
            }),
          ],
        },
      }}
    />
  )
}

const ViewSpectating: BuilderTypes.FrontendModule['View'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
  if (!puzzleBuilder) return null

  return (
    <ScreenLayout
      parentScreen={input.ctx.parentScreen}
      id='puzzle-builder-screen-mode-play'
      ctx={input.ctx}
      navBar={{
        title: input.ctx.t('flow-puzzle-name', puzzleBuilder.puzzle.name),
      }}
      renderBody={() => (
        <LayoutGame ctx={input.ctx} isSpectating>
          <div className='flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll'>
            <ProfileListItem
              ctx={input.ctx}
              profile={input.ctx.profiles[input.ctx.space.hostId]}
              subtitle={input.ctx.t('app.editor')}
            />
            <VariantBoard.View disabled model={puzzleBuilder.puzzle.flow} />
          </div>
        </LayoutGame>
      )}
    />
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

//
//
//
//
//
//

const updateSolutionsLoader: BuilderTypes.FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-solutions-loader-msg': {
      return { model: input.model, msgCmd: [SolutionsLoaderFrontend.gotMsg(input.msg.c)] }
    }
  }
  return { model: input.model }
}

const subscriptions: BuilderTypes.FrontendModule['subscriptions'] = (input) => {
  if (!input.modelSpace.screenPuzzleBuilder) return Sub.None

  const flow = ScreenPuzzleBuilderSpace.toFlow(input.modelSpace.screenPuzzleBuilder)

  const solutionsHash = SolutionHash.init(flow)

  const sub = SolutionsLoaderFrontend.watch(
    input.ctx,
    solutionsHash,
    (msg): MsgFrontend => ({ t: 'got-solutions-loader-msg', c: msg }),
  )

  return sub
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
  subscriptions,
}
