import { Audio, Cmd, exhaustive, Option, p, Sub, t } from "../../../Core"
import { UserId } from "../../../Data"
import * as Snackbar from "../../../Snackbar"
import * as ProfileStore from "../../../Profile/Profile.Store"
import * as UI from "../../../UI"
import * as Board from "../Board"
import * as Clock from "../Clock"
import * as Sounds from "../Sounds"
import { PawnIcon, VersusHeader } from "../Views"
import {
  BackendModel,
  cancelStartGame,
  FrontendModel,
  FrontendMsg,
  initShared,
  inputClock,
  inputClockProblemToString,
  inputMove,
  InputMove,
  SharedModel,
  startGame, ToBackend,
  ToFrontend
} from "./UserVsUser.Types"

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
  userId,
}: {
  sendToBackend: (msg: ToBackend) => Cmd<never>
  userId: UserId | "None"
}): [FrontendModel, Cmd<Msg>] => {
  return [
    {
      sharedModel: initShared({ userId }),
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
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd<never> },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    //
    //
    // FrontendMsg
    //
    //

    case "Audio_Done": {
      return [model, Cmd.None]
    }

    case "OpenedMenu": {
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None]
    }

    case "ClosedMenu": {
      return [{ ...model, openedMenuId: Option.None }, Cmd.None]
    }

    case "ClickedFlip": {
      return [{ ...model, isFlipped: !model.isFlipped }, Cmd.None]
    }

    case "OpenedModal": {
      return [{ ...model, openedModal: msg[1] }, Cmd.None]
    }

    case "ClosedModal": {
      return [{ ...model, openedModal: "None" }, Cmd.None]
    }

    //
    //
    //
    // ToBackend
    //
    //
    //

    case "InputPlayer": {
      return [model, sendToBackend(msg)]
    }

    case "StartGame": {
      return [model, sendToBackend(msg)]
    }

    case "InputClock": {
      return [model, sendToBackend(msg)]
    }

    case "RequestToDraw": {
      return [model, sendToBackend(msg)]
    }

    case "Resign": {
      return [{ ...model, openedModal: "None" }, sendToBackend(msg)]
    }

    case "RespondToDraw": {
      return [model, sendToBackend(msg)]
    }

    case "NewGame": {
      return [model, sendToBackend(msg)]
    }

    case "InputMove": {
      const result = inputMove(msg[1], model.sharedModel)

      if (result.type === "Err") {
        return [model, Cmd.None]
      }

      return [{ ...model, sharedModel: result.value }, sendToBackend(msg)]
    }

    case "CancelStartGame": {
      return [model, sendToBackend(msg)]
    }

    case "CancelDraw": {
      return [model, sendToBackend(msg)]
    }

    default:
      return exhaustive(msg[0])
  }
}

