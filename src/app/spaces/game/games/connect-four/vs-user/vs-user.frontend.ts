import { TranslatedText } from '~/@/l18n'
import { Sub } from '~/@/sub'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { IconArrowLeft, IconArrowRotateLeft, IconCheckmarkCircle, IconFlag, IconSpinner, IconXMark } from '~/@/ui/icon'
import { Paper } from '~/@/ui/paper'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { UserProfile } from '~/app/@/data/user-profile'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { SurfaceConfirmation } from '~/app/@/ui/surface/confirmation/surface-confirmation'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { VsUserSetupScreen } from '~/app/spaces/game/games/@/vs-user'
import { LayoutGame } from '../../@/ui/game-layout'
import { type PlayerType, toTurn } from '../@/connect-four'
import { PlayerIcon, ViewColumns } from '../@/connect-four-ui'
import { CoverArt } from '../@/connect-four-ui/connect-four-cover-art'
import {
  type ModelFrontend,
  type ModelSpace,
  type MsgFrontend,
  type MsgSpace,
  type MsgToBackend,
  type MsgToFrontend,
  type StateGame,
  type StateGameOver,
  toPlayerType,
} from './vs-user.types'

//
//
//
//
//
//
//

type Module = GameFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
  Ctx: SpaceFrontendCtx & { onQuit: () => void }
}>

//
//
//
// Model
//
//
//

const init: Module['init'] = {
  ghostIndex: null,
  openedModal: null,
}

//
//
//
// Update
//
//
//

const update: Module['update'] = (input) => {
  return GameFrontendModule.andThen({ model: input.model }, (model) => updateFromMsg(model)(input))
}

