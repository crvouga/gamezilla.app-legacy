import { UserId } from "@gamezilla/shared/app";
import { RoomCtx, ViewCtx } from "@gamezilla/shared/client";
import {
  Audio,
  Cmd,
  Option,
  Sub,
  exhaustive,
  p,
  t,
} from "@gamezilla/shared/core";
import * as UI from "@gamezilla/shared/ui";
import * as Chess from "../chess/chess";
import * as Clock from "../chess/chess-clock";
import Sounds from "../chess/chess-sounds";
import { PawnIcon, VersusHeader } from "../chess/chess-views";
import {
  ClientModel,
  ClientMsg,
  InputMove,
  ServerModel,
  SharedModel,
  ToClient,
  ToServer,
  initShared,
  inputClock,
  inputClockProblemToString,
  inputMove,
  startGame,
} from "./vs-user.shared";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = ({
  userId,
}: {
  sendToServer: (msg: ToServer) => Cmd;
  userId: UserId | "none";
}): [ClientModel, Cmd<Msg>] => {
  return [
    {
      sharedModel: initShared({ userId }),
      openedMenuId: Option.None,
      openedModal: "none",
      isFlipped: false,
    },
    Cmd.None,
  ];
};

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = (
  { sendToServer }: { sendToServer: (msg: ToServer) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    //
    //
    // ClientMsg
    //
    //

    case "audio-done": {
      return [model, Cmd.None];
    }

    case "OpenedMenu": {
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None];
    }

    case "ClosedMenu": {
      return [{ ...model, openedMenuId: Option.None }, Cmd.None];
    }

    case "ClickedFlip": {
      return [{ ...model, isFlipped: !model.isFlipped }, Cmd.None];
    }

    case "OpenedModal": {
      return [{ ...model, openedModal: msg[1] }, Cmd.None];
    }

    case "ClosedModal": {
      return [{ ...model, openedModal: "none" }, Cmd.None];
    }

    //
    //
    //
    // ToServer
    //
    //
    //

    case "InputPlayer": {
      return [model, sendToServer(msg)];
    }

    case "start-game": {
      return [model, sendToServer(msg)];
    }

    case "InputClock": {
      return [model, sendToServer(msg)];
    }

    case "RequestToDraw": {
      return [model, sendToServer(msg)];
    }

    case "resign": {
      return [{ ...model, openedModal: "none" }, sendToServer(msg)];
    }

    case "RespondToDraw": {
      return [model, sendToServer(msg)];
    }

    case "NewGame": {
      return [model, sendToServer(msg)];
    }

    case "input-move": {
      const result = inputMove(msg[1], model.sharedModel);

      if (result.t === "err") {
        return [model, Cmd.None];
      }

      return [{ ...model, sharedModel: result.value }, sendToServer(msg)];
    }

    case "CancelDraw": {
      return [model, sendToServer(msg)];
    }

    default:
      return exhaustive(msg[0]);
  }
};

