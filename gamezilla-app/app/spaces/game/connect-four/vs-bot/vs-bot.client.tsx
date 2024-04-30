import {
  GameLayout,
  ViewBottomButtonBar,
  ViewBottomButtonBarAction,
} from "gamezilla-app/app/spaces/game/@shared/game"
import {
  IconBotHappy,
  IconBotLevel1,
  IconBotLevel4,
  VsBotGame,
  VsBotSetup,
} from "gamezilla-app/app/spaces/game/@shared/vs-bot"
import { GameClientModule } from "gamezilla-app/app/spaces/@shared/architecture/game-client-v2"
import { EventMeta, withId } from "gamezilla-app/app/spaces/@shared/event"
import { FeedItem } from "gamezilla-app/app/spaces/@shared/feed-item"
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla-app/app/spaces/@shared/space"
import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla-app/app/@shared/client"
import { UserId } from "gamezilla-app/app/@shared/data"
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
} from "gamezilla-app/app/@shared/ui"
import { Sub, TimeSpan } from "gamezilla-app/@shared/core"
import * as ConnectFour from "../@shared/connect-four"
import {
  CoverArt,
  PlayerOneIcon,
  PlayerTwoIcon,
  ViewColumns,
} from "../@shared/connect-four-ui"
import {
  ModelClient,
  MsgClient,
  MsgSync,
  ModelSync,
  MsgToClient,
  MsgToServer,
  reducer,
} from "./vs-bot.core"
import { ALL_BOT_LEVELS, BotLevel } from "./bot-level"

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
  ModelSync: ModelSync
  MsgSync: MsgSync
  Ctx: SpaceClientCtx & { onQuit: () => void }
  MsgOutCmd: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
  MsgInEvent: SpaceClientEvent
  MsgInCmd: null
  MsgOutEvent: null
}>

//
//
//
//

const init: Module["init"] = {
  vsBotSetup: VsBotSetup.init,
  vsBotGame: VsBotGame.init(),
}

//
//
//
//
//

const update: Module["update"] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => updateFromMsg(model)(input),
    (model) => updateFromMsgSync(model)(input),
    (model) => watchGameOver(model)(input),
  )
}

const watchGameOver =
  (model: ModelClient): Module["update"] =>
  (input) => {
    const { msgSync, modelSync } = input

    if (!msgSync) {
      return { model }
    }

    const modelSyncNext = reducer({
      msgSync: msgSync,
      modelSync: modelSync,
    })

    if (modelSync.type !== "game" || modelSyncNext.type !== "game") {
      return { model }
    }

    const statusBefore = ConnectFour.toStatus(modelSync.columns)

    const status = ConnectFour.toStatus(modelSyncNext.columns)

    if (statusBefore.type === status.type) {
      return { model }
    }

    switch (status.type) {
      case "Playing": {
        return { model }
      }

      case "Tie": {
        return { model, msgCmd: [playSound(APP_SOUND.alertErrorSm)] }
      }

      case "Winner": {
        if (status.winner === modelSyncNext.userPlayerType) {
          return {
            model,
            msgCmd: [
              playSound(APP_SOUND.celebration, {
                delay: TimeSpan.fromSeconds(1 / 2),
              }),
            ],
          }
        }
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.alertErrorLg, {
              delay: TimeSpan.fromSeconds(1 / 2),
            }),
          ],
        }
      }
    }
  }

const updateFromMsgSync =
  (model: ModelClient): Module["update"] =>
  (input) => {
    const { msgSync, modelSync, ctx } = input

    if (!msgSync) {
      return { model }
    }

    return {
      model,
      msgCmd: updateSound(ctx.currentUserId, modelSync, msgSync),
    }
  }

const updateFromMsg =
  (model: ModelClient): Module["update"] =>
  (input) => {
    const { msg } = input

    if (!msg) {
      return { model }
    }

    switch (msg.t) {
      case "vs-bot-game": {
        return {
          model: {
            ...model,
            vsBotGame: VsBotGame.update(model.vsBotGame, msg.c),
          },
        }
      }

      case "vs-bot-setup": {
        return {
          model: {
            ...model,
            vsBotSetup: VsBotSetup.update(model.vsBotSetup, msg.c),
          },
        }
      }

      default: {
        const msgSync = withId(msg)
        return { model, msgSync: [msgSync] }
      }
    }
  }

