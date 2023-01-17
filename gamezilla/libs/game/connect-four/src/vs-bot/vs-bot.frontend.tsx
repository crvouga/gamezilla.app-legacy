import { keyframes } from "@emotion/react"
import { Alerts } from "@gamezilla/shared"
import { Cmd, Spring, Sub } from "@gamezilla/core"
import { UserId } from "@gamezilla/shared"
import { Ctx } from "@gamezilla/shared"
import { viewVsBotGameScreen, viewVsBotSetupScreen } from "@gamezilla/game-shared"
import { ActionButton, Avatar, Box, CircularProgress, Fade, FillBox, Icons, Paper, Typography, useTheme } from "@gamezilla/ui"
import { opposite, PlayerType, playerTypes, toStatus, toTurn } from "../connect-four/connect-four"
import { gameTheme, initVisual, isDone, PlayerIcon, step, ViewColumns, ViewCoverArt } from "../connect-four/connect-four-view"
import {
  BackendModel, BotLevel, botLevel, FrontendGameModel, FrontendModel, FrontendMsg,
  GameModel,
  GameOver,
  handle,
  initShared,
  isBotTurn,
  ToBackend,
  ToFrontend,
  toGameOver
} from "./vs-bot.types"



//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = (
  ...params: Parameters<typeof initShared>
): FrontendModel => {
  const shared = initShared(...params)

  if (shared.type === 'Setup') {
    return shared
  }

  return {
    ...shared,
    ghostIndex: "none",
    visual: initVisual(shared.columns)
  }
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

type OutAction = Alerts.Action

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "hovered": {
      if (model.type !== 'Game') {
        return [model, Cmd.None]
      }
      return [{ ...model, ghostIndex: msg[1].columnIndex }, Cmd.None]
    }

    case 'animate': {
      if (model.type !== 'Game') {
        return [model, Cmd.None]
      }
      const visualNew = step({ columns: model.columns, current: model.visual })
      return [{ ...model, visual: visualNew, }, Cmd.None]
    }

    case 'input-move': {
      // TODO: optimistic update
      return [model, sendToBackend(msg)]
    }

    case "input-player-type":
    case 'restart':
    case 'start-game':
    case "start-playing":
    case 'stop-game':
    case "stop-playing":
    case 'swap-sides':
    case 'input-bot-level': {
      return [model, sendToBackend(msg)]
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "player-left": {
      const modelNew = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1],
      })
      return [modelNew, Cmd.None, []]
    }

    case "bot-move":
    case 'input-move': {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }

      const modelNew = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1].value,
      })

      return [modelNew, Cmd.None, []]
    }

    case "input-player-type":
    case 'restart':
    case 'start-game':
    case "start-playing":
    case 'stop-game':
    case "stop-playing":
    case 'swap-sides':
    case 'input-bot-level': {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }

      const modelNew = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1].value,
      })

      return [modelNew, Cmd.None, []]
    }
  }
}