const updateFromMsg =
  (model: ModelFrontend): Module['update'] =>
  (input) => {
    const { msg } = input

    if (!msg) {
      return {
        model,
      }
    }

    switch (msg.t) {
      case 'clicked-resign': {
        return {
          model: {
            ...model,
            openedModal: 'confirm-resign',
          },
        }
      }

      case 'hovered-over-columns': {
        return {
          model: {
            ...model,
            ghostIndex: msg.columnIndex,
          },
        }
      }

      case 'close-modal': {
        return {
          model: {
            ...model,
            openedModal: null,
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

//
//
//
// Subscriptions
//
//
//

const subscriptions: Module['subscriptions'] = () => {
  return Sub.none()
}

//
//
//
// View
//
//
//

const View: Module['View'] = (input) => {
  if (!input.model) {
    return null
  }

  switch (input.modelSpace.type) {
    case 'setup': {
      return h(VsUserSetupScreen, {
        ctx: input.ctx,
        title: input.ctx.t('connect-four'),
        renderCoverArt: (input) => {
          return h('div', { ...input }, [h(CoverArt, {})])
        },
        onStartGame: () => {
          input.dispatch({
            t: 'user-started-game',
            userId: input.ctx.currentUser.userId,
          })
        },
        onQuit: input.ctx.onQuit,
        playerOne: {
          label: input.ctx.t('connect-four.red'),
          onStartPlaying: () => {
            input.dispatch({
              t: 'user-started-playing',
              playerType: 'player-one',
              userId: input.ctx.currentUser.userId,
            })
          },
          onStopPlaying: () => {
            input.dispatch({
              t: 'user-stopped-playing',
              userId: input.ctx.currentUser.userId,
            })
          },
          renderIcon: (input) => {
            return h(PlayerIcon, { playerType: 'player-one', ...input })
          },
          userId: input.modelSpace.players['player-one'] ?? null,
        },
        playerTwo: {
          label: input.ctx.t('connect-four.yellow'),
          onStartPlaying: () => {
            input.dispatch({
              t: 'user-started-playing',
              userId: input.ctx.currentUser.userId,
              playerType: 'player-two',
            })
          },
          onStopPlaying: () => {
            input.dispatch({
              t: 'user-stopped-playing',
              userId: input.ctx.currentUser.userId,
            })
          },
          renderIcon: (input) => {
            return h(PlayerIcon, { playerType: 'player-two', ...input })
          },
          userId: input.modelSpace.players['player-two'] ?? null,
        },
      })
    }

    case 'game':
    case 'game-over': {
      const currentUserPlayerType = toPlayerType(input.ctx.currentUser.userId, input.modelSpace)
      const isSpectating = currentUserPlayerType === null
      const modelSpace = input.modelSpace
      return h(ScreenLayout, {
        parentScreen: input.ctx.parentScreen,
        id: 'connect-four-vs-user',
        ctx: input.ctx,
        renderBody: () =>
          h(
            LayoutGame,
            {
              isSpectating,
              class: 'flex w-full flex-1 flex-col items-center justify-center gap-2',
              ctx: input.ctx,
            },
            [
              h('div', { class: 'flex w-full items-center gap-2 px-2' }, [
                h(PlayerSlot, { playerType: 'player-one', modelSpace, ctx: input.ctx }),
                h(PlayerSlot, { playerType: 'player-two', modelSpace, ctx: input.ctx }),
              ]),

              h(Feedback, { ctx: input.ctx, modelSpace }),

              h('div', { class: 'relative w-full' }, [
                h(ViewColumns, {
                  columns: modelSpace.columns,
                  gameId: modelSpace.gameId,
                  onDropDisc: (columnIndex) =>
                    input.dispatch({
                      t: 'user-dropped-disc',
                      userId: input.ctx.currentUser.userId,
                      columnIndex,
                    }),
                  onHover: (columnIndex) =>
                    input.dispatch({
                      t: 'hovered-over-columns',
                      columnIndex,
                    }),
                  disabled: toTurn(modelSpace.columns) !== currentUserPlayerType || modelSpace.type === 'game-over',
                }),
                input.modelSpace.type === 'game-over' &&
                  h(
                    'div',
                    { class: 'absolute top-0 left-0 flex h-full w-full items-center justify-center bg-black/50' },
                    [
                      h(ViewGameOverMessage, {
                        dispatch: input.dispatch,
                        ctx: input.ctx,
                        modelSpace: input.modelSpace,
                      }),
                    ],
                  ),
              ]),

              h(SurfaceConfirmation, {
                id: 'resign-confirmation',
                position: 'bottom',
                title: input.ctx.t('app.resign'),
                ariaLabel: input.ctx.t('app.resign'),
                onCancel: () => input.dispatch({ t: 'close-modal' }),
                onClose: () => input.dispatch({ t: 'close-modal' }),
                confirmText: input.ctx.t('app.resign'),
                onConfirm: () => input.dispatch({ t: 'user-resigned', userId: input.ctx.currentUser.userId }),
                open: input.model.openedModal === 'confirm-resign',
                ctx: input.ctx,
                body: input.ctx.t('app.resign'),
                cancelText: input.ctx.t('app.cancel'),
              }),
            ],
          ),
        actionBar: {
          id: 'game-buttons',
          variant: {
            t: 'uniform',
            actions: [
              input.modelSpace.type === 'game'
                ? {
                    id: input.ctx.t('app.resign'),
                    icon: (props) => h(IconFlag, props),
                    label: input.ctx.t('app.resign'),
                    onClick: () => {
                      input.dispatch({
                        t: 'clicked-resign',
                        userId: input.ctx.currentUser.userId,
                      })
                    },
                  }
                : null,
              input.modelSpace.type === 'game-over' && input.ctx.currentUser.userId === input.ctx.space.hostId
                ? {
                    id: input.ctx.t('app.exit'),
                    icon: (props) => h(IconArrowLeft, props),
                    label: input.ctx.t('app.exit'),
                    onClick: () => {
                      input.dispatch({
                        t: 'user-stopped-game',
                        userId: input.ctx.currentUser.userId,
                      })
                    },
                  }
                : null,
              input.modelSpace.type === 'game-over' && input.ctx.currentUser.userId === input.ctx.space.hostId
                ? {
                    id: input.ctx.t('game.rematch'),
                    icon: (props) => h(IconArrowRotateLeft, props),
                    label: input.ctx.t('game.rematch'),
                    onClick: () => {
                      input.dispatch({
                        t: 'user-requested-rematch',
                        userId: input.ctx.currentUser.userId,
                      })
                    },
                  }
                : null,
            ],
          },
        },
      })
    }
  }
}

const ViewGameOverMessage = ({
  ctx,
  modelSpace,
  dispatch,
}: {
  modelSpace: StateGameOver
  ctx: AppFrontendCtx
  dispatch: (msg: MsgSpace) => void
}) => {
  const currentPlayerType = toPlayerType(ctx.currentUser.userId, modelSpace)

  if (modelSpace.rematch.type === 'Asking' && modelSpace.rematch.asker === currentPlayerType) {
    return h('div', {}, [
      h('p', { class: 'mb-4 text-center text-xl' }, ['Waiting for response']),
      h(IconSpinner, { class: 'mb-4 h-8 w-8 animate-spin' }),
      h(Button, {
        variant: 'contained',
        onClick: () =>
          dispatch({
            t: 'user-cancelled-rematch',
            userId: ctx.currentUser.userId,
          }),
        text: ctx.t('app.cancel'),
      }),
    ])
  }

  if (
    modelSpace.rematch.type === 'Asking' &&
    modelSpace.rematch.asker !== currentPlayerType &&
    currentPlayerType !== null
  ) {
    return h('div', {}, [
      h('p', {}, ['Rematch?']),
      h('div', { class: 'flex w-full items-center justify-center gap-4' }, [
        h(Button, {
          variant: 'contained',
          onClick: () =>
            dispatch({
              t: 'user-responded-to-rematch-request',
              userId: ctx.currentUser.userId,
              response: 'Decline',
            }),
          renderIconStart: (iconInput) => h(IconXMark, iconInput),
          text: ctx.t('app.decline'),
        }),
        h(Button, {
          variant: 'contained',
          onClick: () =>
            dispatch({
              t: 'user-responded-to-rematch-request',
              userId: ctx.currentUser.userId,
              response: 'Decline',
            }),
          renderIconStart: (iconInput) => h(IconCheckmarkCircle, iconInput),
          text: ctx.t('app.accept'),
        }),
      ]),
    ])
  }

  if (modelSpace.gameOver.type === 'Draw') {
    return h('p', { class: 'text-xl' }, ['Tie'])
  }

  if (modelSpace.gameOver.type === 'resignation') {
    const { resigner } = modelSpace.gameOver

    const winner: PlayerType = resigner === 'player-one' ? 'player-two' : 'player-one'

    if (currentPlayerType === null) {
      return h('div', {}, [
        h('div', { class: 'flex w-full items-center justify-center' }, [
          h(PlayerIcon, { playerType: winner }),
          h(Avatar, {
            class: 'size-12',
            alt: '',
            src: UserProfile.toAvatarUrl(ctx.profilesByUserId[modelSpace.players[winner]]),
          }),
        ]),
        h('p', {}, ['Winner']),
      ])
    }

    return h('div', {}, [
      h('p', {}, [currentPlayerType === winner ? 'You Won' : 'You Lost']),
      h('p', {}, ['by resignation']),
    ])
  }

  if (modelSpace.gameOver.type === 'Winner') {
    const { winner } = modelSpace.gameOver

    if (currentPlayerType === null) {
      return h('div', { class: 'flex w-full flex-col items-center justify-center gap-2' }, [
        h('div', { class: 'flex w-full items-center justify-center gap-2' }, [
          h(PlayerIcon, { playerType: winner, class: 'size-20' }),
          h(Avatar, {
            class: 'size-20',
            src: UserProfile.toAvatarUrl(ctx.profilesByUserId[modelSpace.players[winner]]),
          }),
        ]),
        h('p', {}, ['Winner']),
      ])
    }

    return h('p', {}, [currentPlayerType === winner ? 'You Won' : 'You Lost'])
  }

  return null
}

const Feedback = ({ ctx, modelSpace }: { ctx: SpaceFrontendCtx; modelSpace: StateGame | StateGameOver }) => {
  if (modelSpace.type === 'game-over') {
    return h(Typography, {
      text: TranslatedText.of('Game Over'),
      color: 'text-secondary',
      class: 'flex items-center justify-center',
    })
  }

  const turn = toTurn(modelSpace.columns)

  const currentUserPlayerType = toPlayerType(ctx.currentUser.userId, modelSpace)

  if (currentUserPlayerType !== turn) {
    return h('div', { class: 'flex items-center justify-center gap-2 text-center' }, [
      h(PlayerIcon, { class: 'h-4 w-4', playerType: turn }),
      h(Typography, { text: TranslatedText.of('Turn'), color: 'text-secondary' }),
    ])
  }

  return h('p', { class: 'flex items-center justify-center gap-2 text-center' }, [
    h(PlayerIcon, { class: 'h-4 w-4', playerType: turn }),
    'Your Turn',
  ])
}

const PlayerSlot = ({
  modelSpace,
  playerType,
  ctx,
}: {
  modelSpace: StateGame | StateGameOver
  playerType: PlayerType
  ctx: SpaceFrontendCtx
}) => {
  return h(Paper, { class: 'flex flex-1 items-center gap-2 overflow-hidden rounded p-2' }, [
    h(PlayerIcon, { class: 'h-8 w-8', playerType }),
    h(Avatar, {
      class: 'h-8 w-8',
      alt: '',
      src: UserProfile.toAvatarUrl(ctx.profilesByUserId[modelSpace.players[playerType]]),
    }),
    h(Typography, {
      text: TranslatedText.of(ctx.profilesByUserId[modelSpace.players[playerType]]?.username ?? '...'),
      color: 'text-secondary',
    }),
  ])
}

const ViewFeedItem: Module['ViewFeedItem'] = () => {
  return null
}

export const VsUser: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
}
