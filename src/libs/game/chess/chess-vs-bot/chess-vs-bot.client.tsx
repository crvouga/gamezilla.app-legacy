import {
  SpaceCtx,
  SpaceViewCtx,
  VsBotSetupScreen,
} from "@gamezilla/shared/client";
import {
  Audio,
  Cmd,
  Sub,
  andThen,
  exhaustive,
  p,
} from "@gamezilla/shared/core";
import { IconRobot, IconSpinner, MyAvatar } from "@gamezilla/shared/ui";
import * as Chess from "../chess/chess";
import Sounds from "../chess/chess-sounds";
import { PlayerIcon } from "../chess/chess-views";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  SharedModel,
  ToClient,
  ToServer,
  handle,
  initShared,
  isBotTurn,
} from "./chess-vs-bot.shared";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: ClientModel = {
  sharedModel: initShared,
  openedMenuId: null,
  openedModal: null,
  isFlipped: false,
};

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  sendToServer,
  msg,
  model: model_,
  ctx,
}: {
  ctx: SpaceCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const model: Model = { ...model_, openedMenuId: null };

  if (msg.t === "audio-done") {
    return { model };
  }

  if (msg.t === "closed-modal") {
    return { model: { ...model, openedModal: null } };
  }

  if (msg.t === "clicked-flip") {
    return { model: { ...model, isFlipped: !model.isFlipped } };
  }

  if (msg.t === "opened-menu") {
    return { model: { ...model, openedMenuId: msg.menuId } };
  }

  if (msg.t === "closed-menu") {
    return { model: { ...model, openedMenuId: null } };
  }

  const handled = handle({
    ctx,
    msg,
    model: model.sharedModel,
  });

  if (handled.t === "err") {
    return { model, cmd: sendToServer(msg) };
  }

  const sharedModel = handled.value;

  const modelNew = syncWithServer({
    clientModel: model,
    serverModel: sharedModel,
  });

  return { model: modelNew, cmd: sendToServer(msg) };
};

export const updateFromServer = (input: {
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return p(
    updateFromServer_(input),
    andThen(({ model }) => {
      if (
        input.model.sharedModel.type !== "game-over" &&
        model.sharedModel.type === "game-over"
      ) {
        return {
          model: { ...model, openedModal: "game-over" },
          cmd: playAudio(Sounds.gameOver),
        };
      }

      if (
        input.model.sharedModel.type !== "game" &&
        model.sharedModel.type === "game"
      ) {
        return {
          model,
          cmd: playAudio(Sounds.gameStart),
        };
      }

      return { model };
    })
  );
};

const updateFromServer_: typeof updateFromServer = ({ msg, model }) => {
  if (msg.t === "bot-moved") {
    const { result } = msg;

    if (result.t === "err") {
      return { model };
    }

    const { didCapture, ...sharedModel } = result.value;

    const soundCmd =
      sharedModel.type === "game" && Chess.inCheck(sharedModel.board)
        ? playAudio(Sounds.check)
        : didCapture
        ? playAudio(Sounds.capture)
        : playAudio(Sounds.move);

    return { model: { ...model, sharedModel }, cmd: soundCmd };
  }

  if (msg.t === "player-left") {
    const merged = syncWithServer({
      clientModel: model,
      serverModel: msg.model,
    });
    return { model: merged };
  }

  if (msg.t === "input-move") {
    const { result } = msg;

    if (result.t === "err") {
      return { model };
    }

    const sharedModelNew = result.value;

    const modelNew = syncWithServer({
      clientModel: model,
      serverModel: sharedModelNew,
    });

    const soundCmd =
      sharedModelNew.type === "game" && Chess.inCheck(sharedModelNew.board)
        ? playAudio(Sounds.check)
        : sharedModelNew.didCapture
        ? playAudio(Sounds.capture)
        : playAudio(Sounds.move);

    return { model: modelNew, cmd: soundCmd };
  }

  const { result } = msg;

  if (result.t === "err") {
    return { model };
  }

  const modelNew = syncWithServer({
    clientModel: model,
    serverModel: result.value,
  });

  return { model: modelNew };
};

const playAudio = (src: string): Cmd<Msg> => {
  return Audio.play(src, (result) => ({ t: "audio-done", result }));
};

//
//
//
//
//
//
//

export const syncWithServer = ({
  clientModel = init,
  serverModel,
}: {
  clientModel?: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
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
  ctx: SpaceViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
  onClose: () => void;
}) => {
  if (model.sharedModel.type === "setup") {
    return (
      <VsBotSetupScreen
        title="Chess"
        renderCoverArt={(props) => {
          return <Chess.ViewCoverArt {...props} />;
        }}
        bot={{
          label: Chess.botLevelToString(model.sharedModel.botLevel),
        }}
        canStartGame={model.sharedModel.userId !== null}
        ctx={ctx}
        human={{
          player:
            model.sharedModel.userColor === "b" ? "player-two" : "player-one",
          userId: model.sharedModel.userId,
        }}
        onQuit={onClose}
        onStartGame={() => $send({ t: "start-game" })}
        playerOne={{
          label: "White",
          onStartPlaying: () => $send({ t: "start-playing", color: "w" }),
          onStopPlaying: () => $send({ t: "stop-playing" }),
          renderIcon: (props) => {
            return <PlayerIcon {...props} color="w" />;
          },
        }}
        playerTwo={{
          label: "Black",
          onStartPlaying: () => $send({ t: "start-playing", color: "b" }),
          onStopPlaying: () => $send({ t: "stop-playing" }),
          renderIcon: (props) => {
            return <PlayerIcon {...props} color="b" />;
          },
        }}
      />
    );
  }

  const botSlot = (
    <div>
      <div>
        <IconRobot />
      </div>

      <div>
        <p>{Chess.botLevelToString(model.sharedModel.botLevel)}</p>
      </div>

      {isBotTurn(model.sharedModel) && (
        <IconSpinner className="h-5 w-5 animate-spin" />
      )}
    </div>
  );

  const userSlot = (
    <div>
      <MyAvatar
        src={ctx.profiles[model.sharedModel.userId]?.avatarUrl}

      />

      <p>{ctx.profiles[model.sharedModel.userId]?.username}</p>
    </div>
  );

  const boardOrientation = model.isFlipped
    ? Chess.toOppositeColor(model.sharedModel.userColor)
    : model.sharedModel.userColor;

  const topSlot = (
    <div>
      {boardOrientation === model.sharedModel.userColor ? botSlot : userSlot}
    </div>
  );

  const bottomSlot = (
    <div>
      {boardOrientation === model.sharedModel.userColor ? userSlot : botSlot}
    </div>
  );

  return (
    <div>
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
          const msg: Msg = {
            t: "input-move",
            move: {
              from: move.from,
              to: move.to,
              promotion: move.promotion,
            },
          };

          $send(msg);

          // return result.t === "ok";
          return true;
        }}
      />

      {bottomSlot}

      <div className="flex-1"></div>
    </div>
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