export const mergeWithBackend = ({
  backendModel,
  frontendModel,
}: {
  frontendModel: FrontendModel
  backendModel: BackendModel
}): FrontendModel => {
  if (backendModel.type === 'Setup') {
    return backendModel
  }


  if (frontendModel.type === 'Setup') {
    return {
      ...backendModel,
      ghostIndex: "none",
      visual: initVisual(backendModel.columns)
    }
  }

  const columnsNew = backendModel.columns
  const visualNew = step({ columns: columnsNew, current: frontendModel.visual })

  return {
    ...backendModel,
    visual: visualNew,
    ghostIndex: frontendModel.ghostIndex,
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub<Msg> => {
  switch (model.type) {
    case 'Game': {
      if (isDone(model.visual)) {
        return Sub.None
      }
      return Spring.onAnimationFrame(() => ['animate'])
    }

    case 'Setup': {
      return Sub.None
    }
  }
}

//
//
//
// View
//
//
//

export const View = ({
  model,
  goBack,
  ctx,
  $send,
}: {
  model: Model
  $send: (msg: Msg) => void
  goBack: () => void
  ctx: Ctx
}) => {
  if (model.type === "Setup") {
    return (
      viewVsBotSetupScreen<BotLevel, PlayerType>({
        coverArt: <ViewCoverArt />,
        title: "Connect Four",
        subtitle: "Vs Computer",
        ctx,
        playerId: model.player === "none" ? null : model.player,
        onStartPlaying: () => $send(["start-playing", { userId: ctx.currentUserId }]),
        onStopPlaying: () => $send(["stop-playing", { userId: ctx.currentUserId }]),
        botLevel: {
          values: Object.values(botLevel),
          selected: model.botLevel,
          onInput: (level) => $send(['input-bot-level', { botLevel: level, userId: ctx.currentUserId }]),
        },
        player: {
          values: Object.values(playerTypes),
          selected: model.userPlayerType,
          onInput: (playerType) => $send(['input-player-type', { playerType, userId: ctx.currentUserId }]),
          icon: ({ sx, playerType }) => <PlayerIcon playerType={playerType} sx={{ width: "1rem", height: "1rem", ...sx }} />,
        },
        leftPlayerType: "PlayerOne",
        onCancel: goBack,
        onStartGame: () => $send(['start-game', { userId: ctx.currentUserId }]),
      })
    )
  }

  // return viewGame({ model, ctx, $send, })

  const status = toStatus(model.columns)
  const isGameOver = status.type === 'Winner' || status.type === 'Tie'

  return viewVsBotGameScreen<PlayerType>({
    isGameOver: isGameOver,
    botName: model.botLevel,
    botPlayer: opposite[model.userPlayerType],
    ctx,
    leftPlayer: "PlayerOne",
    playerUserId: model.player,
    userPlayer: model.userPlayerType,
    turn: toTurn(model.columns),
    actions: [
      ['Stop', 'exit', () => $send(['stop-game', { userId: ctx.currentUserId }])],
      ['Restart', 'restart', () => $send(['restart', { userId: ctx.currentUserId }])],
      ['Swap', 'swap', () => $send(['swap-sides', { userId: ctx.currentUserId }])],
    ],
    viewPlayerIcon: (props) => <PlayerIcon key={props.playerType} {...props} />,
    viewBoard: () => <ViewColumns
      ghost={
        ctx.currentUserId === model.player &&
          toTurn(model.columns) === model.userPlayerType &&
          model.ghostIndex !== "none"
          ? {
            columnIndex: model.ghostIndex,
            playerType: model.userPlayerType,
          }
          : undefined
      }
      columns={model.columns}
      onHover={(columnIndex) => $send(["hovered", { columnIndex }])}
      onClick={(columnIndex) =>
        $send(['input-move', { columnIndex, userId: ctx.currentUserId }])
      }
      visual={model.visual}
    />,
  })
}

export const viewGame = ({
  model,
  ctx,
  $send,
}: {
  model: FrontendGameModel
  ctx: Ctx
  $send: (msg: Msg) => void
}) => {
  const stopGameRes = handle(['stop-game', { userId: ctx.currentUserId }], model)
  const restartRes = handle(['restart', { userId: ctx.currentUserId }], model)
  const swapSidesRes = handle(
    ['swap-sides', { userId: ctx.currentUserId }],
    model,
  )
  const gameOver = toGameOver(model)
  return (
    <FillBox>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 1,
          gap: 1,
        }}
      >
        <ViewGamePlayerSlot model={model} ctx={ctx} playerType="PlayerOne" />
        <ViewGamePlayerSlot model={model} ctx={ctx} playerType="PlayerTwo" />
      </Box>

      <FeedbackBar ctx={ctx} model={model} />

      <Box sx={{ position: "relative", mt: 1 }}>
        <ViewColumns
          ghost={
            ctx.currentUserId === model.player &&
              toTurn(model.columns) === model.userPlayerType &&
              model.ghostIndex !== "none"
              ? {
                columnIndex: model.ghostIndex,
                playerType: model.userPlayerType,
              }
              : undefined
          }
          columns={model.columns}
          onHover={(columnIndex) => $send(["hovered", { columnIndex }])}
          onClick={(columnIndex) =>
            $send(['input-move', { columnIndex, userId: ctx.currentUserId }])
          }
          visual={model.visual}
        />
        <Fade in={gameOver.type !== "none"}>
          <Box
            onClick={() => $send(['restart', { userId: ctx.currentUserId }])}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0, 0, 0, 0.333)",
              color: "#fff",
            }}
          >
            {gameOver.type !== "none" && (
              <ViewGameOverMessage
                model={model}
                currentUserId={ctx.currentUserId}
                gameOver={gameOver}
              />
            )}
          </Box>
        </Fade>
      </Box>

      <Box sx={{ flex: 1 }} />
      <Box sx={{ display: "flex" }}>
        <ActionButton
          icon={<Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />}
          label="Exit"
          onClick={() => $send(['stop-game', { userId: ctx.currentUserId }])}
          disabled={stopGameRes.type === "Err"}
        />
        <ActionButton
          icon={<Icons.RestartAlt />}
          label='restart'
          onClick={() => $send(['restart', { userId: ctx.currentUserId }])}
          disabled={restartRes.type === "Err"}
        />
        <ActionButton
          icon={<Icons.SwapHorizSharp />}
          label="Swap"
          onClick={() => $send(['swap-sides', { userId: ctx.currentUserId }])}
          disabled={swapSidesRes.type === "Err"}
        />
      </Box>
    </FillBox>
  )
}