export const updateFromServer = (
  { ctx }: { ctx: RoomCtx },
  msg: ToClient,
  _model: Model
): [Model, Cmd<Msg>] => {
  const model: Model = { ..._model, openedMenuId: Option.None };

  switch (msg[0]) {
    case "InputClock_Done": {
      if (msg[1].t === "err") {
        return [model, Cmd.None];
      }
      return [{ ...model, sharedModel: msg[1].value }, Cmd.None];
    }

    case "input-move-done": {
      if (msg[1].t === "err") {
        return [model, Cmd.None];
      }

      const sharedModelNew = msg[1].value;

      if (sharedModelNew.type !== "game") {
        return [model, Cmd.None];
      }

      const soundCmd = Chess.inCheck(sharedModelNew.board)
        ? playAudio(Sounds.check)
        : sharedModelNew.didCapture
        ? playAudio(Sounds.capture)
        : playAudio(Sounds.move);

      return [{ ...model, sharedModel: sharedModelNew }, soundCmd];
    }

    case "InputPlayer_Done": {
      if (msg[1].t === "err") {
        return [model, Cmd.None];
      }

      const sharedModel = msg[1].value;

      return [{ ...model, sharedModel }, Cmd.None];
    }

    case "StartGame_Done": {
      if (msg[1].t === "err") {
        return [model, Cmd.None];
      }

      const sharedModel = msg[1].value;

      return [{ ...model, sharedModel }, Cmd.None];
    }

    //
    //
    // Draw
    //
    //

    case "RequestToDraw_Done": {
      switch (msg[1].t) {
        case "err": {
          return [model, Cmd.None];
        }

        case "ok": {
          return [
            { ...model, openedModal: "AskedToDraw" },
            playAudio(Sounds.uiUnlock),
          ];
        }

        default: {
          return [model, Cmd.None];
        }
      }
    }

    case "RespondToDraw_Done": {
      if (msg[1].t === "err") {
        return [model, Cmd.None];
      }

      const sharedModel = msg[1].value;

      if (sharedModel.type === "game-over") {
        return [{ ...model, sharedModel }, Cmd.None];
      }

      const isNotPlaying =
        sharedModel.type === "game" &&
        sharedModel.w !== ctx.currentUserId &&
        sharedModel.b !== ctx.currentUserId;

      if (isNotPlaying) {
        return [{ ...model, sharedModel }, Cmd.None];
      }

      return [{ ...model, sharedModel }, Cmd.None];
    }

    case "CancelDraw_Done": {
      const result = msg[1];

      if (result.t === "err") {
        return [model, Cmd.None];
      }

      const sharedModel = result.value;

      const isNotPlaying =
        sharedModel.type === "game" &&
        sharedModel.w !== ctx.currentUserId &&
        sharedModel.b !== ctx.currentUserId;

      if (isNotPlaying) {
        return [{ ...model, sharedModel }, Cmd.None];
      }

      return [{ ...model, sharedModel }, Cmd.None];
    }

    //
    //
    //
    //
    //

    case "resign_Done": {
      if (msg[1].t === "err") {
        return [model, Cmd.None];
      }

      const sharedModelNew = msg[1].value;

      if (sharedModelNew.type === "setup") {
        return [model, Cmd.None];
      }

      return [{ ...model, sharedModel: sharedModelNew }, Cmd.None];
    }

    case "NewGame_Done": {
      if (msg[1].t === "err") {
        return [model, Cmd.None];
      }

      const sharedModelNew = msg[1].value;

      return [
        { ...model, sharedModel: sharedModelNew },
        playAudio(Sounds.navigationCancel),
      ];
    }

    case "game-over": {
      return [
        {
          ...model,
          openedModal: "game-over",
        },
        playAudio(Sounds.gameOver),
      ];
    }

    case "GameStarted": {
      return [model, playAudio(Sounds.gameStart)];
    }

    case "ClockTicked": {
      const sharedModel = msg[1];

      return [{ ...model, sharedModel }, Cmd.None];
    }

    case "player-left": {
      return [{ ...model, sharedModel: msg[1] }, Cmd.None];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

const playAudio = (src: string): Cmd<Msg> => {
  return Audio.play(src, t("audio-done"));
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};

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
  $send,
  onClose,
}: {
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
  onClose: () => void;
}) => {
  if (model.sharedModel.type === "setup") {
    const startGameResult = startGame(
      { userId: ctx.currentUserId },
      model.sharedModel
    );
    const inputClockResult = inputClock(
      { userId: ctx.currentUserId, clockPreset: model.sharedModel.clockPreset },
      model.sharedModel
    );

    return (
      <UI.FillBox>
        <UI.Box sx={{ flex: 1, overflowY: "scroll" }}>
          <VersusHeader
            ctx={ctx}
            black={
              model.sharedModel.b !== "none"
                ? { type: "User", userId: model.sharedModel.b }
                : { type: "none" }
            }
            white={
              model.sharedModel.w !== "none"
                ? { type: "User", userId: model.sharedModel.w }
                : { type: "none" }
            }
          />

          <UI.Typography
            sx={{ paddingX: 2, paddingTop: 1 }}
            color="text.secondary">
            Players
          </UI.Typography>

          <UI.Box
            sx={{
              display: "flex",
              alignItems: "center",
              paddingRight: 2,
              width: "100%",
              marginBottom: 1,
            }}>
            <PawnIcon sx={{ width: 60, height: 60, color: "#fff" }} />

            {model.sharedModel.w === "none" ? (
              <UI.Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() =>
                  $send([
                    "InputPlayer",
                    { userId: ctx.currentUserId, color: "w" },
                  ])
                }>
                Play As {Chess.colorToString("w")}
              </UI.Button>
            ) : (
              <ViewInputUserPlayerSlot
                color="w"
                userId={model.sharedModel.w}
                $send={$send}
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
            }}>
            <PawnIcon
              stroke="#787878"
              sx={{ width: 60, height: 60, color: "#000" }}
            />
            {model.sharedModel.b === "none" ? (
              <UI.Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() =>
                  $send([
                    "InputPlayer",
                    { userId: ctx.currentUserId, color: "b" },
                  ])
                }>
                Play As {Chess.colorToString("b")}
              </UI.Button>
            ) : (
              <ViewInputUserPlayerSlot
                color="b"
                userId={model.sharedModel.b}
                ctx={ctx}
                $send={$send}
              />
            )}
          </UI.Box>

          <UI.Typography
            sx={{ paddingX: 2, marginTop: 2, marginBottom: 1 }}
            color={"text.secondary"}>
            Clock
          </UI.Typography>

          <UI.Box sx={{ paddingX: 2 }}>
            <UI.Tooltip
              title={
                inputClockResult.t === "err"
                  ? inputClockProblemToString(inputClockResult.error)
                  : ""
              }>
              <UI.ToggleButtonGroup
                disabled={inputClockResult.t === "err"}
                fullWidth
                value={model.sharedModel.clockPreset}>
                {Object.values(Clock.presets).map((clockPreset) => (
                  <UI.ToggleButton
                    key={clockPreset}
                    value={clockPreset}
                    onClick={() =>
                      $send([
                        "InputClock",
                        { clockPreset, userId: ctx.currentUserId },
                      ])
                    }>
                    {Clock.presetToString(clockPreset)}
                  </UI.ToggleButton>
                ))}
              </UI.ToggleButtonGroup>
            </UI.Tooltip>
          </UI.Box>
        </UI.Box>

        <UI.Box sx={{ padding: 2, display: "flex", gap: 2 }}>
          <UI.Button fullWidth variant="outlined" onClick={onClose}>
            Back
          </UI.Button>

          <UI.Button
            disabled={startGameResult.t === "err"}
            fullWidth
            variant="contained"
            onClick={() => {
              $send(["start-game", { userId: ctx.currentUserId }]);
            }}>
            Start Game
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    );
  }

  const { w, b, board, clock } = model.sharedModel;

  const currentUserColor: Chess.Color | "none" | "Both" =
    ctx.currentUserId === w && ctx.currentUserId === b
      ? "Both"
      : ctx.currentUserId === w
      ? "w"
      : ctx.currentUserId === b
      ? "b"
      : "none";

  const boardOrientation: Chess.Color = p(
    currentUserColor === "none" || currentUserColor === "Both"
      ? "w"
      : currentUserColor,
    (color) => (model.isFlipped ? Chess.toOppositeColor(color) : color)
  );

  const turn = Chess.toTurn(board);

  const whiteSlot: ViewUserPlayerSlotProps = {
    src: ctx.profiles[w]?.avatarUrl,
    username: ctx.profiles[w]?.username ?? "...",
    isActive: turn === "w" && model.sharedModel.type === "game",
    seconds: Clock.toTime("w", clock),
  };

  const blackSlot: ViewUserPlayerSlotProps = {
    src: ctx.profiles[b]?.avatarUrl,
    username: ctx.profiles[b]?.username ?? "...",
    isActive: turn === "b" && model.sharedModel.type === "game",
    seconds: Clock.toTime("b", clock),
  };

  const topSlot = boardOrientation === "w" ? blackSlot : whiteSlot;

  const bottomSlot = boardOrientation === "w" ? whiteSlot : blackSlot;

  return (
    <UI.FillBox sx={{ overflowY: "scroll" }}>
      <ViewUserPlayerSlot position="top" {...topSlot} />

      <Chess.View
        model={board}
        boardOrientation={boardOrientation}
        isDraggablePiece={({ piece }) => {
          return (
            Chess.toColor(piece) === currentUserColor ||
            currentUserColor === "Both"
          );
        }}
        onPieceDrop={(moveInput) => {
          const msg: InputMove = [
            "input-move",
            {
              userId: ctx.currentUserId,
              ...moveInput,
            },
          ];

          $send(msg);

          const inputted = inputMove(msg[1], model.sharedModel);

          return inputted.t === "ok";
        }}
      />

      <ViewUserPlayerSlot position="bottom" {...bottomSlot} />

      <UI.Box sx={{ flex: 1 }} />

      <ViewGameOverDialog model={model} $send={$send} />

      <UI.Box sx={{ width: "100%", display: "flex" }}>
        {model.sharedModel.type === "game-over" &&
          currentUserColor !== "none" && (
            <UI.Box sx={{ padding: 2, width: "100%" }}>
              <UI.Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => $send(["NewGame"])}
                disabled={
                  !(currentUserColor === "w" || currentUserColor === "b")
                }>
                New Game
              </UI.Button>
            </UI.Box>
          )}

        {model.sharedModel.type === "game" && (
          <>
            {(currentUserColor === "w" || currentUserColor === "b") && (
              <>
                <UI.ActionButton
                  icon={<UI.Icons.HandshakeTwoTone />}
                  label="Draw"
                  onClick={() => $send(["OpenedModal", "RequestToDraw"])}
                />

                <UI.ConformationDialog
                  headerIcon={
                    <UI.Icons.HandshakeTwoTone
                      style={{ width: 48, height: 48 }}
                    />
                  }
                  onCancel={() => $send(["ClosedModal"])}
                  onClose={() => $send(["ClosedModal"])}
                  onConfirm={() => $send(["RequestToDraw", currentUserColor])}
                  open={model.openedModal === "RequestToDraw"}
                  title="Ask for a draw?"
                  confirmTitle="Ask"
                />

                <UI.Dialog
                  open={
                    model.sharedModel.type === "game" &&
                    model.sharedModel.drawAgreement.type === "Asking" &&
                    model.sharedModel.drawAgreement.asker === currentUserColor
                  }>
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
                        $send(["CancelDraw", { userId: ctx.currentUserId }])
                      }>
                      Cancel
                    </UI.Button>
                  </UI.DialogActions>
                </UI.Dialog>

                <UI.ConformationDialog
                  open={
                    model.sharedModel.type === "game" &&
                    model.sharedModel.drawAgreement.type === "Asking" &&
                    model.sharedModel.drawAgreement.asker ===
                      Chess.toOppositeColor(currentUserColor)
                  }
                  headerIcon={
                    <UI.Icons.HandshakeTwoTone
                      style={{ width: 48, height: 48 }}
                    />
                  }
                  onClose={() => $send(["RespondToDraw", "Declined"])}
                  onCancel={() => $send(["RespondToDraw", "Declined"])}
                  onConfirm={() => $send(["RespondToDraw", "Accepted"])}
                  title="Agree to a draw?"
                  confirmTitle="Accept"
                  cancelTitle="Decline"
                />

                <UI.ActionButton
                  icon={<UI.Icons.FlagOutlined />}
                  label="Resign"
                  onClick={() => $send(["OpenedModal", "resign"])}
                />

                <UI.ConformationDialog
                  headerIcon={
                    <UI.Icons.FlagOutlined style={{ width: 48, height: 48 }} />
                  }
                  onCancel={() => $send(["ClosedModal"])}
                  onClose={() => $send(["ClosedModal"])}
                  onConfirm={() => $send(["resign", currentUserColor])}
                  open={model.openedModal === "resign"}
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
                $send(["ClickedFlip"]);
              }}
            />
          </>
        )}
      </UI.Box>
    </UI.FillBox>
  );
};

