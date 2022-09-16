import {
  Audio,
  Cmd,
  exhaustive,
  Option,
  pipe,
  Result,
  Sub,
  tag,
} from "../../../Core"
import { UserId } from "../../../Data"
import * as Snackbar from "../../../Snackbar"
import * as Store from "../../../Store"
import * as UI from "../../../UI"
import * as Board from "../Board"
import {
  BackendModel,
  startGameProblemToString,
  FrontendModel,
  FrontendMsg,
  initShared,
  Res,
  startGame,
  ToBackend,
  ToFrontend,
  inputBot,
  inputBotProblemToString,
  inputColor,
  inputColorProblemToString,
  isBotTurn,
  inputMove,
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
    case "Audio_Done": {
      return [model, Cmd.None]
    }

    case "OpenedMenu": {
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None]
    }

    case "ClosedMenu": {
      return [{ ...model, openedMenuId: Option.None }, Cmd.None]
    }

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
  onBack,
  roomAvatarGroup,
}: {
  store: Store.Model
  currentUserId: UserId.UserId
  model: Model
  dispatch: (msg: Msg) => void
  onBack: () => void
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
          left={
            <UI.Button
              onClick={onBack}
              sx={{ marginLeft: -1 }}
            >
              Back
            </UI.Button>
          }
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
          sx={{ paddingX: 2 }}
          color="text.secondary"
        >
          Player
        </UI.Typography>

        <UI.Box sx={{ height: "52px", marginBottom: 1 }}>
          {model.sharedModel.userId.type === "None" ? (
            <UI.Box sx={{ paddingX: 2, paddingY: 1 }}>
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
        </UI.Box>


        <UI.Typography
          sx={{ paddingX: 2 }}
          color="text.secondary"
        >
          Bot
        </UI.Typography>

        <UI.Box sx={{ paddingX: 2, paddingBottom: 2 }}>
          <UI.Tooltip
            enterTouchDelay={0}
            title={
              inputBotResult.type === "Err"
                ? inputBotProblemToString(inputBotResult.error)
                : ""
            }
          >

            <UI.Select disabled={inputBotResult.type === 'Err'} fullWidth value={model.sharedModel.botLevel}>
              {Board.allLevels.map(botLevel => (
                <UI.MenuItem
                  selected={model.sharedModel.botLevel === botLevel}
                  value={botLevel}
                  key={botLevel}
                  onClick={() => {
                    dispatch([
                      "InputBot",
                      { botLevel, userId: currentUserId },
                    ])
                  }}
                >
                  {Board.levelToString(botLevel)}
                </UI.MenuItem>
              ))}
            </UI.Select>
          </UI.Tooltip>
        </UI.Box >

        <UI.Typography
          sx={{ paddingX: 2 }}
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

  return (
    <UI.FillBox>
      <UI.Header
        left={
          <UI.Button
            onClick={() => dispatch(["StopGame", { userId: currentUserId }])}
            sx={{ marginLeft: -1 }}
          >
            Stop
          </UI.Button>
        }
        title=""
        right={roomAvatarGroup}
      />

      <UI.Box sx={{ paddingX: 2, paddingY: 1, display: 'flex', alignItems: "center" }}>
        <UI.Icons.SmartToy sx={{ width: 42, height: 42, marginRight: 2 }} />

        <UI.Box sx={{ flex: 1 }}>
          <UI.Typography
            variant="h6"
            sx={{ fontFamily: "Roboto Mono" }}
          >
            {Board.levelToString(model.sharedModel.botLevel)}
          </UI.Typography>
        </UI.Box>
        <UI.Grow in={isBotTurn(model.sharedModel)}>
          <UI.CircularProgress
            // sx={{ width: 24, height: 24 }}
            size={24}
          />
        </UI.Grow>

      </UI.Box>

      <Board.View
        boardOrientation={model.sharedModel.userColor}
        isDraggablePiece={({ piece }) => {
          return Board.toColor(piece) === model.sharedModel.userColor && model.sharedModel.userId === currentUserId
        }}
        model={model.sharedModel.board}
        onPieceDrop={(move) => {
          dispatch(["InputMove", { userId: currentUserId, from: move.from, to: move.to, promotion: move.promotion }])
          return true
        }}

      />

      <UI.Box sx={{ paddingX: 2, paddingY: 1, display: 'flex', alignItems: "center" }}>
        <UI.Avatar src={store.Profile[model.sharedModel.userId]?.avatarUrl} sx={{ marginRight: 2 }} />

        <UI.Typography variant="h6">
          {store.Profile[model.sharedModel.userId]?.username}
        </UI.Typography>
      </UI.Box>
    </UI.FillBox>
  )
}