const flicker = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.66; }
  100% { opacity: 1; }
`

const FeedbackBar = ({ ctx, model }: { ctx: Ctx, model: GameModel }) => {
  const status = toStatus(model.columns)
  if (status.type !== 'Playing') {
    return (
      <Typography align='center' color='text.secondary'>
        Game Over
      </Typography>
    )
  }

  if (status.turn === model.userPlayerType) {

    if (ctx.currentUserId === model.player) {

      return (
        <Typography align='center' color='text.secondary' sx={{ display: 'flex', alignItems: "center", justifyContent: "center", animation: `${flicker} 0.75s infinite ease` }}>
          <PlayerIcon sx={{ width: "1rem", height: "1rem", marginRight: 1 / 2 }} playerType={status.turn} />
          Your Turn
        </Typography>
      )
    }

    return (
      <Typography align='center' color='text.secondary' sx={{ display: 'flex', alignItems: "center", justifyContent: "center", animation: `${flicker} 0.75s infinite ease` }}>
        <PlayerIcon sx={{ width: "1rem", height: "1rem", mr: 1 / 2 }} playerType={status.turn} />
        <Avatar sx={{ width: "1rem", height: "1rem", mr: 1 / 2 }} src={ctx.profiles[model.player]?.avatarUrl} />
        Turn
      </Typography>
    )
  }


  return (
    <Typography align='center' color='text.secondary' sx={{ display: 'flex', alignItems: "center", justifyContent: "center" }}>
      <PlayerIcon sx={{ width: "1rem", height: "1rem", mr: 1 / 2 }} playerType={status.turn} />
      <Icons.SmartToy sx={{ width: "1rem", height: "1rem", mr: 1 / 2 }} />
      Turn
    </Typography>
  )
}

const ViewGameOverMessage = ({
  gameOver,
  currentUserId,
  model,
}: {
  model: Model
  currentUserId: UserId
  gameOver: GameOver
}) => {
  switch (gameOver.type) {
    case "Tie": {
      return (

        <Typography align="center" fontSize={64}>
          Tie
        </Typography>

      )
    }

    case "Winner": {
      const winner = gameOver.winner

      if (model.player === currentUserId) {
        if (winner === model.userPlayerType) {
          return (

            <Typography align="center" fontSize={64}>
              You Won
            </Typography>

          )
        }

        return (

          <Typography align="center" fontSize={64}>
            You Lost
          </Typography>

        )
      }

      const size = 72
      return (

        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <PlayerIcon
            sx={{ width: size, height: size }}
            playerType={winner}
          />
          <Typography align="center" fontSize={size}>
            Won
          </Typography>
        </Box>

      )
    }
  }
}

const ViewGamePlayerSlot = ({
  model,
  playerType,
  ctx,
}: {
  model: GameModel
  playerType: PlayerType
  ctx: Ctx
}) => {
  const size = { width: "1.5rem", height: "1.5rem" }
  const status = toStatus(model.columns)
  const uiTheme = useTheme()


  return (
    <Paper
      // variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        flex: 1,
        overflow: "hidden",
        p: 1,
        borderBottom: status.type === 'Playing' && status.turn === playerType ? `solid 3px ${gameTheme.primary.dark}` : `solid 3px ${uiTheme.palette.divider}`
      }}
    >
      {model.userPlayerType === playerType ? (
        <>
          <PlayerIcon playerType={playerType} sx={{ ...size, marginRight: 1 }} />
          <Avatar
            src={ctx.profiles[model.player]?.avatarUrl}
            sx={{ ...size, marginRight: 1 }}
          />
          <Typography noWrap>
            {ctx.profiles[model.player]?.username ?? "..."}
          </Typography>
        </>
      ) : (
        <>
          <PlayerIcon playerType={playerType} sx={{ ...size, marginRight: 1 }} />
          <Icons.SmartToy
            sx={{ ...size, padding: 0, margin: 0, marginRight: 1 }}
          />
          <Typography noWrap sx={{ flex: 1 }}>
            {model.botLevel}
          </Typography>

          {isBotTurn(model) && (
            <Box
              sx={{
                marginLeft: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={size.width} />
            </Box>
          )}
        </>
      )}

    </Paper>
  )



}

