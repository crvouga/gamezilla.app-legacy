import { Tooltip } from "@mui/material"
import {
  Audio,
  Cmd,
  exhaustive,
  Option, Sub,
  tag
} from "../../../Core"
import { UserId } from "../../../Data"
import * as Snackbar from "../../../Snackbar"
import * as Store from "../../../Store"
import * as UI from "../../../UI"
import * as Board from "../Board"
import { ViewActionButton } from "../Views"
import {
  BackendModel, FrontendModel,
  FrontendMsg,
  initShared, inputBot,
  inputBotProblemToString,
  inputColor,
  inputColorProblemToString, inputMove, isBotTurn, Res,
  SharedModel,
  startGame, startGameProblemToString, stopGame, stopGameResultToString, ToBackend,
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

export const init = ({
  sendToBackend,
}: {
  sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
}): [FrontendModel, Cmd.Cmd<Msg>] => {
  return [
    {
      sharedModel: initShared,
      openedMenuId: Option.None,
      openedModal: "None",
      isFlipped: false,
    },
    sendToBackend(["Init"]),
  ]
}

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
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> },
  msg: Msg,
  _model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const model: Model = { ..._model, openedMenuId: Option.None }
  switch (msg[0]) {

    // 
    //
    // Frontend Only
    //
    // 

    case "Audio_Done": {
      return [model, Cmd.None]
    }

    case 'ClosedModal': {
      return [{ ...model, openedModal: "None" }, Cmd.None]
    }

    case 'ClickedFlip': {
      return [{ ...model, isFlipped: !model.isFlipped }, Cmd.None]
    }

    case "OpenedMenu": {
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None]
    }

    case "ClosedMenu": {
      return [{ ...model, openedMenuId: Option.None }, Cmd.None]
    }

    // 
    // 
    // Frontend and Backend
    // 
    // 

    case "InputUser": {
      return [model, sendToBackend(msg)]
    }

    case "InputColor": {
      return [model, sendToBackend(msg)]
    }

    case "InputBot": {
      return [model, sendToBackend(msg)]
    }

    case "StartGame": {
      return [model, sendToBackend(msg)]
    }

    case "StopGame": {
      return [model, sendToBackend(msg)]
    }

    case "InputMove": {
      const result = inputMove(msg[1], model.sharedModel)

      const sharedModel = result.type === 'Err' ? model.sharedModel : result.value

      return [{ ...model, sharedModel: sharedModel }, sendToBackend(msg)]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  modelPrev: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  const [modelNext, cmd, actions] = updateFromBackend_(msg, modelPrev)

  if (modelPrev.sharedModel.type !== 'GameOver' && modelNext.sharedModel.type === 'GameOver') {
    return [{ ...modelNext, openedModal: "GameOver" }, cmd, actions]
  }

  return [modelNext, cmd, actions]
}

