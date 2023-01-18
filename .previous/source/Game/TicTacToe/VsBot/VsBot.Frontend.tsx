import * as Alerts from "../../../Alerts"
import { Cmd, Sub } from "../../../Core"
import * as UI from "../../../UI"
import { Ctx, viewVsBotSetupScreen } from "../../Game"
import {
  BotLevel,
  botLevels,
  GameOver,
  gameTheme,
  PlayerType,
  PlayerTypeIcon,
  playerTypes,
  toGameOver,
  toTurn,
  ViewBoard
} from "../TicTacToe/TicTacToe"
import { viewCoverArt } from "../TicTacToe/TicTacToe"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  GameModel,
  initSharedModel, restart, stopGame,
  swapSides,
  ToBackend,
  ToFrontend
} from "./VsBot.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = initSharedModel

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = Alerts.Action

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'start-game':
    case "stop-playing":
    case "start-playing":
    case "InputBot":
    case 'stop-game':
    case 'input-move':
    case 'restart':
    case 'swap-sides':
    case "input-player-type": {
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
      const modelNew = mergeWithBackend(model, msg[1])
      return [modelNew, Cmd.None, []]
    }

    case "BotMove_Done":
    case "InputBot_Done":
    case "StartGame_Done":
    case "StartPlaying_Done":
    case "StopPlaying_Done":
    case "StopGame_Done":
    case "InputMove_Done":
    case "Restart_Done":
    case "SwapSides_Done":
    case "InputPlayerType_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }
      const modelNew = mergeWithBackend(model, msg[1].value)
      return [modelNew, Cmd.None, []]
    }
  }
}

export const mergeWithBackend = (
  _frontendModel: FrontendModel,
  backendModel: BackendModel,
): FrontendModel => {
  return backendModel
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
  goBack,
  model,
  $send,
  ctx,
}: {
  ctx: Ctx
  goBack: () => void
  model: Model
  $send: (msg: Msg) => void
}) => {
  if (model.type === "Setup") {
    return (
      viewVsBotSetupScreen<BotLevel, PlayerType>({
        leftPlayerType: "X",
        playerId: model.player === "none" ? null : model.player,
        subtitle: "Vs Computer",
        title: "Tic-Tac-Toe",
        coverArt: viewCoverArt(),
        ctx,
        onCancel: goBack,
        onStartGame: () => $send(['start-game', { userId: ctx.currentUserId }]),
        onStartPlaying: () => $send(["start-playing", { userId: ctx.currentUserId }]),
        onStopPlaying: () => $send(["stop-playing", { userId: ctx.currentUserId }]),
        player: {
          values: Object.values(playerTypes),
          onInput: (player) => $send(["input-player-type", { userId: ctx.currentUserId, playerType: player }]),
          selected: model.userPlayerType,
          icon: ({ playerType, sx }) => <PlayerTypeIcon sx={sx} playerType={playerType} />,
        },
        botLevel: {
          onInput: (botLevel) => $send(["InputBot", { userId: ctx.currentUserId, botLevel }]),
          selected: model.botLevel,
          values: Object.values(botLevels)
        }
      })
    )
  }

  const gameOver = toGameOver(model.board)
  const stopGameRes = stopGame({ userId: ctx.currentUserId }, model)
  const restartRes = restart({ userId: ctx.currentUserId }, model)
  const swapSidesRes = swapSides({ userId: ctx.currentUserId }, model)

  return (
    <UI.FillBox>
      <UI.Box sx={{ flex: 1 }}>
        <UI.Box sx={{ display: "flex", padding: 1, gap: 1, paddingTop: 0 }}>
          <ViewPlayerGameSlot model={model} playerType="X" ctx={ctx} />
          <ViewPlayerGameSlot model={model} playerType="O" ctx={ctx} />
        </UI.Box>

        <UI.Box
          sx={{
            width: "100%",
            position: "relative",
            aspectRatio: 1,
            overflow: "hidden",
          }}
        >
          {/*  */}
          <ViewBoard
            board={model.board}
            onClick={(position) =>
              $send(['input-move', { userId: ctx.currentUserId, position }])
            }
          />

          <UI.Fade in={gameOver.type !== "none"}>
            <UI.Box
              onClick={() => $send(['restart', { userId: ctx.currentUserId }])}
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                color: "#fff",
                display: "flex",
                placeContent: "center center",
                flexDirection: "column",
              }}
            >
              <ViewGameOverMessage
                gameOver={gameOver}
                ctx={ctx}
                model={model}
              />
            </UI.Box>
          </UI.Fade>
        </UI.Box>
      </UI.Box>

      <UI.Box sx={{ display: "flex" }}>
        <UI.ActionButton
          onClick={() => {
            $send(['stop-game', { userId: ctx.currentUserId }])
          }}
          disabled={stopGameRes.type === "Err"}
          icon={<UI.Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />}
          label="Exit"
        />
        <UI.ActionButton
          disabled={swapSidesRes.type === "Err"}
          onClick={() => $send(['swap-sides', { userId: ctx.currentUserId }])}
          icon={<UI.Icons.SwapHoriz />}
          label="Swap"
        />
        <UI.ActionButton
          disabled={restartRes.type === "Err"}
          onClick={() => $send(['restart', { userId: ctx.currentUserId }])}
          icon={<UI.Icons.RestartAlt />}
          label="Reset"
        />
      </UI.Box>
    </UI.FillBox>
  )
}

