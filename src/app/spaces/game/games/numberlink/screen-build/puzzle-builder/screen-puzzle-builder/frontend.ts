import { Sub } from '~/@/sub'
import { IconPen, IconPlay } from '~/@/ui/icon'
import { sx } from '~/@/vdom/style/sx'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ParentScreenProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { LayoutGame } from '../../../../@/ui/game-layout'
import { ProfileMenuItem } from '../../../../@/ui/profile-menu-item'
import { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { ModeEdit } from '../../../@/mode-edit'
import { ModeEditFrontend } from '../../../@/mode-edit/frontend'
import { ModePlay } from '../../../@/mode-play'
import { ModePlayFrontend } from '../../../@/mode-play/frontend'
import { SolutionHash } from '../../../@/solutions/solution-hash/solution-hash'
import { SolutionsDbQueryCache } from '../../../@/solutions/solutions-db-query-cache'
import { BoardLayout } from '../../../@/ui/board-layout'
import { BorderImpl } from '../../../@/ui/border-impl'
import { NumberlinkVariantBoard } from '../../../@/variant'
import * as BuilderTypes from '../../types'
import { ScreenPuzzleBuilderSpace } from './space'
import { DeleteForeverFrontend } from './surface-delete-forever/frontend'
import { EditPuzzleNameFrontend } from './surface-edit-puzzle-name/frontend'
import { SaveChangesFrontend } from './surface-save-changes/frontend'

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
        msgSpace: [msg],
      }
    }

    case 'screen-puzzle-builder.user-clicked-edit-mode-button': {
      return {
        model,
        msgSpace: [{ t: 'screen-puzzle-builder.user-clicked-edit-mode-button', userId: ctx.currentUser.userId }],
        msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)],
      }
    }

    case 'screen-puzzle-builder.user-clicked-play-mode-button': {
      return {
        model,
        msgSpace: [{ t: 'screen-puzzle-builder.user-clicked-play-mode-button', userId: ctx.currentUser.userId }],
        msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)],
      }
    }

    case 'screen-puzzle-builder.user-clicked-open-more-drawer-button': {
      return {
        model: { ...model, puzzleBuilderOpened: 'more' },
        msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceOpened)],
      }
    }

    case 'screen-puzzle-builder.user-closed-more-drawer': {
      return {
        model: { ...model, puzzleBuilderOpened: null },
        msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceClosed)],
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

      const numberlink = ScreenPuzzleBuilderSpace.toNumberlink(input.modelSpace.screenPuzzleBuilder)
      const solutions = SolutionsDbQueryCache.read(input.ctx, SolutionHash.init(numberlink))

      const updated = ModePlay.update({
        msg: input.msgSpace.c,
        model: input.modelSpace.screenPuzzleBuilder.modePlay,
        ctx: ModePlay.initCtx({ numberlink: numberlink, solutions }),
      })

      return {
        model: input.model,
        msgOut: ModePlay.eventsToFrontendCmd(input.ctx, updated.events),
      }
    }
    case 'screen-puzzle-builder.got-edit-msg': {
      if (input.modelSpace.screenPuzzleBuilder?.mode.t !== 'edit') return { model: input.model }

      const updated = ModeEdit.update({
        model: input.modelSpace.screenPuzzleBuilder.modeEdit,
        msg: input.msgSpace.c,
        numberlink: input.modelSpace.screenPuzzleBuilder.puzzle.model,
      })

      if (!updated.msgCmd) return { model: input.model }

      switch (updated.msgCmd.t) {
        case 'play-sound': {
          return {
            model: input.model,
            msgOut: [PlaySoundCmd.init(updated.msgCmd.sound)],
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

const View: BuilderTypes.FrontendModule['View'] = (input) => {
  if (!input.modelSpace.screenPuzzleBuilder) return h(ViewSpectating, input)

  const isSpectating = input.ctx.currentUser.userId !== input.ctx.space.hostId

  if (isSpectating) return h(ViewSpectating, input)

  const parentScreen = toParentScreenProps(input)

  if (!parentScreen) return h(ViewSpectating, input)

  const screenCtx: FlowFrontendCtx = { ...input.ctx, parentScreen }

  return h(ViewMode, { ...input, ctx: screenCtx })
}

const toParentScreenProps = (input: Parameters<BuilderTypes.FrontendModule['View']>[0]): ParentScreenProps | null => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
  if (!puzzleBuilder) return input.ctx.parentScreen
  return {
    id: 'puzzle-builder-screen',
    parentScreen: input.ctx.parentScreen,
    dataTestId: 'numberlink/puzzle-builder-screen',
    navBar: {
      back: {
        onPress: () => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-exit-button' }),
        renderSurface: ({ dropDown }) => h(SaveChangesFrontend.ViewUnsavedChangesSurface, { ...input, dropDown }),
      },
      title: input.ctx.t('numberlink-puzzle-name', puzzleBuilder.puzzle.name),
    },
    actionBar: {
      id: 'puzzle-builder-actions',
      variant: {
        t: 'uniform',
        limit: {
          max: Infinity,
          onToggle: () => {
            if (input.model.puzzleBuilderOpened === 'more') {
              input.dispatch({ t: 'screen-puzzle-builder.user-closed-more-drawer' })
              return
            }
            input.dispatch({ t: 'screen-puzzle-builder.user-clicked-open-more-drawer-button' })
          },
          open: input.model.puzzleBuilderOpened === 'more',
        },
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
          id: input.ctx.t('game.numberlink.play-mode'),
          renderIcon: (input) => h(IconPlay, input),
          label: input.ctx.t('game.numberlink.play-mode'),
          styles: { button: sx({ textColor: 'blue-500' }) },
          onPress: () => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-play-mode-button' }),
        },
      ]
    }
    case 'play': {
      return [
        {
          id: input.ctx.t('game.numberlink.edit-mode'),
          renderIcon: (input) => h(IconPen, input),
          label: input.ctx.t('game.numberlink.edit-mode'),
          styles: { button: sx({ textColor: 'amber-500' }) },
          onPress: () => input.dispatch({ t: 'screen-puzzle-builder.user-clicked-edit-mode-button' }),
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
      return h(ViewModeEdit, input)
    case 'play':
      return h(ViewModePlay, input)
  }
}

const ViewModeEdit: BuilderTypes.FrontendModule['View'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
  if (!puzzleBuilder) return null

  return h(ModeEditFrontend.View, {
    ...input,
    model: puzzleBuilder.modeEdit,
    dispatch: (c) => input.dispatch({ t: 'screen-puzzle-builder.got-edit-msg', c }),
    screenLayout: { parentScreen: input.ctx.parentScreen },
  })
}

const ViewModePlay: BuilderTypes.FrontendModule['View'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
  if (!puzzleBuilder) return null

  const numberlink = ScreenPuzzleBuilderSpace.toNumberlink(puzzleBuilder)

  return h(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    dataTestId: 'numberlink/puzzle-builder-play-mode-screen',
    id: 'puzzle-builder-screen-mode-play',
    ctx: input.ctx,
    renderBody: () =>
      h(BoardLayout, {}, [
        h(
          Box,
          {
            style: sx({
              flexDirection: 'row',
              width: 'full',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              padding: 2,
            }),
          },
          [h(Text, { text: input.ctx.t('game.numberlink.playing') })],
        ),
        h(ModePlayFrontend.View, {
          platform: input.ctx.platform,
          model: puzzleBuilder.modePlay,
          numberlink: numberlink,
          dispatch: (c) => input.dispatch({ t: 'screen-puzzle-builder.got-play-msg', c }),
          showSolvedAnimation: true,
        }),
      ]),
    actionBar: {
      variant: {
        t: 'uniform',
        actions: ModePlayFrontend.viewActions({
          ctx: ModePlay.initCtx({ ...input.ctx, numberlink: numberlink }),
          dispatch: (c) => input.dispatch({ t: 'screen-puzzle-builder.got-play-msg', c }),
          model: puzzleBuilder.modePlay,
          dispatchCmd: (c) => {
            input.dispatch({ t: 'got-msg-out', c })
          },
        }),
      },
    },
  })
}

const ViewSpectating: BuilderTypes.FrontendModule['View'] = (input) => {
  const puzzleBuilder = input.modelSpace.screenPuzzleBuilder
  if (!puzzleBuilder) return null
  const numberlink = ScreenPuzzleBuilderSpace.toNumberlink(puzzleBuilder)

  return h(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    id: 'puzzle-builder-screen-mode-play',
    dataTestId: 'numberlink/puzzle-builder-screen',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('numberlink-puzzle-name', puzzleBuilder.puzzle.name),
    },
    renderBody: () =>
      h(LayoutGame, { ctx: input.ctx, isSpectating: true }, [
        h(Box, { style: sx({ flexDirection: 'col', width: 'full', flex: 1 }) }, [
          h(ProfileMenuItem, {
            ctx: input.ctx,
            profile: input.ctx.profilesByUserId[input.ctx.space.hostId],
            subtitle: input.ctx.t('app.editor'),
          }),
          h(NumberlinkVariantBoard.View, {
            disabled: true,
            model: numberlink,
            platform: input.ctx.platform,
            impl: BorderImpl.fromPlatform(input.ctx.platform),
          }),
        ]),
      ]),
  })
}

export const capitalize = (s: string) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`
}

const updateMoreDrawer: BuilderTypes.FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'screen-puzzle-builder.user-closed-more-drawer': {
      return { model: { ...input.model, puzzleBuilderOpened: null } }
    }
    case 'screen-puzzle-builder.user-clicked-open-more-drawer-button': {
      return { model: { ...input.model, puzzleBuilderOpened: 'more' } }
    }
  }
  return { model: input.model }
}

const subscriptions: BuilderTypes.FrontendModule['subscriptions'] = (input) => {
  if (!input.modelSpace.screenPuzzleBuilder) return Sub.none()

  const numberlink = ScreenPuzzleBuilderSpace.toNumberlink(input.modelSpace.screenPuzzleBuilder)

  const play = input.modelSpace.screenPuzzleBuilder.modePlay

  if (!play) return Sub.none()

  return ModePlayFrontend.subscriptions(
    { model: play, ctx: { ...input.ctx, numberlink: numberlink } },
    (c): BuilderTypes.MsgFrontend => ({ t: 'got-msg-out', c }),
  )
}

export const ScreenPuzzleBuilderFrontend = {
  update,
  View,
  subscriptions,
}
