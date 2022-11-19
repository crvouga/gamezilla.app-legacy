import { Cmd, Sub } from "../../../Core"
import { UserId } from "../../../Data"
import * as ProfileStore from "../../../Profile/Profile.Store"
import * as Snackbar from "../../../Snackbar"
import * as UI from "../../../UI"
import {
  botLevels, GameOver, gameTheme, PlayerType,
  PlayerTypeIcon,
  playerTypes, toGameOver,
  toTurn,
  ViewBoard
} from "../TicTacToe"
import { VersusHeader } from "../Views"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  GameModel,
  initSharedModel,
  inputBot,
  inputBotToString,
  inputPlayerType,
  inputPlayerTypeToString,
  restart,
  startGame,
  stopGame,
  swapSides,
  ToBackend,
  ToFrontend
} from "./UserVsBot.Types"

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

export type OutAction = Snackbar.Action

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "StartGame":
    case "StopPlaying":
    case "StartPlaying":
    case "InputBot":
    case "StopGame":
    case "InputMove":
    case "Restart":
    case "SwapSides":
    case "InputPlayerType": {
      return [model, sendToBackend(msg)]
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {

    case 'PlayerLeft': {
      const modelNew = mergeWithBackend(model, msg[1])
      return [modelNew, Cmd.None, []]
    }

    case "BotMove_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, [['Snackbar', { message: "Bot failed to make a move", variant: "Error" }]]]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None, []]
    }

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
  dispatch,
  store,
  currentUserId,
}: {
  currentUserId: UserId
  store: ProfileStore.Model
  goBack: () => void
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const uiTheme = UI.useTheme()

  if (model.type === "Setup") {
    const startGameResult = startGame({ userId: currentUserId }, model)
    const inputBotResult = inputBot(
      { userId: currentUserId, botLevel: model.botLevel },
      model,
    )
    const inputPlayerTypeResult = inputPlayerType(
      { userId: currentUserId, playerType: model.userPlayerType },
      model,
    )

    return (
      <UI.FillBox>
        <UI.Box sx={{ flex: 1, overflowY: "scroll" }}>
          <VersusHeader
            store={store}
            X={model.userPlayerType === 'X' ? model.player === "None" ? { type: "User" } : { type: "User", userId: model.player } : { type: "Bot", label: model.botLevel }}
            O={model.userPlayerType === 'O' ? model.player === "None" ? { type: "User" } : { type: "User", userId: model.player } : { type: "Bot", label: model.botLevel }}
          />
          <UI.Typography
            color="text.secondary"
            sx={{ paddingX: 2, paddingTop: 2, paddingBottom: 1 }}
          >
            Player
          </UI.Typography>

          <UI.Box sx={{ paddingX: 2, paddingBottom: 2 }}>
            {model.player === "None" ? (
              <UI.Button
                fullWidth
                variant="contained"
                onClick={() =>
                  dispatch(["StartPlaying", { userId: currentUserId }])
                }
              >
                Start Playing
              </UI.Button>
            ) : (
              <UI.Box sx={{ display: "flex", alignItems: "center" }}>
                <UI.Avatar
                  src={store.profiles[model.player]?.avatarUrl}
                  sx={{ marginRight: 1 }}
                />
                <UI.Box sx={{ flex: 1, overflow: "hidden" }}>
                  <UI.Typography noWrap sx={{ textOverflow: "ellipsis" }} >
                    {store.profiles[model.player]?.username ?? "..."}
                  </UI.Typography>
                </UI.Box>

                {model.player === currentUserId && (
                  <UI.Button
                    onClick={() =>
                      dispatch(["StopPlaying", { userId: currentUserId }])
                    }
                  >
                    Stop Playing
                  </UI.Button>
                )}
              </UI.Box>
            )}
          </UI.Box>

          <UI.Divider />

          <UI.Typography
            color="text.secondary"
            sx={{ paddingBottom: 1, paddingTop: 2, paddingX: 2 }}
          >
            Play As
          </UI.Typography>
          <UI.Tooltip title={inputPlayerTypeToString(inputPlayerTypeResult)}>
            <UI.ToggleButtonGroup
              fullWidth
              value={model.userPlayerType}
              sx={{ marginBottom: 2, paddingX: 2 }}
              disabled={inputPlayerTypeResult.type === "Err"}
            >
              {Object.values(playerTypes).map((playerType) => (
                <UI.ToggleButton
                  value={playerType}
                  key={playerType}
                  onClick={() =>
                    dispatch([
                      "InputPlayerType",
                      { playerType, userId: currentUserId },
                    ])
                  }
                >
                  <PlayerTypeIcon playerType={playerType} />
                </UI.ToggleButton>
              ))}
            </UI.ToggleButtonGroup>
          </UI.Tooltip>

          <UI.Typography
            color="text.secondary"
            sx={{ marginBottom: 1, paddingX: 2 }}
          >
            Bot Level
          </UI.Typography>
          <UI.Tooltip title={inputBotToString(inputBotResult)}>
            <UI.ToggleButtonGroup
              disabled={inputBotResult.type === "Err"}
              sx={{ marginBottom: 2, paddingX: 2 }}
              fullWidth
              value={model.botLevel}
            >
              {Object.values(botLevels).map((botLevel) => (
                <UI.ToggleButton
                  value={botLevel}
                  key={botLevel}
                  onClick={() =>
                    dispatch(["InputBot", { userId: currentUserId, botLevel }])
                  }
                >
                  {botLevel}
                </UI.ToggleButton>
              ))}
            </UI.ToggleButtonGroup>
          </UI.Tooltip>
        </UI.Box>

        <UI.Box
          sx={{
            padding: 2,
            display: "flex",
            gap: 2,
            borderTop: `solid 1px ${uiTheme.palette.divider}`,
          }}
        >
          <UI.Button
            fullWidth
            variant="outlined"
            onClick={goBack}
          >
            Back
          </UI.Button>
          <UI.Button
            fullWidth
            variant="contained"
            disabled={startGameResult.type === "Err"}
            onClick={() => dispatch(["StartGame", { userId: currentUserId }])}
          >
            Start Game
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    )
  }

  const gameOver = toGameOver(model.board)
  const stopGameRes = stopGame({ userId: currentUserId }, model)
  const restartRes = restart({ userId: currentUserId }, model)
  const swapSidesRes = swapSides({ userId: currentUserId }, model)

  return (
    <UI.FillBox>
      <UI.Box sx={{ flex: 1 }}>
        <UI.Box sx={{ display: "flex", padding: 1, gap: 1, paddingTop: 0 }}>
          <ViewPlayerGameSlot
            model={model}
            playerType="X"
            store={store}
          />
          <ViewPlayerGameSlot
            model={model}
            playerType="O"
            store={store}
          />
        </UI.Box>

        <UI.Box
          sx={{
            width: "100%", position: "relative", aspectRatio: 1, overflow: "hidden",
          }}
        >
          {/*  */}
          <ViewBoard
            board={model.board}
            onClick={(position) =>
              dispatch(["InputMove", { userId: currentUserId, position }])
            }
          />

          <UI.Fade in={gameOver.type !== "None"}>
            <UI.Box
              onClick={() => dispatch(["Restart", { userId: currentUserId }])}
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
                store={store}
                currentUserId={currentUserId}
                model={model}
              />
            </UI.Box>
          </UI.Fade>
        </UI.Box>
      </UI.Box>

      <UI.Box sx={{ display: "flex" }}>
        <UI.ActionButton
          onClick={() => {
            dispatch(["StopGame", { userId: currentUserId }])
          }}
          disabled={stopGameRes.type === 'Err'}
          icon={<UI.Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />}
          label="Exit"
        />
        <UI.ActionButton
          disabled={swapSidesRes.type === 'Err'}
          onClick={() => dispatch(["SwapSides", { userId: currentUserId }])}
          icon={<UI.Icons.SwapHoriz />}
          label="Swap"
        />
        <UI.ActionButton
          disabled={restartRes.type === 'Err'}
          onClick={() => dispatch(["Restart", { userId: currentUserId }])}
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
  store,
  currentUserId,
}: {
  model: GameModel
  currentUserId: UserId
  store: ProfileStore.Model
  gameOver: GameOver | { type: "None" }
}) => {
  switch (gameOver.type) {
    case "None": {
      return <></>
    }

    case "Tie": {
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
              Tie
            </UI.Typography>
          </UI.Box>

          <UI.Box sx={{ flex: 1 }} />
        </>
      )
    }

    case "Win": {
      const isCurrentUserPlaying = model.player === currentUserId
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
                src={store.profiles[model.player]?.avatarUrl}
              />
            ) : (
              <UI.Icons.SmartToy
                sx={{ marginRight: 2, width: 64, height: 64 }}
              />
            )}
            <UI.Typography
              sx={{ fontSize: 64 }}
              color="inherit"
              align="center"
            >
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
  store,
  playerType,
  model,
}: {
  model: GameModel
  store: ProfileStore.Model
  playerType: PlayerType
}) => {
  const uiTheme = UI.useTheme()

  const iconSize = {
    width: 20,
    height: 20,
  }

  const gameOver = toGameOver(model.board)

  const isTurn = gameOver.type === "None" && toTurn(model.board) === playerType

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
          <PlayerTypeIcon playerType={playerType} sx={{ display: "block", marginRight: 1, ...iconSize }} />

          {model.userPlayerType === playerType ? (
            <>
              <UI.Avatar
                src={store.profiles[model.player]?.avatarUrl}
                sx={{ marginRight: 1, ...iconSize }}
              />
              <UI.Typography
                noWrap
                sx={{ flex: 1 }}
              >
                {store.profiles[model.player]?.username ?? "..."}
              </UI.Typography>
            </>
          ) : (
            <>
              <UI.Icons.SmartToy sx={{ marginRight: 1, ...iconSize }} />
              <UI.Typography
                noWrap
                sx={{ flex: 1 }}
              >
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
