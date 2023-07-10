import { UserId } from "@gamezilla/shared/app";
import { SpaceCtx, ViewCtx } from "@gamezilla/shared/client";
import {
  Audio,
  Cmd,
  Option,
  Sub,
  exhaustive,
  p,
  t,
} from "@gamezilla/shared/core";

import * as Chess from "../chess/chess";
import Sounds from "../chess/chess-sounds";
import {
  ClientModel,
  ClientMsg,
  InputMove,
  ServerModel,
  SharedModel,
  ToClient,
  ToServer,
  initShared,
  inputMove,
} from "./vs-user.shared";
import { Chessboard } from "../chess-ui";

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
  { ctx }: { ctx: SpaceCtx },
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
  dispatch,
}: {
  ctx: ViewCtx;
  model: Model;
  dispatch: (msg: Msg) => void;
  onClose: () => void;
}) => {
  if (model.sharedModel.type === "setup") {
    return <div>hello</div>;
  }

  const { w, b, board } = model.sharedModel;

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

  return (
    <div>
      <Chessboard
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

          dispatch(msg);

          const inputted = inputMove(msg[1], model.sharedModel);

          return inputted.t === "ok";
        }}
      />

      <div className="flex-1"></div>

      <ViewGameOverDialog model={model} dispatch={dispatch} />
    </div>
  );
};

const ViewGameOverDialog = ({
  model,
}: {
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  if (model.sharedModel.type === "setup") {
    return <span>{toGameText(model.sharedModel)}</span>;
  }

  if (model.sharedModel.type === "game") {
    return <span></span>;
  }

  return <span></span>;
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
