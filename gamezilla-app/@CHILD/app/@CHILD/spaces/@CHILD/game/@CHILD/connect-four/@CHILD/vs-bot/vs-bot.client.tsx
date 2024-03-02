import {
  GameLayout,
  ViewBottomButtonBar,
  ViewBottomButtonBarAction,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game"
import {
  IconBotHappy,
  IconBotLevel1,
  IconBotLevel4,
  VsBotGame,
  VsBotSetup,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/vs-bot"
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import {
  EventMeta,
  withId,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { FeedItem } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/feed-item"
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla/@CHILD/app/@SHARED/client"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { Sub, TimeSpan } from "gamezilla/@SHARED/core"
import * as ConnectFour from "../../@SHARED/connect-four"
import {
  CoverArt,
  PlayerOneIcon,
  PlayerTwoIcon,
  ViewColumns,
} from "../../@SHARED/connect-four-ui"
import {
  BotLevel,
  ModelClient,
  MsgClient,
  MsgSync,
  ModelSync,
  MsgToClient,
  MsgToServer,
  allBotLevels,
  reducer,
} from "./vs-bot.core"

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
  return GameClientModule.chainUpdates(
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

export function toGameOver(columns: ConnectFour.Columns): VsBotGame.GameOver {
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

const View: Module["View"] = ({ model, ctx, modelSync, dispatch }) => {
  const vsBotSetupProps: VsBotSetup.VsBotSetupProps = {
    ctx: ctx,
    onQuit: ctx.onQuit,
    title: "Connect Four",
    renderCoverArt: (props) => <CoverArt {...props} />,
    canStartGame: modelSync.playingUserId !== null,
    onSwapSides: () =>
      dispatch({ t: "user-swapped-sides", userId: ctx.currentUserId }),
    onStartGame: () =>
      dispatch({ t: "user-started-game", userId: ctx.currentUserId }),
    botVariants: allBotLevels.map((botLevel) => {
      return {
        label: botLevel,
        renderIcon: (props) => <ViewBotLevel {...props} level={botLevel} />,
        onSelect: () =>
          dispatch({
            t: "user-changed-bot-level",
            botLevel,
            userId: ctx.currentUserId,
          }),
      }
    }),
    human: {
      player:
        modelSync.userPlayerType === "player-one" ? "player-one" : "player-two",
      userId: modelSync.playingUserId,
    },
    bot: {
      label: modelSync.botLevel,
      renderIcon: (props) => (
        <ViewBotLevel {...props} level={modelSync.botLevel} />
      ),
    },
    playerOne: {
      label: "Red",
      renderIcon: (props) => <PlayerOneIcon {...props} />,
      onStartPlaying: () =>
        dispatch({
          t: "user-started-playing",
          playerType: "player-one",
          userId: ctx.currentUserId,
        }),
      onStopPlaying: () =>
        dispatch({
          t: "user-stopped-playing",
          userId: ctx.currentUserId,
        }),
    },
    playerTwo: {
      label: "Yellow",
      renderIcon: (props) => <PlayerTwoIcon {...props} />,
      onStartPlaying: () =>
        dispatch({
          t: "user-started-playing",
          playerType: "player-two",
          userId: ctx.currentUserId,
        }),
      onStopPlaying: () =>
        dispatch({
          t: "user-stopped-playing",
          userId: ctx.currentUserId,
        }),
    },
  }

  if (!model) {
    return null
  }

  if (modelSync.type === "setup") {
    return (
      <VsBotSetup.View
        model={model.vsBotSetup}
        dispatch={(c) => dispatch({ t: "vs-bot-setup", c })}
        {...vsBotSetupProps}
      />
    )
  }

  const status = ConnectFour.toStatus(modelSync.columns)

  const vsBotGameProps: VsBotGame.VsBotGameProps = {
    ...vsBotSetupProps,
    human: {
      ...vsBotSetupProps.human,
      userId: modelSync.playingUserId,
    },
    isSpectating: ctx.currentUserId !== modelSync.playingUserId,
    turn:
      status.type !== "Playing"
        ? null
        : status.turn === "player-one"
        ? "player-one"
        : "player-two",
  }

  const isSpectating = ctx.currentUserId !== modelSync.playingUserId

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
            columns={modelSync.columns}
            disabled={isSpectating || status.type !== "Playing"}
            onDropDisc={(columnIndex) => {
              dispatch({
                t: "user-dropped-disc",
                columnIndex,
                userId: ctx.currentUserId,
              })
            }}
          />
          {model && (
            <VsBotGame.ViewGameOverOverlay
              {...vsBotGameProps}
              model={model.vsBotGame}
              onPlayAgain={() =>
                dispatch({
                  t: "user-restarted-game",
                  userId: ctx.currentUserId,
                })
              }
              gameOver={toGameOver(modelSync.columns)}
            />
          )}
        </div>
      </div>

      {ctx.currentUserId === modelSync.playingUserId && (
        <ViewBottomButtonBar>
          <ViewBottomButtonBarAction
            icon={(props) => <IconArrowLeftOnRect {...props} />}
            label="Exit"
            onClick={() =>
              dispatch({
                t: "user-stopped-game",
                userId: ctx.currentUserId,
              })
            }
          />

          <ViewBottomButtonBarAction
            icon={(props) => <IconRightLeft {...props} />}
            label="Swap sides"
            onClick={() =>
              dispatch({
                t: "user-swapped-sides",
                userId: ctx.currentUserId,
              })
            }
          />

          <ViewBottomButtonBarAction
            icon={(props) => <IconArrowRotateLeft {...props} />}
            label="Restart"
            onClick={() =>
              dispatch({
                t: "user-restarted-game",
                userId: ctx.currentUserId,
              })
            }
          />
        </ViewBottomButtonBar>
      )}
    </GameLayout>
  )
}

function toVsBotStatus(status: ConnectFour.Status): VsBotGame.Status {
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

const ViewFeedItem: Module["ViewFeedItem"] = ({ msgSync, ctx }) => {
  const username =
    "userId" in msgSync ? ctx.profiles[msgSync.userId]?.username ?? null : null

  switch (msgSync.t) {
    case "bot-dropped-disc": {
      return <FeedItem.Info text="Bot dropped disc" />
    }

    case "user-changed-bot-level": {
      return (
        <FeedItem.Info
          text={`${username} changed bot level to ${msgSync.botLevel}`}
        />
      )
    }

    case "user-dropped-disc": {
      if (msgSync.userId === ctx.currentUserId) {
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
