import { Sub, TimeSpan } from '@/core'
import { APP_SOUND, type AppClientCmd, playSound } from 'app/@/client'
import type { UserId } from 'app/@/data'
import { IconArrowLeftOnRect, IconArrowRotateLeft, IconRightLeft } from 'app/@/ui'
import { ViewBottomButtonBar, ViewBottomButtonBarAction } from 'app/@/ui/actions'
import { type WithEventId, withEventId } from '@/event-sourced/event'
import { FeedItem } from 'app/spaces/@/feed-item'
import { SpaceClientEvt } from 'app/spaces/@/space-client-evt'
import { GameClientModule } from 'app/spaces/games/@/architecture/game-client-v2'
import {
  IconBotHappy,
  IconBotLevel1,
  IconBotLevel4,
  VsBotGame,
  VsBotSetup
} from 'app/spaces/games/@/vs-bot'
import { LayoutGame } from '../../@/game/layout-game'
import * as ConnectFour from '../@/connect-four'
import { CoverArt, PlayerOneIcon, PlayerTwoIcon, ViewColumns } from '../@/connect-four-ui'
import { ALL_BOT_LEVELS, type BotLevel } from './bot-level'
import {
  type ModelClient,
  type ModelCore,
  type MsgClient,
  type MsgCore,
  type MsgToClient,
  type MsgToServer,
  updateCore
} from './vs-bot.types'
import { SpaceClientCtx } from 'app/spaces/@/space-client-ctx'

//
//
//
//
//
//
//

type Module = GameClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceClientCtx
  MsgCmdOut: AppClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
  MsgEvtIn: SpaceClientEvt
  MsgCmdIn: null
  MsgEvtOut: null
}>

//
//
//
//

const init: Module['init'] = {
  vsBotSetup: VsBotSetup.init,
  vsBotGame: VsBotGame.init()
}

//
//
//
//
//

const update: Module['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => updateFromMsg(model)(input),
    (model) => updateFromMsgCore(model)(input),
    (model) => watchGameOver(model)(input)
  )
}

const watchGameOver =
  (model: ModelClient): Module['update'] =>
  (input) => {
    const { msgCore, modelCore } = input

    if (!msgCore) {
      return {
        model
      }
    }

    const modelCoreNext = updateCore({
      msgCore: msgCore,
      modelCore: modelCore
    })

    if (modelCore.type !== 'game' || modelCoreNext.type !== 'game') {
      return {
        model
      }
    }

    const statusBefore = ConnectFour.toStatus(modelCore.columns)

    const status = ConnectFour.toStatus(modelCoreNext.columns)

    if (statusBefore.type === status.type) {
      return {
        model
      }
    }

    switch (status.type) {
      case 'Playing': {
        return {
          model
        }
      }

      case 'Tie': {
        return {
          model,
          msgCmd: [playSound(APP_SOUND.alertErrorSm)]
        }
      }

      case 'Winner': {
        if (status.winner === modelCoreNext.userPlayerType) {
          return {
            model,
            msgCmd: [
              playSound(APP_SOUND.celebration, {
                delay: TimeSpan.seconds(1 / 2)
              })
            ]
          }
        }
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.alertErrorLg, {
              delay: TimeSpan.seconds(1 / 2)
            })
          ]
        }
      }
    }
  }

const updateFromMsgCore =
  (model: ModelClient): Module['update'] =>
  (input) => {
    const { msgCore, modelCore, ctx } = input

    if (!msgCore) {
      return {
        model
      }
    }

    return {
      model,
      msgCmd: updateSound(ctx.currentUserId, modelCore, msgCore)
    }
  }

const updateFromMsg =
  (model: ModelClient): Module['update'] =>
  (input) => {
    const { msg } = input

    if (!msg) {
      return {
        model
      }
    }

    switch (msg.t) {
      case 'vs-bot-game': {
        return {
          model: {
            ...model,
            vsBotGame: VsBotGame.update(model.vsBotGame, msg.c)
          }
        }
      }

      case 'vs-bot-setup': {
        return {
          model: {
            ...model,
            vsBotSetup: VsBotSetup.update(model.vsBotSetup, msg.c)
          }
        }
      }

      default: {
        const msgCore = withEventId(msg)
        return {
          model,
          msgCore: [msgCore]
        }
      }
    }
  }

