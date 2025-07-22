import { type WithEventId } from '~/@/event-sourced/event'
import { Box } from '~/@/vdom/box'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { IconArrowLeft, IconArrowRotateLeft, IconRightLeft } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import type { UserId } from '~/app/@/data/user-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { FeedItem } from '~/app/spaces/@/feed-item'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { IconBotHappy, IconBotLevel1, IconBotLevel4, VsBotGame, VsBotSetup } from '~/app/spaces/game/games/@/vs-bot'
import { LayoutGame } from '../../@/ui/game-layout'
import * as ConnectFour from '../@/connect-four'
import { CoverArt, PlayerOneIcon, PlayerTwoIcon, ViewColumns } from '../@/connect-four-ui'
import { ALL_BOT_LEVELS, type BotLevel } from './bot-level'
import {
  type ModelFrontend,
  type ModelSpace,
  type MsgFrontend,
  type MsgSpace,
  type MsgToBackend,
  type MsgToFrontend,
  updateSpace,
} from './vs-bot.types'

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
  Ctx: SpaceFrontendCtx

  MsgCmdIn: null
  MsgEvtOut: null
}>

//
//
//
//

const init: Module['init'] = {
  vsBotSetup: VsBotSetup.init,
  vsBotGame: VsBotGame.init(),
}

//
//
//
//
//

const update: Module['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg(model)(input),
    (model) => updateFromMsgSpace(model)(input),
    (model) => watchGameOver(model)(input),
  )
}

const watchGameOver =
  (model: ModelFrontend): Module['update'] =>
  (input) => {
    const { msgSpace, modelSpace } = input

    if (!msgSpace) {
      return {
        model,
      }
    }

    const modelSpaceNext = updateSpace({
      msgSpace: msgSpace,
      modelSpace: modelSpace,
    })

    if (modelSpace.type !== 'game' || modelSpaceNext.type !== 'game') {
      return {
        model,
      }
    }

    const statusBefore = ConnectFour.toStatus(modelSpace.columns)

    const status = ConnectFour.toStatus(modelSpaceNext.columns)

    if (statusBefore.type === status.type) {
      return {
        model,
      }
    }

    switch (status.type) {
      case 'Playing': {
        return {
          model,
        }
      }

      case 'Tie': {
        return {
          model,
          msgOut: [PlaySoundCmd.init(APP_SOUND.alertErrorSm)],
        }
      }

      case 'Winner': {
        if (status.winner === modelSpaceNext.userPlayerType) {
          return {
            model,
            msgCmd: [
              PlaySoundCmd.init(APP_SOUND.celebration, {
                delay: TimeSpan.seconds(1 / 2),
              }),
            ],
          }
        }
        return {
          model,
          msgCmd: [
            PlaySoundCmd.init(APP_SOUND.alertErrorLg, {
              delay: TimeSpan.seconds(1 / 2),
            }),
          ],
        }
      }
    }
  }

const updateFromMsgSpace =
  (model: ModelFrontend): Module['update'] =>
  (input) => {
    const { msgSpace, modelSpace, ctx } = input

    if (!msgSpace) {
      return {
        model,
      }
    }

    return {
      model,
      msgCmd: updateSound(ctx.currentUser.userId, modelSpace, msgSpace),
    }
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
      case 'vs-bot-game': {
        return {
          model: {
            ...model,
            vsBotGame: VsBotGame.update(model.vsBotGame, msg.c),
          },
        }
      }

      case 'vs-bot-setup': {
        return {
          model: {
            ...model,
            vsBotSetup: VsBotSetup.update(model.vsBotSetup, msg.c),
          },
        }
      }

      default: {
        return {
          model,
          msgSpace: [msg],
        }
      }
    }
  }

