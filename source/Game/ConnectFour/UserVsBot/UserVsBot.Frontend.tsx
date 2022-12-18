import { keyframes } from "@emotion/react"
import * as Alerts from "../../../Alerts"
import { Cmd, Sub } from "../../../Core"
import { UserId } from "../../../Data/UserId"
import { ActionButton, Avatar, Box, CircularProgress, Fade, FillBox, Icons, Paper, Typography, useTheme } from "../../../UI"
import { Ctx, viewUserVsBotSetupScreen } from "../../Game.Shared"
import { gameTheme, PlayerType, playerTypes, toStatus, toTurn, ViewColumns } from "../ConnectFour"
import { CoverArt } from "../ConnectFour.Frontend"
import { PlayerIcon } from "../Views"
import {
  BackendModel, botLevel, FrontendModel,
  FrontendMsg,
  GameModel,
  GameOver,
  handle,
  initShared,
  isBotTurn,
  ToBackend,
  ToFrontend,
  toGameOver
} from "./UserVsBot.Types"

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
  return { ...initShared(...params), ghostIndex: "None" }
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
    case "Hovered": {
      return [{ ...model, ghostIndex: msg[1].columnIndex }, Cmd.None]
    }

    case "InputMove":
    case "InputPlayerType":
    case "Restart":
    case "StartGame":
    case "StartPlaying":
    case "StopGame":
    case "StopPlaying":
    case "SwapSides":
    case "InputBotLevel": {
      return [model, sendToBackend(msg)]
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "PlayerLeft": {
      const modelNew = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1],
      })
      return [modelNew, Cmd.None, []]
    }

    case "BotMove":
    case "InputMove": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }

      const modelNew = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1].value,
      })

      return [{ ...modelNew, ghostIndex: "None" }, Cmd.None, []]
    }

    case "InputPlayerType":
    case "Restart":
    case "StartGame":
    case "StartPlaying":
    case "StopGame":
    case "StopPlaying":
    case "SwapSides":
    case "InputBotLevel": {
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
  return { ...backendModel, ghostIndex: frontendModel.ghostIndex }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None
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
  $d,
}: {
  model: Model
  $d: (msg: Msg) => void
  goBack: () => void
  ctx: Ctx
}) => {
  if (model.type === "Setup") {
    return (
      viewUserVsBotSetupScreen({
        coverArt: CoverArt(),
        title: "Connect Four",
        subtitle: "Vs Computer",
        ctx,
        playerId: model.player === "None" ? null : model.player,
        onStartPlaying: () => $d(['StartPlaying', { userId: ctx.currentUserId }]),
        onStopPlaying: () => $d(['StopPlaying', { userId: ctx.currentUserId }]),
        botLevel: {
          values: Object.values(botLevel),
          selected: model.botLevel,
          onInput: (level) => $d(['InputBotLevel', { botLevel: level, userId: ctx.currentUserId }]),
        },
        player: {
          values: Object.values(playerTypes),
          selected: model.userPlayerType,
          onInput: (playerType) => $d(['InputPlayerType', { playerType, userId: ctx.currentUserId }]),
          icon: (playerType) => <PlayerIcon playerType={playerType} sx={{ width: "1rem", height: "1rem" }} />,
        },
        onCancel: goBack,
        onStartGame: () => $d(['StartGame', { userId: ctx.currentUserId }]),
      })

    )
  }

  const stopGameRes = handle(["StopGame", { userId: ctx.currentUserId }], model)
  const restartRes = handle(["Restart", { userId: ctx.currentUserId }], model)
  const swapSidesRes = handle(
    ["SwapSides", { userId: ctx.currentUserId }],
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
              model.ghostIndex !== "None"
              ? {
                columnIndex: model.ghostIndex,
                playerType: model.userPlayerType,
              }
              : undefined
          }
          columns={model.columns}
          onHover={(columnIndex) => $d(["Hovered", { columnIndex }])}
          onClick={(columnIndex) =>
            $d(["InputMove", { columnIndex, userId: ctx.currentUserId }])
          }
        />
        <Fade in={gameOver.type !== "None"}>
          <Box
            onClick={() => $d(["Restart", { userId: ctx.currentUserId }])}
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
            {gameOver.type !== "None" && (
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
          onClick={() => $d(["StopGame", { userId: ctx.currentUserId }])}
          disabled={stopGameRes.type === "Err"}
        />
        <ActionButton
          icon={<Icons.RestartAlt />}
          label="Restart"
          onClick={() => $d(["Restart", { userId: ctx.currentUserId }])}
          disabled={restartRes.type === "Err"}
        />
        <ActionButton
          icon={<Icons.SwapHorizSharp />}
          label="Swap"
          onClick={() => $d(["SwapSides", { userId: ctx.currentUserId }])}
          disabled={swapSidesRes.type === "Err"}
        />
      </Box>
    </FillBox >
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
        <>
          <Typography align="center" fontSize={64}>
            Tie
          </Typography>
        </>
      )
    }

    case "Winner": {
      const winner = gameOver.winner

      if (model.player === currentUserId) {
        if (winner === model.userPlayerType) {
          return (
            <>
              <Typography align="center" fontSize={64}>
                You Won
              </Typography>
            </>
          )
        }

        return (
          <>
            <Typography align="center" fontSize={64}>
              You Lost
            </Typography>
          </>
        )
      }

      const size = 72
      return (
        <>
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
        </>
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

