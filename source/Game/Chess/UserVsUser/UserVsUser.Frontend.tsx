import { Audio, Cmd, exhaustive, Option, p, Sub, t } from "../../../Core"
import { UserId } from "../../../Data"
import * as ProfileStore from "../../../Profile/Profile.Store"
import * as Snackbar from "../../../Alerts"
import * as UI from "../../../UI"
import { Ctx } from "../../Game.Shared"
import * as Board from "../Board"
import * as Clock from "../Clock"
import * as Sounds from "../Sounds"
import { PawnIcon, VersusHeader } from "../Views"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  initShared,
  inputClock,
  inputClockProblemToString,
  inputMove,
  InputMove,
  SharedModel,
  startGame,
  ToBackend,
  ToFrontend,
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
  sendToBackend: (msg: ToBackend) => Cmd
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
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
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
  }: {
    currentUserId: UserId
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
        "Alerts",
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
        "Alerts",
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

    case "ClockTicked": {
      const sharedModel = msg[1]

      return [{ ...model, sharedModel }, Cmd.None, []]
    }

    case "PlayerLeft": {
      return [{ ...model, sharedModel: msg[1] }, Cmd.None, []]
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
  ctx,
  model,
  $d,
  onClose,
}: {
  ctx: Ctx
  model: Model
  $d: (msg: Msg) => void
  onClose: () => void
}) => {
  if (model.sharedModel.type === "Setup") {
    const startGameResult = startGame(
      { userId: ctx.currentUserId },
      model.sharedModel,
    )
    const inputClockResult = inputClock(
      { userId: ctx.currentUserId, clockPreset: model.sharedModel.clockPreset },
      model.sharedModel,
    )

    return (
      <UI.FillBox>
        <UI.Box sx={{ flex: 1, overflowY: "scroll" }}>
          <VersusHeader
            ctx={ctx}
            black={
              model.sharedModel.b !== "None"
                ? { type: "User", userId: model.sharedModel.b }
                : { type: "None" }
            }
            white={
              model.sharedModel.w !== "None"
                ? { type: "User", userId: model.sharedModel.w }
                : { type: "None" }
            }
          />

          <UI.Typography
            sx={{ paddingX: 2, paddingTop: 1 }}
            color="text.secondary"
          >
            Players
          </UI.Typography>

          <UI.Box
            sx={{
              display: "flex",
              alignItems: "center",
              paddingRight: 2,
              width: "100%",
              marginBottom: 1,
            }}
          >
            <PawnIcon sx={{ width: 60, height: 60, color: "#fff" }} />

            {model.sharedModel.w === "None" ? (
              <UI.Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() =>
                  $d(["InputPlayer", { userId: ctx.currentUserId, color: "w" }])
                }
              >
                Play As {Board.colorToString("w")}
              </UI.Button>
            ) : (
              <ViewInputUserPlayerSlot
                color="w"
                userId={model.sharedModel.w}
                $d={$d}
                ctx={ctx}
              />
            )}
          </UI.Box>

          <UI.Box
            sx={{
              display: "flex",
              alignItems: "center",
              paddingRight: 2,
              width: "100%",
            }}
          >
            <PawnIcon
              stroke="#787878"
              sx={{ width: 60, height: 60, color: "#000" }}
            />
            {model.sharedModel.b === "None" ? (
              <UI.Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() =>
                  $d(["InputPlayer", { userId: ctx.currentUserId, color: "b" }])
                }
              >
                Play As {Board.colorToString("b")}
              </UI.Button>
            ) : (
              <ViewInputUserPlayerSlot
                color="b"
                userId={model.sharedModel.b}
                ctx={ctx}
                $d={$d}
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
                      $d([
                        "InputClock",
                        { clockPreset, userId: ctx.currentUserId },
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
              $d(["StartGame", { userId: ctx.currentUserId }])
            }}
          >
            Start Game
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    )
  }

  const { w, b, board, clock } = model.sharedModel

  const currentUserColor: Board.Color | "None" | "Both" =
    ctx.currentUserId === w && ctx.currentUserId === b
      ? "Both"
      : ctx.currentUserId === w
      ? "w"
      : ctx.currentUserId === b
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
    src: ctx.profiles[w]?.avatarUrl,
    username: ctx.profiles[w]?.username ?? "...",
    isActive: turn === "w" && model.sharedModel.type === "Game",
    seconds: Clock.toTime("w", clock),
  }

  const blackSlot: ViewUserPlayerSlotProps = {
    src: ctx.profiles[b]?.avatarUrl,
    username: ctx.profiles[b]?.username ?? "...",
    isActive: turn === "b" && model.sharedModel.type === "Game",
    seconds: Clock.toTime("b", clock),
  }

  const topSlot = boardOrientation === "w" ? blackSlot : whiteSlot

  const bottomSlot = boardOrientation === "w" ? whiteSlot : blackSlot

  return (
    <UI.FillBox sx={{ overflowY: "scroll" }}>
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
              userId: ctx.currentUserId,
              ...moveInput,
            },
          ]

          $d(msg)

          const isOkfulMove = inputMove(msg[1], model.sharedModel).type === "Ok"

          return isOkfulMove
        }}
      />

      <ViewUserPlayerSlot
        position="bottom"
        {...bottomSlot}
      />

      <UI.Box sx={{ flex: 1 }} />

      <ViewGameOverDialog
        model={model}
        $d={$d}
      />

      <UI.Box sx={{ width: "100%", display: "flex" }}>
        {model.sharedModel.type === "GameOver" && currentUserColor !== "None" && (
          <UI.Box sx={{ padding: 2, width: "100%" }}>
            <UI.Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => $d(["NewGame"])}
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
                  onClick={() => $d(["OpenedModal", "RequestToDraw"])}
                />

                <UI.ConformationDialog
                  headerIcon={
                    <UI.Icons.HandshakeTwoTone
                      style={{ width: 48, height: 48 }}
                    />
                  }
                  onCancel={() => $d(["ClosedModal"])}
                  onClose={() => $d(["ClosedModal"])}
                  onConfirm={() => $d(["RequestToDraw", currentUserColor])}
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
                        $d(["CancelDraw", { userId: ctx.currentUserId }])
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
                  onClose={() => $d(["RespondToDraw", "Declined"])}
                  onCancel={() => $d(["RespondToDraw", "Declined"])}
                  onConfirm={() => $d(["RespondToDraw", "Accepted"])}
                  title="Agree to a draw?"
                  confirmTitle="Accept"
                  cancelTitle="Decline"
                />

                <UI.ActionButton
                  icon={<UI.Icons.FlagOutlined />}
                  label="Resign"
                  onClick={() => $d(["OpenedModal", "Resign"])}
                />

                <UI.ConformationDialog
                  headerIcon={
                    <UI.Icons.FlagOutlined style={{ width: 48, height: 48 }} />
                  }
                  onCancel={() => $d(["ClosedModal"])}
                  onClose={() => $d(["ClosedModal"])}
                  onConfirm={() => $d(["Resign", currentUserColor])}
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
                $d(["ClickedFlip"])
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
  $d,
}: {
  model: Model
  $d: (msg: Msg) => void
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
      onClose={() => $d(["ClosedModal"])}
    >
      <UI.DialogTitle>{toGameText(model.sharedModel)}</UI.DialogTitle>
      <UI.DialogActions>
        <UI.Button onClick={() => $d(["ClosedModal"])}>Close</UI.Button>
      </UI.DialogActions>
    </UI.Dialog>
  )
}

const ViewInputUserPlayerSlot = ({
  $d,
  ctx,
  userId,
  color,
}: {
  $d: (msg: Msg) => void
  userId: UserId
  ctx: Ctx
  color: Board.Color
}) => {
  return (
    <UI.Box
      sx={{
        width: "100%",
        flex: 1,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      <UI.Avatar
        sx={{ marginRight: 1 }}
        src={ctx.profiles[userId]?.avatarUrl}
      />

      <UI.Typography
        sx={{ flex: 1 }}
        noWrap
      >
        {ctx.profiles[userId]?.username ?? "..."}
      </UI.Typography>

      {userId === ctx.currentUserId && (
        <UI.Button
          size="large"
          onClick={() => $d(["InputPlayer", { userId: "None", color }])}
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
