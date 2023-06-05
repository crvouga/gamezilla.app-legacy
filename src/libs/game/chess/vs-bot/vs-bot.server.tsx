import { ViewCtx, ViewVsBotSetupScreen } from "@gamezilla/shared/client";
import { Audio, Cmd, Option, Sub, exhaustive, t } from "@gamezilla/shared/core";
import * as UI from "@gamezilla/shared/ui";
import * as Chess from "../chess/chess";
import { ViewCoverArt } from "../chess/chess";
import Sounds from "../chess/chess-sounds";
import { PawnIcon } from "../chess/chess-views";
import {
  ClientModel,
  ClientMsg,
  Res,
  ServerModel,
  SharedModel,
  ToClient,
  ToServer,
  initShared,
  inputMove,
  isBotTurn,
} from "./vs-bot.shared";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = (): [ClientModel, Cmd<Msg>] => {
  return [
    {
      sharedModel: initShared,
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
  _model: Model
): [Model, Cmd<Msg>] => {
  const model: Model = { ..._model, openedMenuId: Option.None };
  switch (msg[0]) {
    //
    //
    // Client Only
    //
    //

    case "audio-done": {
      return [model, Cmd.None];
    }

    case "ClosedModal": {
      return [{ ...model, openedModal: "none" }, Cmd.None];
    }

    case "ClickedFlip": {
      return [{ ...model, isFlipped: !model.isFlipped }, Cmd.None];
    }

    case "OpenedMenu": {
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None];
    }

    case "ClosedMenu": {
      return [{ ...model, openedMenuId: Option.None }, Cmd.None];
    }

    //
    //
    // Client and Server
    //
    //

    case "InputUser": {
      return [model, sendToServer(msg)];
    }

    case "InputColor": {
      return [model, sendToServer(msg)];
    }

    case "InputBot": {
      return [model, sendToServer(msg)];
    }

    case "start-game": {
      return [model, sendToServer(msg)];
    }

    case "stop-game": {
      return [model, sendToServer(msg)];
    }

    case "input-move": {
      const result = inputMove(msg[1], model.sharedModel);

      const sharedModel = result.t === "err" ? model.sharedModel : result.value;

      return [{ ...model, sharedModel: sharedModel }, sendToServer(msg)];
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const updateFromServer = (
  msg: ToClient,
  modelPrev: Model
): [Model, Cmd<Msg>] => {
  const [modelNext, cmd] = updateFromServer_(msg, modelPrev);

  if (
    modelPrev.sharedModel.type !== "game-over" &&
    modelNext.sharedModel.type === "game-over"
  ) {
    return [
      { ...modelNext, openedModal: "game-over" },
      Cmd.batch([cmd, playAudio(Sounds.gameOver)]),
    ];
  }

  if (
    modelPrev.sharedModel.type !== "game" &&
    modelNext.sharedModel.type === "game"
  ) {
    return [modelNext, Cmd.batch([cmd, playAudio(Sounds.gameStart)])];
  }

  return [modelNext, cmd];
};

const updateFromServer_ = (msg: ToClient, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "bot-moved_Done": {
      const result = msg[1];

      if (result.t === "err") {
        return [model, Cmd.None];
      }

      const { didCapture, ...sharedModel } = result.value;

      const soundCmd =
        sharedModel.type === "game" && Chess.inCheck(sharedModel.board)
          ? playAudio(Sounds.check)
          : didCapture
          ? playAudio(Sounds.capture)
          : playAudio(Sounds.move);

      return [{ ...model, sharedModel }, soundCmd];
    }

    case "player-left": {
      const merged = syncWithServer(model, msg[1]);
      return [merged, Cmd.None];
    }

    case "input-move-done": {
      const result = msg[1];

      if (result.t === "err") {
        return [model, Cmd.None];
      }

      const sharedModelNew = result.value;

      const modelNew = syncWithServer(model, sharedModelNew);

      const soundCmd =
        sharedModelNew.type === "game" && Chess.inCheck(sharedModelNew.board)
          ? playAudio(Sounds.check)
          : sharedModelNew.didCapture
          ? playAudio(Sounds.capture)
          : playAudio(Sounds.move);

      return [modelNew, soundCmd];
    }

    case "InputUser_Done":
    case "InputColor_Done":
    case "InputBot_Done":
    case "StartGame_Done":
    case "StopGame_Done": {
      return handleResponse(msg, model);
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

const handleResponse = (res: Res, model: Model): [Model, Cmd<Msg>] => {
  const result = res[1];

  if (result.t === "err") {
    return [model, Cmd.None];
  }

  const sharedModelNew = result.value;

  const modelNew = syncWithServer(model, sharedModelNew);

  return [modelNew, Cmd.None];
};

const playAudio = (src: string): Cmd<Msg> => {
  return Audio.play(src, t("audio-done"));
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
    return ViewVsBotSetupScreen<Chess.BotLevel, Chess.Color>({
      botLevel: {
        values: Chess.allBotLevels,
        selected: model.sharedModel.botLevel,
        toName: (level) => String(level),
        render: (props) => {
          return <div>{props.botLevel}</div>;
        },
        onInput: (botLevel) =>
          $send(["InputBot", { botLevel, userId: ctx.currentUserId }]),
      },
      onCancel: onClose,
      coverArt: <ViewCoverArt />,
      ctx,
      onStartGame: () => $send(["start-game", { userId: ctx.currentUserId }]),
      onStartPlaying: () => $send(["InputUser", { userId: ctx.currentUserId }]),
      onStopPlaying: () => $send(["InputUser", { userId: "none" }]),
      player: {
        values: [Chess.colors.w, Chess.colors.b],
        selected: model.sharedModel.userColor,
        toName: (color) => (color === "w" ? "White" : "Black"),
        render: (props) => {
          return (
            <div>
              <PawnIcon
                sx={{ color: props.playerType === "w" ? "#fff" : "#000" }}
                stroke={props.playerType === "w" ? "#000" : "#fff"}
              />
              {props.playerType === "w" ? "White" : "Black"}
            </div>
          );
        },
        onInput: (color) =>
          $send([
            "InputColor",
            { userColor: color, userId: ctx.currentUserId },
          ]),
        icon: ({ sx, playerType: color }) => (
          <PawnIcon
            sx={{ ...sx, color: color === "w" ? "#fff" : "#000" }}
            stroke={color === "w" ? "#000" : "#fff"}
          />
        ),
      },
      leftPlayerType: "w",
      playerId:
        model.sharedModel.userId === "none" ? null : model.sharedModel.userId,
      title: "Chess",
      subtitle: "Vs Computer",
    });
  }

  const botSlot = (
    <UI.Box sx={{ paddingX: 2, display: "flex", alignItems: "center" }}>
      <UI.Avatar sx={{ marginRight: 2, backgroundColor: "transparent" }}>
        <UI.Icons.SmartToy
          sx={{ color: "text.primary", width: "100%", height: "100%" }}
          // sx={{ width: 40, height: 40, marginRight: 2 }}
        />
      </UI.Avatar>

      <UI.Box sx={{ flex: 1 }}>
        <UI.Typography variant="h6">
          {Chess.botLevelToString(model.sharedModel.botLevel)}
        </UI.Typography>
      </UI.Box>

      {isBotTurn(model.sharedModel) && <UI.CircularProgress size={24} />}
    </UI.Box>
  );

  const userSlot = (
    <UI.Box sx={{ paddingX: 2, display: "flex", alignItems: "center" }}>
      <UI.Avatar
        src={ctx.profiles[model.sharedModel.userId]?.avatarUrl}
        sx={{ marginRight: 2 }}
      />

      <UI.Typography variant="h6">
        {ctx.profiles[model.sharedModel.userId]?.username}
      </UI.Typography>
    </UI.Box>
  );

  const boardOrientation = model.isFlipped
    ? Chess.toOppositeColor(model.sharedModel.userColor)
    : model.sharedModel.userColor;

  const topSlot = (
    <UI.Box sx={{ paddingTop: 1, paddingBottom: 2 }}>
      {boardOrientation === model.sharedModel.userColor ? botSlot : userSlot}
    </UI.Box>
  );

  const bottomSlot = (
    <UI.Box sx={{ paddingTop: 2, paddingBottom: 1 }}>
      {boardOrientation === model.sharedModel.userColor ? userSlot : botSlot}
    </UI.Box>
  );

  return (
    <UI.FillBox>
      {topSlot}

      <Chess.View
        boardOrientation={boardOrientation}
        isDraggablePiece={({ piece }) => {
          return (
            Chess.toColor(piece) === model.sharedModel.userColor &&
            model.sharedModel.userId === ctx.currentUserId
          );
        }}
        model={model.sharedModel.board}
        onPieceDrop={(move) => {
          const msg: Msg = [
            "input-move",
            {
              userId: ctx.currentUserId,
              from: move.from,
              to: move.to,
              promotion: move.promotion,
            },
          ];

          $send(msg);

          const result = inputMove(msg[1], model.sharedModel);

          return result.t === "ok";
        }}
      />

      {bottomSlot}

      <UI.Box sx={{ flex: 1 }} />

      <UI.Box sx={{ width: "100%", display: "flex" }}>
        <UI.ActionButton
          icon={<UI.Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />}
          label={"Exit"}
          onClick={() => $send(["stop-game", { userId: ctx.currentUserId }])}
        />

        <UI.ActionButton
          icon={
            <UI.Icons.Flip
              sx={{
                transform: model.isFlipped ? "rotate(90deg)" : "rotate(270deg)",
              }}
            />
          }
          label={model.isFlipped ? "Unflip" : "Flip"}
          onClick={() => {
            $send(["ClickedFlip"]);
          }}
        />
      </UI.Box>

      {model.sharedModel.type === "game-over" && (
        <UI.Dialog
          open={
            model.sharedModel.type === "game-over" &&
            model.openedModal === "game-over"
          }
          onClose={() => $send(["ClosedModal"])}>
          {model.sharedModel.gameOver.type === "Checkmate" && (
            <UI.DialogTitle>
              {Chess.colorToString(model.sharedModel.gameOver.winner)} won by
              checkmate
            </UI.DialogTitle>
          )}

          {model.sharedModel.gameOver.type === "Stalemate" && (
            <UI.DialogTitle>Drawn by stalemate</UI.DialogTitle>
          )}

          <UI.DialogActions>
            <UI.Button onClick={() => $send(["ClosedModal"])}>Close</UI.Button>
          </UI.DialogActions>
        </UI.Dialog>
      )}
    </UI.FillBox>
  );
};

export const toGameText = (model: SharedModel): string => {
  switch (model.type) {
    case "game-over": {
      switch (model.gameOver.type) {
        case "Checkmate": {
          const color = Chess.colorToString(model.gameOver.winner);
          return `${color} won by checkmate`;
        }

        case "Stalemate": {
          return "Stalemate";
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