const updateSound = (currentUserId: UserId, modelSpace: ModelSpace, msgSpace: WithEventId<MsgSpace>): unknown[] => {
  switch (modelSpace.type) {
    case 'game': {
      switch (msgSpace.t) {
        case 'user-dropped-disc': {
          const error = modelSpace.errors[msgSpace.eventId]

          if (error && msgSpace.userId === currentUserId) {
            return [PlaySoundCmd.init(APP_SOUND.alertErrorSm)]
          }

          return [PlaySoundCmd.init(APP_SOUND.tap)]
        }

        case 'bot-dropped-disc': {
          return [PlaySoundCmd.init(APP_SOUND.tap)]
        }

        case 'user-started-game':
        case 'user-swapped-sides':
        case 'user-restarted-game': {
          return [PlaySoundCmd.init(APP_SOUND.navForwardMin)]
        }

        case 'user-stopped-game': {
          return [PlaySoundCmd.init(APP_SOUND.navBackwardMin)]
        }

        default: {
          return []
        }
      }
    }

    case 'setup': {
      switch (msgSpace.t) {
        case 'user-started-playing':
        case 'user-stopped-playing':
        case 'user-swapped-sides':
        case 'user-changed-bot-level': {
          return [PlaySoundCmd.init(APP_SOUND.tap)]
        }

        case 'user-restarted-game':
        case 'user-started-game': {
          return [PlaySoundCmd.init(APP_SOUND.navForwardMin)]
        }

        case 'user-stopped-game': {
          return [PlaySoundCmd.init(APP_SOUND.navBackwardMin)]
        }

        default: {
          return []
        }
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

const subscriptions: Module['subscriptions'] = (): Sub<MsgFrontend> => {
  return Sub.none()
}

//
//
//
// View
//
//
//

export const toGameOver = (columns: ConnectFour.Columns): VsBotGame.GameOver => {
  const status = ConnectFour.toStatus(columns)
  switch (status.type) {
    case 'Playing': {
      return {
        t: null,
      }
    }
    case 'Tie': {
      return {
        t: 'draw',
      }
    }
    case 'Winner': {
      return {
        t: 'winner',
        winner: status.winner === 'player-one' ? 'player-one' : 'player-two',
      }
    }
  }
}

const View: Module['View'] = (input) => {
  const vsBotSetupInput: VsBotSetup.VsBotSetupInput = {
    ctx: input.ctx,
    onQuit: () => {},
    title: input.ctx.t('chess'),
    renderCoverArt: (input) => h(CoverArt, input),
    canStartGame: input.modelSpace.playingUserId !== null,
    onSwapSides: () =>
      input.dispatch({
        t: 'user-swapped-sides',
        userId: input.ctx.currentUser.userId,
      }),
    onStartGame: () =>
      input.dispatch({
        t: 'user-started-game',
        userId: input.ctx.currentUser.userId,
      }),
    botVariants: ALL_BOT_LEVELS.map((botLevel) => {
      return {
        label: input.ctx.t('connect-four.bot-level', botLevel),
        renderIcon: (input) => h(ViewBotLevel, { ...input, level: botLevel }),
        onSelect: () =>
          input.dispatch({
            t: 'user-changed-bot-level',
            botLevel,
            userId: input.ctx.currentUser.userId,
          }),
      }
    }),
    human: {
      player: input.modelSpace.userPlayerType === 'player-one' ? 'player-one' : 'player-two',
      userId: input.modelSpace.playingUserId ?? null,
    },
    bot: {
      label: input.ctx.t('connect-four.bot-level', input.modelSpace.botLevel),
      renderIcon: (iconInput) => h(ViewBotLevel, { ...iconInput, level: input.modelSpace.botLevel }),
    },
    playerOne: {
      label: input.ctx.t('connect-four.red'),
      renderIcon: (input) => h(PlayerOneIcon, input),
      onStartPlaying: () =>
        input.dispatch({
          t: 'user-started-playing',
          playerType: 'player-one',
          userId: input.ctx.currentUser.userId,
        }),
      onStopPlaying: () =>
        input.dispatch({
          t: 'user-stopped-playing',
          userId: input.ctx.currentUser.userId,
        }),
    },
    playerTwo: {
      label: input.ctx.t('connect-four.yellow'),
      renderIcon: (input) => h(PlayerTwoIcon, input),
      onStartPlaying: () =>
        input.dispatch({
          t: 'user-started-playing',
          playerType: 'player-two',
          userId: input.ctx.currentUser.userId,
        }),
      onStopPlaying: () =>
        input.dispatch({
          t: 'user-stopped-playing',
          userId: input.ctx.currentUser.userId,
        }),
    },
  }

  if (!input.model) {
    return null
  }

  if (input.modelSpace.type === 'setup') {
    return h(VsBotSetup.View, {
      model: input.model.vsBotSetup,
      dispatch: (c) =>
        input.dispatch({
          t: 'vs-bot-setup',
          c,
        }),
      ...vsBotSetupInput,
    })
  }

  const status = ConnectFour.toStatus(input.modelSpace.columns)

  const vsBotGameInput: VsBotGame.VsBotGameInput = {
    ...vsBotSetupInput,
    human: {
      ...vsBotSetupInput.human,
      userId: input.modelSpace.playingUserId,
    },
    isSpectating: input.ctx.currentUser.userId !== input.modelSpace.playingUserId,
    turn: status.type !== 'Playing' ? null : status.turn === 'player-one' ? 'player-one' : 'player-two',
  }

  const isSpectating = input.ctx.currentUser.userId !== input.modelSpace.playingUserId
  const columns = input.modelSpace.columns

  return h(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    ctx: input.ctx,
    id: 'connect-four-vs-bot',
    renderBody: () =>
      h(LayoutGame, { ctx: input.ctx, isSpectating }, [
        h(Box, { class: 'flex w-full flex-1 flex-col items-center justify-center gap-1' }, [
          h(VsBotGame.VsBotPlayerSection, vsBotGameInput),

          h(VsBotGame.ViewStatusBar, { ...vsBotSetupInput, status: toVsBotStatus(status) }),

          h(Box, { class: 'relative flex w-full flex-col items-center justify-center overflow-hidden' }, [
            h(ViewColumns, {
              gameId: 0,
              columns: columns,
              disabled: isSpectating || status.type !== 'Playing',
              onDropDisc: (columnIndex) => {
                input.dispatch({
                  t: 'user-dropped-disc',
                  columnIndex,
                  userId: input.ctx.currentUser.userId,
                })
              },
            }),
            input.model &&
              h(VsBotGame.ViewGameOverOverlay, {
                ...vsBotGameInput,
                model: input.model.vsBotGame,
                onPlayAgain: () =>
                  input.dispatch({
                    t: 'user-restarted-game',
                    userId: input.ctx.currentUser.userId,
                  }),
                gameOver: toGameOver(columns),
              }),
          ]),
        ]),
      ]),
    actionBar:
      input.ctx.currentUser.userId === input.modelSpace.playingUserId
        ? {
            id: 'vs-bot-buttons',
            variant: {
              t: 'uniform',
              actions: [
                {
                  id: input.ctx.t('app.exit'),
                  icon: (props) => h(IconArrowLeft, props),
                  label: input.ctx.t('app.exit'),
                  onClick: () => input.dispatch({ t: 'user-stopped-game', userId: input.ctx.currentUser.userId }),
                },
                {
                  id: input.ctx.t('game.swap-sides'),
                  icon: (props) => h(IconRightLeft, props),
                  label: input.ctx.t('game.swap-sides'),
                  onClick: () => input.dispatch({ t: 'user-swapped-sides', userId: input.ctx.currentUser.userId }),
                },
                {
                  id: input.ctx.t('app.restart'),
                  icon: (props) => h(IconArrowRotateLeft, props),
                  label: input.ctx.t('app.restart'),
                  onClick: () => input.dispatch({ t: 'user-restarted-game', userId: input.ctx.currentUser.userId }),
                },
              ],
            },
          }
        : undefined,
  })
}

const toVsBotStatus = (status: ConnectFour.Status): VsBotGame.Status => {
  switch (status.type) {
    case 'Playing': {
      return {
        t: 'playing',
        turn: status.turn,
      }
    }
    case 'Tie': {
      return {
        t: 'draw',
      }
    }
    case 'Winner': {
      return {
        t: 'winner',
        winner: status.winner,
      }
    }
  }
}

const ViewFeedItem: Module['ViewFeedItem'] = (input) => {
  const username =
    'userId' in input.msgSpace ? (input.ctx.profilesByUserId[input.msgSpace.userId]?.username ?? null) : null

  switch (input.msgSpace.t) {
    case 'bot-dropped-disc': {
      return h(FeedItem.Info, { text: 'Bot dropped disc' })
    }

    case 'user-changed-bot-level': {
      return h(FeedItem.Info, { text: `${username} changed bot level to ${input.msgSpace.botLevel}` })
    }

    case 'user-dropped-disc': {
      if (input.msgSpace.userId === input.ctx.currentUser.userId) {
        return h(FeedItem.Info, { text: `${username} dropped disc` })
      }

      return h(FeedItem.Info, { text: `${username} dropped disc` })
    }
    case 'user-restarted-game': {
      return h(FeedItem.Info, { text: `${username} restarted game` })
    }
    case 'user-started-game': {
      return h(FeedItem.Info, { text: `${username} started game` })
    }
    case 'user-started-playing': {
      return h(FeedItem.Info, { text: `${username} started playing` })
    }
    case 'user-stopped-game': {
      return h(FeedItem.Info, { text: `${username} stopped game` })
    }
    case 'user-stopped-playing': {
      return h(FeedItem.Info, { text: `${username} stopped playing` })
    }
    case 'user-swapped-sides': {
      return h(FeedItem.Info, { text: `${username} swapped sides` })
    }
    case 'time-passed': {
      return null
    }
    case 'user-left': {
      return h(FeedItem.Info, { text: `${username} left space` })
    }
    default: {
      return null
    }
  }
}

const ViewBotLevel = ({ level, ...input }: { level: BotLevel; class?: string }) => {
  switch (level) {
    case 'Easy': {
      return h(IconBotHappy, input)
    }
    case 'Medium': {
      return h(IconBotLevel1, input)
    }
    case 'Hard': {
      return h(IconBotLevel4, input)
    }
  }
}

export const VsBot: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
}