const updateSound = (
  currentUserId: UserId,
  modelSync: ModelSync,
  msgSync: MsgSync & EventMeta,
): ClientCmd<{
  MsgToServer: MsgToServer
  MsgClient: MsgClient
}>[] => {
  switch (modelSync.type) {
    case "game": {
      switch (msgSync.t) {
        case "user-dropped-disc": {
          const error = modelSync.errors[msgSync.eventId]

          if (error && msgSync.userId === currentUserId) {
            return [playSound(APP_SOUND.alertErrorSm)]
          }

          return [playSound(APP_SOUND.tap)]
        }

        case "bot-dropped-disc": {
          return [playSound(APP_SOUND.tap)]
        }

        case "user-started-game":
        case "user-swapped-sides":
        case "user-restarted-game": {
          return [playSound(APP_SOUND.navForwardMin)]
        }

        case "user-stopped-game": {
          return [playSound(APP_SOUND.navBackwardMin)]
        }

        default: {
          return []
        }
      }
    }

    case "setup": {
      switch (msgSync.t) {
        case "user-started-playing":
        case "user-stopped-playing":
        case "user-swapped-sides":
        case "user-changed-bot-level": {
          return [playSound(APP_SOUND.tap)]
        }

        case "user-restarted-game":
        case "user-started-game": {
          return [playSound(APP_SOUND.navForwardMin)]
        }

        case "user-stopped-game": {
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

const subscriptions: Module["subscriptions"] = (): Sub<MsgClient> => {
  return Sub.None
}

//
//
//
// View
//
//
//

export const toGameOver = (
  columns: ConnectFour.Columns,
): VsBotGame.GameOver => {
  const status = ConnectFour.toStatus(columns)
  switch (status.type) {
    case "Playing": {
      return { t: null }
    }
    case "Tie": {
      return { t: "draw" }
    }
    case "Winner": {
      return {
        t: "winner",
        winner: status.winner === "player-one" ? "player-one" : "player-two",
      }
    }
  }
}

const View: Module["View"] = (props) => {
  const vsBotSetupProps: VsBotSetup.VsBotSetupProps = {
    ctx: props.ctx,
    onQuit: props.ctx.onQuit,
    title: "Connect Four",
    renderCoverArt: (props) => <CoverArt {...props} />,
    canStartGame: props.modelSync.playingUserId !== null,
    onSwapSides: () =>
      props.dispatch({
        t: "user-swapped-sides",
        userId: props.ctx.currentUserId,
      }),
    onStartGame: () =>
      props.dispatch({
        t: "user-started-game",
        userId: props.ctx.currentUserId,
      }),
    botVariants: ALL_BOT_LEVELS.map((botLevel) => {
      return {
        label: botLevel,
        renderIcon: (props) => <ViewBotLevel {...props} level={botLevel} />,
        onSelect: () =>
          props.dispatch({
            t: "user-changed-bot-level",
            botLevel,
            userId: props.ctx.currentUserId,
          }),
      }
    }),
    human: {
      player:
        props.modelSync.userPlayerType === "player-one"
          ? "player-one"
          : "player-two",
      userId: props.modelSync.playingUserId ?? null,
    },
    bot: {
      label: props.modelSync.botLevel,
      renderIcon: (iconProps) => (
        <ViewBotLevel {...iconProps} level={props.modelSync.botLevel} />
      ),
    },
    playerOne: {
      label: "Red",
      renderIcon: (props) => <PlayerOneIcon {...props} />,
      onStartPlaying: () =>
        props.dispatch({
          t: "user-started-playing",
          playerType: "player-one",
          userId: props.ctx.currentUserId,
        }),
      onStopPlaying: () =>
        props.dispatch({
          t: "user-stopped-playing",
          userId: props.ctx.currentUserId,
        }),
    },
    playerTwo: {
      label: "Yellow",
      renderIcon: (props) => <PlayerTwoIcon {...props} />,
      onStartPlaying: () =>
        props.dispatch({
          t: "user-started-playing",
          playerType: "player-two",
          userId: props.ctx.currentUserId,
        }),
      onStopPlaying: () =>
        props.dispatch({
          t: "user-stopped-playing",
          userId: props.ctx.currentUserId,
        }),
    },
  }

  if (!props.model) {
    return null
  }

  if (props.modelSync.type === "setup") {
    return (
      <VsBotSetup.View
        model={props.model.vsBotSetup}
        dispatch={(c) => props.dispatch({ t: "vs-bot-setup", c })}
        {...vsBotSetupProps}
      />
    )
  }

  const status = ConnectFour.toStatus(props.modelSync.columns)

  const vsBotGameProps: VsBotGame.VsBotGameProps = {
    ...vsBotSetupProps,
    human: {
      ...vsBotSetupProps.human,
      userId: props.modelSync.playingUserId,
    },
    isSpectating: props.ctx.currentUserId !== props.modelSync.playingUserId,
    turn:
      status.type !== "Playing"
        ? null
        : status.turn === "player-one"
        ? "player-one"
        : "player-two",
  }

  const isSpectating = props.ctx.currentUserId !== props.modelSync.playingUserId

  return (
    <GameLayout isSpectating={isSpectating}>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-1">
        <VsBotGame.VsBotPlayerSection {...vsBotGameProps} />

        <VsBotGame.ViewStatusBar
          {...vsBotSetupProps}
          status={toVsBotStatus(status)}
        />

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <ViewColumns
            gameId={0}
            columns={props.modelSync.columns}
            disabled={isSpectating || status.type !== "Playing"}
            onDropDisc={(columnIndex) => {
              props.dispatch({
                t: "user-dropped-disc",
                columnIndex,
                userId: props.ctx.currentUserId,
              })
            }}
          />
          {props.model && (
            <VsBotGame.ViewGameOverOverlay
              {...vsBotGameProps}
              model={props.model.vsBotGame}
              onPlayAgain={() =>
                props.dispatch({
                  t: "user-restarted-game",
                  userId: props.ctx.currentUserId,
                })
              }
              gameOver={toGameOver(props.modelSync.columns)}
            />
          )}
        </div>
      </div>

      {props.ctx.currentUserId === props.modelSync.playingUserId && (
        <ViewBottomButtonBar>
          <ViewBottomButtonBarAction
            icon={(props) => <IconArrowLeftOnRect {...props} />}
            label="Exit"
            onClick={() =>
              props.dispatch({
                t: "user-stopped-game",
                userId: props.ctx.currentUserId,
              })
            }
          />

          <ViewBottomButtonBarAction
            icon={(props) => <IconRightLeft {...props} />}
            label="Swap sides"
            onClick={() =>
              props.dispatch({
                t: "user-swapped-sides",
                userId: props.ctx.currentUserId,
              })
            }
          />

          <ViewBottomButtonBarAction
            icon={(props) => <IconArrowRotateLeft {...props} />}
            label="Restart"
            onClick={() =>
              props.dispatch({
                t: "user-restarted-game",
                userId: props.ctx.currentUserId,
              })
            }
          />
        </ViewBottomButtonBar>
      )}
    </GameLayout>
  )
}

const toVsBotStatus = (status: ConnectFour.Status): VsBotGame.Status => {
  switch (status.type) {
    case "Playing": {
      return { t: "playing", turn: status.turn }
    }
    case "Tie": {
      return { t: "draw" }
    }
    case "Winner": {
      return { t: "winner", winner: status.winner }
    }
  }
}

const ViewFeedItem: Module["ViewFeedItem"] = (props) => {
  const username =
    "userId" in props.msgSync
      ? props.ctx.profiles[props.msgSync.userId]?.username ?? null
      : null

  switch (props.msgSync.t) {
    case "bot-dropped-disc": {
      return <FeedItem.Info text="Bot dropped disc" />
    }

    case "user-changed-bot-level": {
      return (
        <FeedItem.Info
          text={`${username} changed bot level to ${props.msgSync.botLevel}`}
        />
      )
    }

    case "user-dropped-disc": {
      if (props.msgSync.userId === props.ctx.currentUserId) {
        return <FeedItem.Info text={`${username} dropped disc`} />
      }

      return <FeedItem.Info text={`${username} dropped disc`} />
    }
    case "user-restarted-game": {
      return <FeedItem.Info text={`${username} restarted game`} />
    }
    case "user-started-game": {
      return <FeedItem.Info text={`${username} started game`} />
    }
    case "user-started-playing": {
      return <FeedItem.Info text={`${username} started playing`} />
    }
    case "user-stopped-game": {
      return <FeedItem.Info text={`${username} stopped game`} />
    }
    case "user-stopped-playing": {
      return <FeedItem.Info text={`${username} stopped playing`} />
    }
    case "user-swapped-sides": {
      return <FeedItem.Info text={`${username} swapped sides`} />
    }
    case "time-passed": {
      return null
    }
    case "user-left": {
      return <FeedItem.Info text={`${username} left space`} />
    }
    default: {
      return null
    }
  }
}

const ViewBotLevel = ({
  level,
  ...props
}: {
  level: BotLevel
  className?: string
}) => {
  switch (level) {
    case "Easy": {
      return <IconBotHappy {...props} />
    }
    case "Medium": {
      return <IconBotLevel1 {...props} />
    }
    case "Hard": {
      return <IconBotLevel4 {...props} />
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