const updateFromBackend_ = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Sync": {
      return [model, Cmd.None, []]
    }

    case "GameOver": {
      return [model, Cmd.None, []]
    }

    case 'BotMoved_Done': {

      const result = msg[1]

      if (result.type === 'Err') {
        return [model, Cmd.None, []]
      }

      const { didCapture, ...sharedModel } = result.value

      return [{ ...model, sharedModel }, Cmd.None, []]
    }

    case "InputUser_Done":
    case "InputColor_Done":
    case "InputBot_Done":
    case 'InputMove_Done':
    case "StartGame_Done":
    case "StopGame_Done": {
      return handleResponse(msg, model)
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

const handleResponse = (
  res: Res,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  const result = res[1]

  if (result.type === "Err") {
    // const action: OutAction = [
    //   "Snackbar",
    //   { variant: "Error", message: result.error },
    // ]

    return [model, Cmd.None, []]
  }

  const sharedModelNew = result.value

  const modelNew = mergeWithBackend(model, sharedModelNew)

  return [modelNew, Cmd.None, []]
}

const playAudio = (src: string): Cmd.Cmd<Msg> => {
  return Audio.play(src, tag("Audio_Done"))
}

//
//
//
//
//
//
//

export const mergeWithBackend = (
  frontendModel: FrontendModel,
  backendModel: BackendModel,
): FrontendModel => {
  return {
    isFlipped: frontendModel.isFlipped,
    openedMenuId: frontendModel.openedMenuId,
    openedModal: frontendModel.openedModal,
    sharedModel: backendModel,
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
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
  currentUserId,
  store,
  model,
  dispatch,
  backButton,
  roomAvatarGroup,
}: {
  store: Store.Model
  currentUserId: UserId.UserId
  model: Model
  dispatch: (msg: Msg) => void
  backButton: UI.ViewNode
  roomAvatarGroup: UI.ViewNode
}) => {
  if (model.sharedModel.type === "Setup") {
    const startGameResult = startGame(
      { userId: currentUserId },
      model.sharedModel,
    )
    const inputBotResult = inputBot(
      { botLevel: model.sharedModel.botLevel, userId: currentUserId },
      model.sharedModel,
    )
    const inputColorResult = inputColor(
      { userColor: model.sharedModel.userColor, userId: currentUserId },
      model.sharedModel,
    )

    return (
      <UI.FillBox>
        <UI.Header
          left={backButton}
          title="Chess"
          right={roomAvatarGroup}
        />

        <UI.Typography
          variant="h5"
          sx={{ paddingX: 2, paddingBottom: 1 }}
        >
          User Vs Bot
        </UI.Typography>

        <UI.Typography
          sx={{ paddingX: 2, marginBottom: 1 }}
          color="text.secondary"
        >
          Player
        </UI.Typography>

        {model.sharedModel.userId.type === "None" ? (
          <UI.Box sx={{ paddingX: 2, }}>
            <UI.Button
              fullWidth
              size="large"
              variant="contained"
              onClick={() => {
                dispatch([
                  "InputUser",
                  { userId: Option.Some(currentUserId) },
                ])
              }}
            >
              Start Playing
            </UI.Button>
          </UI.Box>
        ) : (
          <UI.Box sx={{ display: "flex", alignItems: "center", paddingX: 2 }}>
            <UI.Avatar
              sx={{ marginRight: 1 }}
              src={store.Profile[model.sharedModel.userId.value]?.avatarUrl}
            />

            <UI.Typography
              sx={{ flex: 1 }}
              noWrap
            >
              {store.Profile[model.sharedModel.userId.value]?.username ??
                "..."}
            </UI.Typography>

            {model.sharedModel.userId.value === currentUserId && (
              <UI.Button
                size="large"
                onClick={() =>
                  dispatch(["InputUser", { userId: Option.None }])
                }
              >
                Stop Playing
              </UI.Button>
            )}
          </UI.Box>
        )}



        <UI.Typography
          sx={{ paddingX: 2, marginBottom: 1, marginTop: 2 }}
          color="text.secondary"
        >
          Bot
        </UI.Typography>

        <UI.Box sx={{ paddingX: 2, }}>
          <UI.Tooltip
            enterTouchDelay={0}
            title={
              inputBotResult.type === "Err"
                ? inputBotProblemToString(inputBotResult.error)
                : ""
            }
          >

            <UI.Select disabled={inputBotResult.type === 'Err'} fullWidth value={model.sharedModel.botLevel}>
              {Board.allLevels.map(level => (
                <UI.MenuItem
                  selected={model.sharedModel.botLevel === level}
                  value={level}
                  key={level}
                  onClick={() => {
                    dispatch([
                      "InputBot",
                      { botLevel: level, userId: currentUserId },
                    ])
                  }}
                >
                  {level} - {Board.levelToString(level)}
                </UI.MenuItem>
              ))}
            </UI.Select>
          </UI.Tooltip>
        </UI.Box >

        <UI.Typography
          sx={{ paddingX: 2, marginBottom: 1, marginTop: 2 }}
          color="text.secondary"
        >
          Color
        </UI.Typography>

        <UI.Box sx={{ paddingX: 2, paddingBottom: 2 }}>
          <UI.Tooltip
            title={
              inputColorResult.type === "Err"
                ? inputColorProblemToString(inputColorResult.error)
                : ""
            }
          >
            <UI.ToggleButtonGroup
              disabled={inputColorResult.type === "Err"}
              fullWidth
              value={model.sharedModel.userColor}
            >
              <UI.ToggleButton
                value="w"
                onClick={() =>
                  dispatch([
                    "InputColor",
                    { userColor: "w", userId: currentUserId },
                  ])
                }
              >
                White
              </UI.ToggleButton>
              <UI.ToggleButton
                value="b"
                onClick={() =>
                  dispatch([
                    "InputColor",
                    { userColor: "b", userId: currentUserId },
                  ])
                }
              >
                Black
              </UI.ToggleButton>
            </UI.ToggleButtonGroup>
          </UI.Tooltip>
        </UI.Box>
        <UI.Box sx={{ flex: 1 }} />

        <UI.Box sx={{ paddingX: 2, paddingBottom: 1 }}>
          <UI.Tooltip
            title={
              startGameResult.type === "Err"
                ? startGameProblemToString(startGameResult.error)
                : ""
            }
          >
            <span>
              <UI.Button
                fullWidth
                size="large"
                variant="contained"
                disabled={startGameResult.type === "Err"}
                onClick={() => dispatch(["StartGame", { userId: currentUserId }])}
              >
                Start Game
              </UI.Button>
            </span>
          </UI.Tooltip>
        </UI.Box>
      </UI.FillBox >
    )
  }

  const stopGameResult = stopGame({ userId: currentUserId }, model.sharedModel)

  const botSlot =
    (
      <UI.Box sx={{ paddingX: 2, display: 'flex', alignItems: "center" }}>
        <UI.Avatar sx={{ marginRight: 2, backgroundColor: "transparent" }}>

          <UI.Icons.SmartToy
            sx={{ color: "text.primary", width: "100%", height: "100%" }}
          // sx={{ width: 40, height: 40, marginRight: 2 }}
          />
        </UI.Avatar>

        <UI.Box sx={{ flex: 1 }}>
          <UI.Typography
            variant="h6"
            sx={{ fontFamily: "Roboto Mono" }}
          >
            {Board.levelToString(model.sharedModel.botLevel)}
          </UI.Typography>
        </UI.Box>

        {isBotTurn(model.sharedModel) && <UI.CircularProgress size={24} />}
      </UI.Box>
    )

  const userSlot = (
    <UI.Box sx={{ paddingX: 2, display: 'flex', alignItems: "center" }}>
      <UI.Avatar src={store.Profile[model.sharedModel.userId]?.avatarUrl} sx={{ marginRight: 2 }} />

      <UI.Typography variant="h6">
        {store.Profile[model.sharedModel.userId]?.username}
      </UI.Typography>
    </UI.Box>
  )

  const boardOrientation = model.isFlipped ? Board.toOppositeColor(model.sharedModel.userColor) : model.sharedModel.userColor

  const topSlot =
    <UI.Box sx={{ paddingTop: 1, paddingBottom: 2 }}>
      {boardOrientation === model.sharedModel.userColor ? botSlot : userSlot}
    </UI.Box>

  const bottomSlot =
    <UI.Box sx={{ paddingTop: 2, paddingBottom: 1 }}>
      {boardOrientation === model.sharedModel.userColor ? userSlot : botSlot}
    </UI.Box>


  return (
    <UI.FillBox>
      <UI.Header
        left={
          <Tooltip title={stopGameResultToString(stopGameResult)}>
            <span>
              <UI.Button
                disabled={stopGameResult.type === 'Err'}
                onClick={() => dispatch(["StopGame", { userId: currentUserId }])}
                sx={{ marginLeft: -1 }}
              >
                Stop
              </UI.Button>
            </span>
          </Tooltip>

        }
        title={toGameText(model.sharedModel)}
        right={roomAvatarGroup}
      />

      {topSlot}

      <Board.View
        boardOrientation={boardOrientation}
        isDraggablePiece={({ piece }) => {
          return Board.toColor(piece) === model.sharedModel.userColor && model.sharedModel.userId === currentUserId
        }}
        model={model.sharedModel.board}
        onPieceDrop={(move) => {
          const msg: Msg = ["InputMove", { userId: currentUserId, from: move.from, to: move.to, promotion: move.promotion }]

          dispatch(msg)

          const result = inputMove(msg[1], model.sharedModel)

          return result.type === 'Ok'
        }}

      />

      {bottomSlot}

      <UI.Box sx={{ width: "100%", display: "flex" }}>
        <ViewActionButton
          icon={
            <UI.Icons.Flip
              sx={{
                transform: model.isFlipped
                  ? "rotate(90deg)"
                  : "rotate(270deg)",
              }}
            />
          }
          title={model.isFlipped ? "Unflip" : "Flip"}
          onClick={() => {
            dispatch(["ClickedFlip"])
          }}
        />
      </UI.Box>

      {model.sharedModel.type === 'GameOver' && (

        <UI.Dialog
          open={model.sharedModel.type === 'GameOver' && model.openedModal === 'GameOver'}
          onClose={() => dispatch(['ClosedModal'])}
        >
          {model.sharedModel.gameOver.type === 'Checkmate' && (
            <UI.DialogTitle>
              {Board.colorToString(model.sharedModel.gameOver.winner)} won by checkmate
            </UI.DialogTitle>
          )}

          {model.sharedModel.gameOver.type === 'Stalemate' && (
            <UI.DialogTitle>
              Drawn by stalemate
            </UI.DialogTitle>
          )}

          <UI.DialogActions>
            <UI.Button onClick={() => dispatch(['ClosedModal'])}>
              Close
            </UI.Button>
          </UI.DialogActions>
        </UI.Dialog>
      )}

    </UI.FillBox>
  )
}


const toGameText = (model: SharedModel): string => {
  switch (model.type) {
    case "GameOver": {
      switch (model.gameOver.type) {
        case "Checkmate": {
          const color = Board.colorToString(model.gameOver.winner)
          return `${color} won by checkmate`
        }

        case "Stalemate": {
          return "Stalemate"
        }

        default:
          return exhaustive(model.gameOver)
      }
    }

    case "Setup": {
      return "Setting up game"
    }

    case "Game": {
      if (Board.inCheck(model.board)) {
        return `${Board.colorToString(Board.toTurn(model.board))} is in check`
      }

      return `${Board.colorToString(Board.toTurn(model.board))}'s turn`
    }

    default:
      return exhaustive(model)
  }
}