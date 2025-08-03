import { TranslatedText } from '~/@/l18n'
import { Sub } from '~/@/sub'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { IconArrowLeft, IconArrowRotateLeft, IconCheckmarkCircle, IconFlag, IconXMark } from '~/@/ui/icon'
import { Paper } from '~/@/ui/paper'
import { Spinner } from '~/@/ui/spinner'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
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
          return h(Box, { ...input }, [h(CoverArt, {})])
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
              style: theme({
                flexDirection: 'col',
                width: 'full',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }),
              ctx: input.ctx,
            },
            [
              h(
                Box,
                { style: theme({ flexDirection: 'row', width: 'full', alignItems: 'center', gap: 2, padding: 2 }) },
                [
                  h(PlayerSlot, { playerType: 'player-one', modelSpace, ctx: input.ctx }),
                  h(PlayerSlot, { playerType: 'player-two', modelSpace, ctx: input.ctx }),
                ],
              ),

              h(Feedback, { ctx: input.ctx, modelSpace }),

              h(Box, { style: theme({ position: 'relative', width: 'full' }) }, [
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
                    Box,
                    {
                      style: theme({
                        position: 'absolute',
                        inset: 0,
                        flexDirection: 'row',
                        height: 'full',
                        width: 'full',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'black/50',
                      }),
                    },
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
                    renderIcon: (props) => h(IconFlag, props),
                    label: input.ctx.t('app.resign'),
                    onPress: () => {
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
                    renderIcon: (props) => h(IconArrowLeft, props),
                    label: input.ctx.t('app.exit'),
                    onPress: () => {
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
                    renderIcon: (props) => h(IconArrowRotateLeft, props),
                    label: input.ctx.t('game.rematch'),
                    onPress: () => {
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
    return h(Box, {}, [
      h(Box, { style: theme({ pb: 4, textAlign: 'center', textSize: 'xl' }) }, [
        h(Text, { text: 'Waiting for response' }),
      ]),
      h(Spinner, { style: { ...theme({ size: 8 }) } }),
      h(Button, {
        variant: 'contained',
        width: 'full',
        onPress: () =>
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
    return h(Box, {}, [
      h(Box, {}, [h(Text, { text: 'Rematch?' })]),
      h(
        Box,
        {
          style: theme({ flexDirection: 'row', width: 'full', alignItems: 'center', justifyContent: 'center', gap: 4 }),
        },
        [
          h(Button, {
            variant: 'contained',
            onPress: () =>
              dispatch({
                t: 'user-responded-to-rematch-request',
                userId: ctx.currentUser.userId,
                response: 'Decline',
              }),
            renderIconStart: (iconInput) => h(IconXMark, iconInput),
            text: ctx.t('app.decline'),
            width: 'full',
          }),
          h(Button, {
            variant: 'contained',
            width: 'full',
            onPress: () =>
              dispatch({
                t: 'user-responded-to-rematch-request',
                userId: ctx.currentUser.userId,
                response: 'Decline',
              }),
            renderIconStart: (iconInput) => h(IconCheckmarkCircle, iconInput),
            text: ctx.t('app.accept'),
          }),
        ],
      ),
    ])
  }

  if (modelSpace.gameOver.type === 'Draw') {
    return h(Box, { style: theme({ textSize: 'xl' }) }, [h(Text, { text: 'Tie' })])
  }

  if (modelSpace.gameOver.type === 'resignation') {
    const { resigner } = modelSpace.gameOver

    const winner: PlayerType = resigner === 'player-one' ? 'player-two' : 'player-one'

    if (currentPlayerType === null) {
      return h(Box, {}, [
        h(
          Box,
          {
            style: theme({
              flexDirection: 'row',
              width: 'full',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }),
          },
          [
            h(PlayerIcon, { playerType: winner }),
            h(Avatar, {
              style: theme({ size: 12 }),
              alt: '',
              src: UserProfile.toAvatarUrl(ctx.profilesByUserId[modelSpace.players[winner]]),
            }),
            h(Box, {}, [h(Text, { text: 'Winner' })]),
          ],
        ),
      ])
    }

    return h(Box, {}, [
      h(Box, {}, [h(Text, { text: currentPlayerType === winner ? 'You Won' : 'You Lost' })]),
      h(Box, {}, [h(Text, { text: 'by resignation' })]),
    ])
  }

  if (modelSpace.gameOver.type === 'Winner') {
    const { winner } = modelSpace.gameOver

    if (currentPlayerType === null) {
      return h(
        Box,
        {
          style: theme({ flexDirection: 'col', width: 'full', alignItems: 'center', justifyContent: 'center', gap: 2 }),
        },
        [
          h(
            Box,
            {
              style: theme({
                flexDirection: 'row',
                width: 'full',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }),
            },
            [
              h(PlayerIcon, { playerType: winner, style: theme({ size: 20 }) }),
              h(Avatar, {
                style: theme({ size: 20 }),
                src: UserProfile.toAvatarUrl(ctx.profilesByUserId[modelSpace.players[winner]]),
              }),
            ],
          ),
          h(Box, {}, [h(Text, { text: 'Winner' })]),
        ],
      )
    }

    return h(Box, {}, [h(Text, { text: currentPlayerType === winner ? 'You Won' : 'You Lost' })])
  }

  return null
}

const Feedback = ({ ctx, modelSpace }: { ctx: SpaceFrontendCtx; modelSpace: StateGame | StateGameOver }) => {
  if (modelSpace.type === 'game-over') {
    return h(Typography, {
      text: TranslatedText.of('Game Over'),
      color: 'text-secondary',
      style: theme({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }),
    })
  }

  const turn = toTurn(modelSpace.columns)

  const currentUserPlayerType = toPlayerType(ctx.currentUser.userId, modelSpace)

  if (currentUserPlayerType !== turn) {
    return h(
      Box,
      {
        style: theme({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          textAlign: 'center',
        }),
      },
      [
        h(PlayerIcon, { style: theme({ width: 4, height: 4 }), playerType: turn }),
        h(Typography, { text: TranslatedText.of('Turn'), color: 'text-secondary' }),
      ],
    )
  }

  return h(
    Box,
    {
      style: theme({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
      }),
    },
    [h(PlayerIcon, { style: theme({ width: 4, height: 4 }), playerType: turn }), h(Text, { text: 'Your Turn' })],
  )
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
  return h(
    Paper,
    {
      style: theme({
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        gap: 2,
        overflow: 'hidden',
        rounded: 'md',
        padding: 2,
      }),
    },
    [
      h(PlayerIcon, { style: theme({ width: 8, height: 8 }), playerType }),
      h(Avatar, {
        style: theme({ width: 8, height: 8 }),
        alt: '',
        src: UserProfile.toAvatarUrl(ctx.profilesByUserId[modelSpace.players[playerType]]),
      }),
      h(Typography, {
        text: TranslatedText.of(ctx.profilesByUserId[modelSpace.players[playerType]]?.username ?? '...'),
        color: 'text-secondary',
      }),
    ],
  )
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