const updateSound = (
  currentUserId: UserId,
  modelCore: ModelCore,
  msgCore: WithEventId<MsgCore>
): AppClientCmd<{
  MsgToServer: MsgToServer
  MsgClient: MsgClient
}>[] => {
  switch (modelCore.type) {
    case 'game': {
      switch (msgCore.t) {
        case 'user-dropped-disc': {
          const error = modelCore.errors[msgCore.eventId]

          if (error && msgCore.userId === currentUserId) {
            return [playSound(APP_SOUND.alertErrorSm)]
          }

          return [playSound(APP_SOUND.tap)]
        }

        case 'bot-dropped-disc': {
          return [playSound(APP_SOUND.tap)]
        }

        case 'user-started-game':
        case 'user-swapped-sides':
        case 'user-restarted-game': {
          return [playSound(APP_SOUND.navForwardMin)]
        }

        case 'user-stopped-game': {
          return [playSound(APP_SOUND.navBackwardMin)]
        }

        default: {
          return []
        }
      }
    }

    case 'setup': {
      switch (msgCore.t) {
        case 'user-started-playing':
        case 'user-stopped-playing':
        case 'user-swapped-sides':
        case 'user-changed-bot-level': {
          return [playSound(APP_SOUND.tap)]
        }

        case 'user-restarted-game':
        case 'user-started-game': {
          return [playSound(APP_SOUND.navForwardMin)]
        }

        case 'user-stopped-game': {
          return [playSound(APP_SOUND.navBackwardMin)]
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

const subscriptions: Module['subscriptions'] = (): Sub<MsgClient> => {
  return Sub.None
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
        t: null
      }
    }
    case 'Tie': {
      return {
        t: 'draw'
      }
    }
    case 'Winner': {
      return {
        t: 'winner',
        winner: status.winner === 'player-one' ? 'player-one' : 'player-two'
      }
    }
  }
}

const View: Module['View'] = (input) => {
  const vsBotSetupinput: VsBotSetup.VsBotSetupinput = {
    ctx: input.ctx,
    onQuit: () => {},
    title: input.ctx.t('chess'),
    renderCoverArt: (input) => <CoverArt {...input} />,
    canStartGame: input.modelCore.playingUserId !== null,
    onSwapSides: () =>
      input.dispatch({
        t: 'user-swapped-sides',
        userId: input.ctx.currentUserId
      }),
    onStartGame: () =>
      input.dispatch({
        t: 'user-started-game',
        userId: input.ctx.currentUserId
      }),
    botVariants: ALL_BOT_LEVELS.map((botLevel) => {
      return {
        label: input.ctx.t('connect-four.bot-level', botLevel),
        renderIcon: (input) => <ViewBotLevel {...input} level={botLevel} />,
        onSelect: () =>
          input.dispatch({
            t: 'user-changed-bot-level',
            botLevel,
            userId: input.ctx.currentUserId
          })
      }
    }),
    human: {
      player: input.modelCore.userPlayerType === 'player-one' ? 'player-one' : 'player-two',
      userId: input.modelCore.playingUserId ?? null
    },
    bot: {
      label: input.ctx.t('connect-four.bot-level', input.modelCore.botLevel),
      renderIcon: (iconinput) => <ViewBotLevel {...iconinput} level={input.modelCore.botLevel} />
    },
    playerOne: {
      label: input.ctx.t('connect-four.red'),
      renderIcon: (input) => <PlayerOneIcon {...input} />,
      onStartPlaying: () =>
        input.dispatch({
          t: 'user-started-playing',
          playerType: 'player-one',
          userId: input.ctx.currentUserId
        }),
      onStopPlaying: () =>
        input.dispatch({
          t: 'user-stopped-playing',
          userId: input.ctx.currentUserId
        })
    },
    playerTwo: {
      label: input.ctx.t('connect-four.yellow'),
      renderIcon: (input) => <PlayerTwoIcon {...input} />,
      onStartPlaying: () =>
        input.dispatch({
          t: 'user-started-playing',
          playerType: 'player-two',
          userId: input.ctx.currentUserId
        }),
      onStopPlaying: () =>
        input.dispatch({
          t: 'user-stopped-playing',
          userId: input.ctx.currentUserId
        })
    }
  }

  if (!input.model) {
    return null
  }

  if (input.modelCore.type === 'setup') {
    return (
      <VsBotSetup.View
        model={input.model.vsBotSetup}
        dispatch={(c) =>
          input.dispatch({
            t: 'vs-bot-setup',
            c
          })
        }
        {...vsBotSetupinput}
      />
    )
  }

  const status = ConnectFour.toStatus(input.modelCore.columns)

  const vsBotGameinput: VsBotGame.VsBotGameinput = {
    ...vsBotSetupinput,
    human: {
      ...vsBotSetupinput.human,
      userId: input.modelCore.playingUserId
    },
    isSpectating: input.ctx.currentUserId !== input.modelCore.playingUserId,
    turn: status.type !== 'Playing' ? null : status.turn === 'player-one' ? 'player-one' : 'player-two'
  }

  const isSpectating = input.ctx.currentUserId !== input.modelCore.playingUserId

  return (
    <LayoutGame ctx={input.ctx} isSpectating={isSpectating}>
      <div className='flex w-full flex-1 flex-col items-center justify-center gap-1'>
        <VsBotGame.VsBotPlayerSection {...vsBotGameinput} />

        <VsBotGame.ViewStatusBar {...vsBotSetupinput} status={toVsBotStatus(status)} />

        <div className='relative flex w-full flex-col items-center justify-center overflow-hidden'>
          <ViewColumns
            gameId={0}
            columns={input.modelCore.columns}
            disabled={isSpectating || status.type !== 'Playing'}
            onDropDisc={(columnIndex) => {
              input.dispatch({
                t: 'user-dropped-disc',
                columnIndex,
                userId: input.ctx.currentUserId
              })
            }}
          />
          {input.model && (
            <VsBotGame.ViewGameOverOverlay
              {...vsBotGameinput}
              model={input.model.vsBotGame}
              onPlayAgain={() =>
                input.dispatch({
                  t: 'user-restarted-game',
                  userId: input.ctx.currentUserId
                })
              }
              gameOver={toGameOver(input.modelCore.columns)}
            />
          )}
        </div>
      </div>

      {input.ctx.currentUserId === input.modelCore.playingUserId && (
        <ViewBottomButtonBar>
          <ViewBottomButtonBarAction
            icon={(input) => <IconArrowLeftOnRect {...input} />}
            label={input.ctx.t('app.exit')}
            onClick={() =>
              input.dispatch({
                t: 'user-stopped-game',
                userId: input.ctx.currentUserId
              })
            }
          />

          <ViewBottomButtonBarAction
            icon={(input) => <IconRightLeft {...input} />}
            label={input.ctx.t('game.swap-sides')}
            onClick={() =>
              input.dispatch({
                t: 'user-swapped-sides',
                userId: input.ctx.currentUserId
              })
            }
          />

          <ViewBottomButtonBarAction
            icon={(input) => <IconArrowRotateLeft {...input} />}
            label={input.ctx.t('app.restart')}
            onClick={() =>
              input.dispatch({
                t: 'user-restarted-game',
                userId: input.ctx.currentUserId
              })
            }
          />
        </ViewBottomButtonBar>
      )}
    </LayoutGame>
  )
}

const toVsBotStatus = (status: ConnectFour.Status): VsBotGame.Status => {
  switch (status.type) {
    case 'Playing': {
      return {
        t: 'playing',
        turn: status.turn
      }
    }
    case 'Tie': {
      return {
        t: 'draw'
      }
    }
    case 'Winner': {
      return {
        t: 'winner',
        winner: status.winner
      }
    }
  }
}

const ViewFeedItem: Module['ViewFeedItem'] = (input) => {
  const username = 'userId' in input.msgCore ? input.ctx.profiles[input.msgCore.userId]?.username ?? null : null

  switch (input.msgCore.t) {
    case 'bot-dropped-disc': {
      return <FeedItem.Info text='Bot dropped disc' />
    }

    case 'user-changed-bot-level': {
      return <FeedItem.Info text={`${username} changed bot level to ${input.msgCore.botLevel}`} />
    }

    case 'user-dropped-disc': {
      if (input.msgCore.userId === input.ctx.currentUserId) {
        return <FeedItem.Info text={`${username} dropped disc`} />
      }

      return <FeedItem.Info text={`${username} dropped disc`} />
    }
    case 'user-restarted-game': {
      return <FeedItem.Info text={`${username} restarted game`} />
    }
    case 'user-started-game': {
      return <FeedItem.Info text={`${username} started game`} />
    }
    case 'user-started-playing': {
      return <FeedItem.Info text={`${username} started playing`} />
    }
    case 'user-stopped-game': {
      return <FeedItem.Info text={`${username} stopped game`} />
    }
    case 'user-stopped-playing': {
      return <FeedItem.Info text={`${username} stopped playing`} />
    }
    case 'user-swapped-sides': {
      return <FeedItem.Info text={`${username} swapped sides`} />
    }
    case 'time-passed': {
      return null
    }
    case 'user-left': {
      return <FeedItem.Info text={`${username} left space`} />
    }
    default: {
      return null
    }
  }
}

const ViewBotLevel = ({ level, ...input }: { level: BotLevel; className?: string }) => {
  switch (level) {
    case 'Easy': {
      return <IconBotHappy {...input} />
    }
    case 'Medium': {
      return <IconBotLevel1 {...input} />
    }
    case 'Hard': {
      return <IconBotLevel4 {...input} />
    }
  }
}

export const VsBot: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem
}