export const updateFromBackend = (
  {
    currentUserId,
    profileStore,
  }: {
    currentUserId: UserId;
    profileStore: ProfileStore.Model
  },
  msg: ToFrontend,
  _model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  const model: Model = { ..._model, openedMenuId: Option.None }

  switch (msg[0]) {
    case "Sync": {
      return [
        {
          ...model,
          sharedModel: msg[1],
        },
        Cmd.None,
        [],
      ]
    }

    case "InputClock_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }
      return [{ ...model, sharedModel: msg[1].value }, Cmd.None, []]
    }

    case "InputMove_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }

      const sharedModelNew = msg[1].value

      if (sharedModelNew.type !== "Game") {
        return [model, Cmd.None, []]
      }

      const soundCmd = Board.inCheck(sharedModelNew.board)
        ? playAudio(Sounds.check)
        : sharedModelNew.didCapture
          ? playAudio(Sounds.capture)
          : playAudio(Sounds.move)

      return [{ ...model, sharedModel: sharedModelNew }, soundCmd, []]
    }

    case "InputPlayer_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }

      const sharedModel = msg[1].value

      return [{ ...model, sharedModel }, Cmd.None, []]
    }

    case "StartGame_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }

      const sharedModel = msg[1].value

      return [{ ...model, sharedModel }, Cmd.None, []]
    }

    //
    //
    // Draw
    //
    //

    case "RequestToDraw_Done": {
      switch (msg[1].type) {
        case "Err": {
          return [model, Cmd.None, []]
        }

        case "Ok": {
          return [
            { ...model, openedModal: "AskedToDraw" },
            playAudio(Sounds.uiUnlock),
            [],
          ]
        }
      }
    }

    case "RespondToDraw_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }

      const sharedModel = msg[1].value

      if (sharedModel.type === "GameOver") {
        return [{ ...model, sharedModel }, Cmd.None, []]
      }

      const isNotPlaying =
        sharedModel.type === "Game" &&
        sharedModel.w !== currentUserId &&
        sharedModel.b !== currentUserId

      if (isNotPlaying) {
        return [{ ...model, sharedModel }, Cmd.None, []]
      }

      const action: OutAction = [
        "Snackbar",
        { variant: "Info", message: "Draw was declined" },
      ]

      return [{ ...model, sharedModel }, Cmd.None, [action]]
    }

    case "CancelDraw_Done": {
      const result = msg[1]

      if (result.type === "Err") {
        return [model, Cmd.None, []]
      }

      const sharedModel = result.value

      const isNotPlaying =
        sharedModel.type === "Game" &&
        sharedModel.w !== currentUserId &&
        sharedModel.b !== currentUserId

      if (isNotPlaying) {
        return [{ ...model, sharedModel }, Cmd.None, []]
      }

      const action: OutAction = [
        "Snackbar",
        { variant: "Info", message: "Draw was cancelled" },
      ]

      return [{ ...model, sharedModel }, Cmd.None, [action]]
    }

    //
    //
    //
    //
    //

    case "Resign_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }

      const sharedModelNew = msg[1].value

      if (sharedModelNew.type === "Setup") {
        return [model, Cmd.None, []]
      }

      return [{ ...model, sharedModel: sharedModelNew }, Cmd.None, []]
    }

    case "NewGame_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None, []]
      }

      const sharedModelNew = msg[1].value

      return [
        { ...model, sharedModel: sharedModelNew },
        playAudio(Sounds.navigationCancel),
        [],
      ]
    }

    case "GameOver": {
      return [
        {
          ...model,
          openedModal: "GameOver",
        },
        playAudio(Sounds.gameOver),
        [],
      ]
    }

    case "GameStarted": {
      return [model, playAudio(Sounds.gameStart), []]
    }

    case "CountDownElapsed_Done": {
      const sharedModel = msg[1]

      return [{ ...model, sharedModel }, Cmd.None, []]
    }

    case "CancelStartGame_Done": {
      const result = msg[1]

      if (result.type === "Err") {
        return [model, Cmd.None, []]
      }

      const sharedModel = result.value

      const username = profileStore.profiles[msg[2].userId]?.username

      const message = username
        ? `${username} cancelled the game`
        : "Game was cancelled"

      const action: OutAction = ["Snackbar", { variant: "Info", message }]

      return [{ ...model, sharedModel }, Cmd.None, [action]]
    }

    case "ClockTicked": {
      const sharedModel = msg[1]

      return [{ ...model, sharedModel }, Cmd.None, []]
    }

    case 'PlayerLeft': {
      return [{ ...model, sharedModel: msg[1] }, Cmd.None, [['Snackbar', { message: "Player left the room", variant: "Info" }]]]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

const playAudio = (src: string): Cmd<Msg> => {
  return Audio.play(src, t("Audio_Done"))
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
  currentUserId,
  store,
  model,
  dispatch,
  roomComponent,
  goHome,
  onClose,
}: {
  store: ProfileStore.Model
  currentUserId: UserId
  model: Model
  dispatch: (msg: Msg) => void
  roomComponent: UI.ViewNode
  goHome: () => void
  onClose: () => void
}) => {
  const homeButton = (
    <UI.IconButton
      onClick={goHome}
      sx={{ marginLeft: -1 }}
    >
      <UI.Icons.Home />
    </UI.IconButton>
  )

  if (model.sharedModel.type === "Setup") {
    const startGameResult = startGame(
      { userId: currentUserId },
      model.sharedModel,
    )
    const inputClockResult = inputClock(
      { userId: currentUserId, clockPreset: model.sharedModel.clockPreset },
      model.sharedModel,
    )

    return (
      <UI.FillBox>
        <UI.Header
          left={homeButton}
          title="Chess"
          right={roomComponent}
        />

        <UI.Box sx={{ flex: 1, overflowY: "scroll" }}>
          <VersusHeader
            store={store}
            black={model.sharedModel.b !== 'None' ? { type: "User", userId: model.sharedModel.b } : { type: "None" }}
            white={model.sharedModel.w !== 'None' ? { type: "User", userId: model.sharedModel.w } : { type: "None" }}
          />

          <UI.Typography
            sx={{ paddingX: 2, paddingTop: 1 }}
            color="text.secondary"
          >
            Players
          </UI.Typography>

          <UI.Box sx={{ display: "flex", alignItems: "center", paddingRight: 2, width: "100%", marginBottom: 1 }}>
            <PawnIcon sx={{ width: 60, height: 60, color: "#fff" }} />

            {model.sharedModel.w === "None" ? (
              <UI.Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => {
                  dispatch([
                    "InputPlayer",
                    { userId: currentUserId, color: "w" },
                  ])
                }}
              >
                Play As {Board.colorToString("w")}
              </UI.Button>
            ) : (
              <ViewInputUserPlayerSlot
                color="w"
                userId={model.sharedModel.w}
                currentUserId={currentUserId}
                dispatch={dispatch}
                store={store}
              />
            )}
          </UI.Box>

          <UI.Box sx={{ display: "flex", alignItems: "center", paddingRight: 2, width: "100%" }}>
            <PawnIcon stroke="#787878" sx={{ width: 60, height: 60, color: "#000" }} />
            {model.sharedModel.b === "None" ? (
              <UI.Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => {
                  dispatch([
                    "InputPlayer",
                    { userId: currentUserId, color: "b" },
                  ])
                }}
              >
                Play As {Board.colorToString("b")}
              </UI.Button>

            ) : (
              <ViewInputUserPlayerSlot
                color="b"
                userId={model.sharedModel.b}
                currentUserId={currentUserId}
                dispatch={dispatch}
                store={store}
              />
            )}
          </UI.Box>

          <UI.Divider sx={{ marginY: 2 }} />

          <UI.Typography
            sx={{ paddingX: 2, marginTop: 2, marginBottom: 1 }}
            color={"text.secondary"}
          >
            Clock
          </UI.Typography>

          <UI.Box sx={{ paddingX: 2 }}>
            <UI.Tooltip
              title={
                inputClockResult.type === "Err"
                  ? inputClockProblemToString(inputClockResult.error)
                  : ""
              }
            >
              <UI.ToggleButtonGroup
                disabled={inputClockResult.type === "Err"}
                fullWidth
                value={model.sharedModel.clockPreset}
              >
                {Object.values(Clock.presets).map((clockPreset) => (
                  <UI.ToggleButton
                    key={clockPreset}
                    value={clockPreset}
                    onClick={() =>
                      dispatch([
                        "InputClock",
                        { clockPreset, userId: currentUserId },
                      ])
                    }
                  >
                    {Clock.presetToString(clockPreset)}
                  </UI.ToggleButton>
                ))}
              </UI.ToggleButtonGroup>
            </UI.Tooltip>
          </UI.Box>
        </UI.Box>

        <UI.Box sx={{ padding: 2, display: "flex", gap: 2 }}>
          <UI.Button
            fullWidth
            variant="outlined"
            onClick={onClose}
          >
            Back
          </UI.Button>

          <UI.Button
            disabled={startGameResult.type === "Err"}
            fullWidth
            variant="contained"
            onClick={() => {
              dispatch(["StartGame", { userId: currentUserId }])
            }}
          >
            Start Game
          </UI.Button>
        </UI.Box>
      </UI.FillBox >
    )
  }

  if (model.sharedModel.type === "Starting") {
    const { w, b } = model.sharedModel
    const cancelStatGameResult = cancelStartGame(
      { userId: currentUserId },
      model.sharedModel,
    )
    return (
      <UI.FillBox>
        <UI.Header
          left={homeButton}
          title="Chess"
          right={roomComponent}
        />
        <UI.Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UI.Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <UI.Avatar
              src={store.profiles[w]?.avatarUrl}
              sx={{ width: 80, height: 80, marginBottom: 1 }}
            />
            <UI.Typography variant="h6">
              {store.profiles[w]?.username ?? "..."}
            </UI.Typography>
          </UI.Box>
          <UI.Typography
            color="text.secondary"
            sx={{
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            VS
          </UI.Typography>
          <UI.Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <UI.Avatar
              src={store.profiles[b]?.avatarUrl}
              sx={{ width: 80, height: 80, marginBottom: 1 }}
            />
            <UI.Typography variant="h6">
              {store.profiles[b]?.username ?? "..."}
            </UI.Typography>
          </UI.Box>
        </UI.Box>

        <UI.Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UI.Typography
            sx={{ marginBottom: -3 }}
            color="text.secondary"
            align="center"
          >
            Starting in
          </UI.Typography>
          <UI.Typography
            sx={{ fontSize: "6rem" }}
            align="center"
          >
            {model.sharedModel.countDown}
          </UI.Typography>
        </UI.Box>

        <UI.Box sx={{ flex: 1 }}></UI.Box>
        {cancelStatGameResult.type === "Ok" && (
          <UI.Box sx={{ width: "100%", padding: 2 }}>
            <UI.Button
              fullWidth
              variant="outlined"
              onClick={() =>
                dispatch(["CancelStartGame", { userId: currentUserId }])
              }
            >
              Cancel
            </UI.Button>
          </UI.Box>
        )}
      </UI.FillBox>
    )
  }

  const { w, b, board, clock } = model.sharedModel

  const currentUserColor: Board.Color | "None" | "Both" =
    currentUserId === w && currentUserId === b
      ? "Both"
      : currentUserId === w
        ? "w"
        : currentUserId === b
          ? "b"
          : "None"

  const boardOrientation: Board.Color = p(
    currentUserColor === "None" || currentUserColor === "Both"
      ? "w"
      : currentUserColor,
    (color) => (model.isFlipped ? Board.toOppositeColor(color) : color),
  )

  const turn = Board.toTurn(board)

  const whiteSlot: ViewUserPlayerSlotProps = {
    src: store.profiles[w]?.avatarUrl,
    username: store.profiles[w]?.username ?? "...",
    isActive: turn === "w" && model.sharedModel.type === "Game",
    seconds: Clock.toTime("w", clock),
  }

  const blackSlot: ViewUserPlayerSlotProps = {
    src: store.profiles[b]?.avatarUrl,
    username: store.profiles[b]?.username ?? "...",
    isActive: turn === "b" && model.sharedModel.type === "Game",
    seconds: Clock.toTime("b", clock),
  }

  const topSlot = boardOrientation === "w" ? blackSlot : whiteSlot

  const bottomSlot = boardOrientation === "w" ? whiteSlot : blackSlot

  return (
    <UI.FillBox sx={{ overflowY: "scroll" }}>
      <UI.Header
        left={homeButton}
        title={toGameText(model.sharedModel)}
        right={roomComponent}
      />

      <ViewUserPlayerSlot
        position="top"
        {...topSlot}
      />

      <Board.View
        model={board}
        boardOrientation={boardOrientation}
        isDraggablePiece={({ piece }) => {
          return (
            Board.toColor(piece) === currentUserColor ||
            currentUserColor === "Both"
          )
        }}
        onPieceDrop={(moveInput) => {
          const msg: InputMove = [
            "InputMove",
            {
              userId: currentUserId,
              ...moveInput,
            },
          ]

          dispatch(msg)

          const isSuccessfulMove =
            inputMove(msg[1], model.sharedModel).type === "Ok"

          return isSuccessfulMove
        }}
      />

      <ViewUserPlayerSlot
        position="bottom"
        {...bottomSlot}
      />

      <UI.Box sx={{ flex: 1 }} />

      <ViewGameOverDialog
        model={model}
        dispatch={dispatch}
      />

      <UI.Box sx={{ width: "100%", display: "flex" }}>
        {model.sharedModel.type === "GameOver" && currentUserColor !== "None" && (
          <UI.Box sx={{ padding: 2, width: "100%" }}>
            <UI.Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => dispatch(["NewGame"])}
              disabled={!(currentUserColor === "w" || currentUserColor === "b")}
            >
              New Game
            </UI.Button>
          </UI.Box>
        )}

        {model.sharedModel.type === "Game" && (
          <>
            {(currentUserColor === "w" || currentUserColor === "b") && (
              <>
                <UI.ActionButton
                  icon={<UI.Icons.HandshakeTwoTone />}
                  label="Draw"
                  onClick={() => dispatch(["OpenedModal", "RequestToDraw"])}
                />

                <UI.ConformationDialog
                  headerIcon={
                    <UI.Icons.HandshakeTwoTone
                      style={{ width: 48, height: 48 }}
                    />
                  }
                  onCancel={() => dispatch(["ClosedModal"])}
                  onClose={() => dispatch(["ClosedModal"])}
                  onConfirm={() =>
                    dispatch(["RequestToDraw", currentUserColor])
                  }
                  open={model.openedModal === "RequestToDraw"}
                  title="Ask for a draw?"
                  confirmTitle="Ask"
                />

                <UI.Dialog
                  open={
                    model.sharedModel.type === "Game" &&
                    model.sharedModel.drawAgreement.type === "Asking" &&
                    model.sharedModel.drawAgreement.asker === currentUserColor
                  }
                >
                  <UI.DialogContent>
                    <UI.Box sx={{ display: "flex", alignItems: "center" }}>
                      <UI.CircularProgress sx={{ marginRight: 2 }} />
                      <UI.Typography variant="h6">
                        Waiting on response...
                      </UI.Typography>
                    </UI.Box>
                  </UI.DialogContent>
                  <UI.DialogActions>
                    <UI.Button
                      onClick={() =>
                        dispatch(["CancelDraw", { userId: currentUserId }])
                      }
                    >
                      Cancel
                    </UI.Button>
                  </UI.DialogActions>
                </UI.Dialog>

                <UI.ConformationDialog
                  open={
                    model.sharedModel.type === "Game" &&
                    model.sharedModel.drawAgreement.type === "Asking" &&
                    model.sharedModel.drawAgreement.asker ===
                    Board.toOppositeColor(currentUserColor)
                  }
                  headerIcon={
                    <UI.Icons.HandshakeTwoTone
                      style={{ width: 48, height: 48 }}
                    />
                  }
                  onClose={() => dispatch(["RespondToDraw", "Declined"])}
                  onCancel={() => dispatch(["RespondToDraw", "Declined"])}
                  onConfirm={() => dispatch(["RespondToDraw", "Accepted"])}
                  title="Agree to a draw?"
                  confirmTitle="Accept"
                  cancelTitle="Decline"
                />

                <UI.ActionButton
                  icon={<UI.Icons.FlagOutlined />}
                  label="Resign"
                  onClick={() => dispatch(["OpenedModal", "Resign"])}
                />

                <UI.ConformationDialog
                  headerIcon={
                    <UI.Icons.FlagOutlined style={{ width: 48, height: 48 }} />
                  }
                  onCancel={() => dispatch(["ClosedModal"])}
                  onClose={() => dispatch(["ClosedModal"])}
                  onConfirm={() => dispatch(["Resign", currentUserColor])}
                  open={model.openedModal === "Resign"}
                  title="Resign from game?"
                  confirmTitle="Resign"
                />
              </>
            )}

            <UI.ActionButton
              icon={
                <UI.Icons.Flip
                  sx={{
                    transform: model.isFlipped
                      ? "rotate(90deg)"
                      : "rotate(270deg)",
                  }}
                />
              }
              label={model.isFlipped ? "Unflip" : "Flip"}
              onClick={() => {
                dispatch(["ClickedFlip"])
              }}
            />
          </>
        )}
      </UI.Box>
    </UI.FillBox>
  )
}