const ViewGameOverDialog = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  if (model.sharedModel.type === "setup") {
    return <span></span>;
  }

  if (model.sharedModel.type === "game") {
    return <span></span>;
  }

  return (
    <UI.Dialog
      open={model.openedModal === "game-over"}
      onClose={() => $send(["ClosedModal"])}>
      <UI.DialogTitle>{toGameText(model.sharedModel)}</UI.DialogTitle>
      <UI.DialogActions>
        <UI.Button onClick={() => $send(["ClosedModal"])}>Close</UI.Button>
      </UI.DialogActions>
    </UI.Dialog>
  );
};

const ViewInputUserPlayerSlot = ({
  $send,
  ctx,
  userId,
  color,
}: {
  $send: (msg: Msg) => void;
  userId: UserId;
  ctx: ViewCtx;
  color: Chess.Color;
}) => {
  return (
    <UI.Box
      sx={{
        width: "100%",
        flex: 1,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}>
      <UI.Avatar
        sx={{ marginRight: 1 }}
        src={ctx.profiles[userId]?.avatarUrl}
      />

      <UI.Typography sx={{ flex: 1 }} noWrap>
        {ctx.profiles[userId]?.username ?? "..."}
      </UI.Typography>

      {userId === ctx.currentUserId && (
        <UI.Button
          size="large"
          onClick={() => $send(["InputPlayer", { userId: "none", color }])}>
          Stop Playing
        </UI.Button>
      )}
    </UI.Box>
  );
};

const toGameText = (model: SharedModel): string => {
  switch (model.type) {
    case "game-over": {
      switch (model.gameOver.type) {
        case "Checkmate": {
          const colorStr = Chess.colorToString(model.gameOver.winner);
          return `${colorStr} won by checkmate`;
        }

        case "DrawByAgreement": {
          return "Drawn by agreement";
        }

        case "resignation": {
          return `${Chess.colorToString(model.gameOver.resigner)} resigned`;
        }

        case "Stalemate": {
          return "Stalemate";
        }

        case "WinOnTime": {
          return `${Chess.colorToString(model.gameOver.winner)} won on time`;
        }

        default:
          return exhaustive(model.gameOver);
      }
    }

    case "setup": {
      return "Setting up game";
    }

    case "game": {
      if (Chess.inCheck(model.board)) {
        return `${Chess.colorToString(Chess.toTurn(model.board))} is in check`;
      }

      return `${Chess.colorToString(Chess.toTurn(model.board))}'s turn`;
    }

    default:
      return exhaustive(model);
  }
};

type ViewUserPlayerSlotProps = {
  src?: string;
  username: string;
  isActive: boolean;
  seconds: Clock.Seconds;
};

const ViewUserPlayerSlot = ({
  position,
  src,
  username,
  isActive,
  seconds,
}: ViewUserPlayerSlotProps & { position: "top" | "bottom" }) => {
  const theme = UI.useTheme();
  return (
    <UI.Box
      sx={{
        paddingX: 2,
        paddingTop: position === "bottom" ? 1 : 2,
        paddingBottom: position === "top" ? 1 : 2,
        display: "flex",
        alignItems: "center",
      }}>
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
        component="div">
        {Clock.formatSeconds(seconds)}
      </UI.Typography>
    </UI.Box>
  );
};

//
//
//
//
//
//
//

export const syncWithServer = (
  clientModel: ClientModel,
  serverModel: ServerModel
): ClientModel => {
  return {
    isFlipped: clientModel.isFlipped,
    openedMenuId: clientModel.openedMenuId,
    openedModal: clientModel.openedModal,
    sharedModel: serverModel,
  };
};