const ViewGameOverMessage = ({
  gameOver,
  model,
  ctx,
}: {
  model: GameModel
  gameOver: GameOver | { type: "none" }
  ctx: Ctx
}) => {
  switch (gameOver.type) {
    case "none": {
      return <></>
    }

    case "Tie": {
      return (
        <>
          <UI.Box sx={{ flex: 1 }} />

          <UI.Box
            sx={{ display: "flex", placeContent: "center center", flex: 1 }}
          >
            <UI.Typography sx={{ fontSize: 72 }} color="inherit" align="center">
              Tie
            </UI.Typography>
          </UI.Box>

          <UI.Box sx={{ flex: 1 }} />
        </>
      )
    }

    case "Win": {
      const isCurrentUserPlaying = model.player === ctx.currentUserId
      const didUserWin = model.userPlayerType === gameOver.winner

      if (isCurrentUserPlaying && didUserWin) {
        return (
          <>
            <UI.Box sx={{ flex: 1 }} />

            <UI.Box
              sx={{ display: "flex", placeContent: "center center", flex: 1 }}
            >
              <UI.Typography
                sx={{ fontSize: 72 }}
                color="inherit"
                align="center"
              >
                You Won
              </UI.Typography>
            </UI.Box>

            <UI.Box sx={{ flex: 1 }} />
          </>
        )
      }

      if (isCurrentUserPlaying && !didUserWin) {
        return (
          <>
            <UI.Box sx={{ flex: 1 }} />

            <UI.Box
              sx={{ display: "flex", placeContent: "center center", flex: 1 }}
            >
              <UI.Typography
                sx={{ fontSize: 72 }}
                color="inherit"
                align="center"
              >
                You Lost
              </UI.Typography>
            </UI.Box>

            <UI.Box sx={{ flex: 1 }} />
          </>
        )
      }

      return (
        <>
          <UI.Box sx={{ flex: 1 }} />

          <UI.Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            {didUserWin ? (
              <UI.Avatar
                sx={{ marginRight: 2, width: 64, height: 64 }}
                src={ctx.profiles[model.player]?.avatarUrl}
              />
            ) : (
              <UI.Icons.SmartToy
                sx={{ marginRight: 2, width: 64, height: 64 }}
              />
            )}
            <UI.Typography sx={{ fontSize: 64 }} color="inherit" align="center">
              Won
            </UI.Typography>
          </UI.Box>

          <UI.Box sx={{ flex: 1 }} />
        </>
      )
    }
  }
}

export const ViewPlayerGameSlot = ({
  ctx,
  playerType,
  model,
}: {
  model: GameModel
  ctx: Ctx
  playerType: PlayerType
}) => {
  const uiTheme = UI.useTheme()

  const iconSize = {
    width: 20,
    height: 20,
  }

  const gameOver = toGameOver(model.board)

  const isTurn = gameOver.type === "none" && toTurn(model.board) === playerType

  return (
    <UI.Paper
      sx={{ flex: 1, overflow: "hidden", height: "100%", width: "100%" }}
      variant="outlined"
    >
      <UI.Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          borderBottom: `solid 3.5px ${isTurn ? gameTheme.background : uiTheme.palette.divider
            }`,
        }}
      >
        <UI.Box
          sx={{
            display: "flex",
            flexDirection: "row",
            padding: 1,
            flex: 2,
            overflow: "hidden",
            alignItems: "center",
          }}
        >
          <PlayerTypeIcon
            playerType={playerType}
            sx={{ display: "block", marginRight: 1, ...iconSize }}
          />

          {model.userPlayerType === playerType ? (
            <>
              <UI.Avatar
                src={ctx.profiles[model.player]?.avatarUrl}
                sx={{ marginRight: 1, ...iconSize }}
              />
              <UI.Typography noWrap sx={{ flex: 1 }}>
                {ctx.profiles[model.player]?.username ?? "..."}
              </UI.Typography>
            </>
          ) : (
            <>
              <UI.Icons.SmartToy sx={{ marginRight: 1, ...iconSize }} />
              <UI.Typography noWrap sx={{ flex: 1 }}>
                {model.botLevel}
              </UI.Typography>
              {isTurn && (
                <UI.CircularProgress
                  sx={{ marginLeft: 1 }}
                  size={iconSize.width}
                />
              )}
            </>
          )}
        </UI.Box>
      </UI.Box>
    </UI.Paper>
  )
}