const ViewGameOverDialog = ({
  model,
  dispatch,
}: {
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  if (model.sharedModel.type === "Setup") {
    return <></>
  }

  if (model.sharedModel.type === "Game") {
    return <></>
  }

  return (
    <UI.Dialog
      open={model.openedModal === "GameOver"}
      onClose={() => dispatch(["ClosedModal"])}
    >
      <UI.DialogTitle>{toGameText(model.sharedModel)}</UI.DialogTitle>
      <UI.DialogActions>
        <UI.Button onClick={() => dispatch(["ClosedModal"])}>Close</UI.Button>
      </UI.DialogActions>
    </UI.Dialog>
  )
}

const ViewInputUserPlayerSlot = ({
  dispatch,
  store,
  userId,
  currentUserId,
  color,
}: {
  dispatch: (msg: Msg) => void
  store: ProfileStore.Model
  userId: UserId
  currentUserId: UserId
  color: Board.Color
}) => {
  return (

    <UI.Box sx={{ width: "100%", flex: 1, overflow: "hidden", display: "flex", alignItems: "center", }}>
      <UI.Avatar
        sx={{ marginRight: 1 }}
        src={store.profiles[userId]?.avatarUrl}
      />

      <UI.Typography
        sx={{ flex: 1 }}
        noWrap
      >
        {store.profiles[userId]?.username ?? "..."}
      </UI.Typography>

      {userId === currentUserId && (
        <UI.Button
          size="large"
          onClick={() =>
            dispatch(["InputPlayer", { userId: "None", color }])
          }
        >
          Stop Playing
        </UI.Button>
      )}
    </UI.Box>

  )
}


const toGameText = (model: SharedModel): string => {
  switch (model.type) {
    case "GameOver": {
      switch (model.gameOver.type) {
        case "Checkmate": {
          const colorStr = Board.colorToString(model.gameOver.winner)
          return `${colorStr} won by checkmate`
        }

        case "DrawByAgreement": {
          return "Drawn by agreement"
        }

        case "Resignation": {
          return `${Board.colorToString(model.gameOver.resigner)} resigned`
        }

        case "Stalemate": {
          return "Stalemate"
        }

        case "WinOnTime": {
          return `${Board.colorToString(model.gameOver.winner)} won on time`
        }

        default:
          return exhaustive(model.gameOver)
      }
    }

    case "Setup": {
      return "Setting up game"
    }

    case "Starting": {
      return "Game is about to start"
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

type ViewUserPlayerSlotProps = {
  src?: string
  username: string
  isActive: boolean
  seconds: Clock.Seconds
}

const ViewUserPlayerSlot = ({
  position,
  src,
  username,
  isActive,
  seconds,
}: ViewUserPlayerSlotProps & { position: "top" | "bottom" }) => {
  const theme = UI.useTheme()
  return (
    <UI.Box
      sx={{
        paddingX: 2,
        paddingTop: position === "bottom" ? 1 : 2,
        paddingBottom: position === "top" ? 1 : 2,
        display: "flex",
        alignItems: "center",
      }}
    >
      <UI.Avatar
        src={src}
        sx={{
          // width: 32,
          // height: 32,
          marginRight: 1,
        }}
      />
      <UI.Typography variant="body1">{username}</UI.Typography>

      <UI.Box sx={{ flex: 1 }} />

      <UI.Typography
        color={
          isActive ? theme.palette.text.primary : theme.palette.action.disabled
        }
        variant="h4"
        component="div"
      >
        {Clock.formatSeconds(seconds)}
      </UI.Typography>
    </UI.Box>
  )
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
