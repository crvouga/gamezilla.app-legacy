import { Audio, Cmd, Sub, andThen, exhaustive, p } from "src/core";
import {
  GameLayout,
  SpaceClientCtx,
  SpaceViewCtx,
  ViewBottomButtonBar,
  VsBotSetup,
} from "src/app/space/shared";
import {
  IconArrowLeftOnRect,
  IconRobot,
  IconSpinner,
  MyAvatar,
  Spinner,
} from "src/ui";
import { Chessboard, PlayerIcon, ViewCoverArt } from "../chess-ui";
import * as Chess from "../chess/chess";
import Sounds from "../chess/chess-sounds";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  CoreModel,
  ToClient,
  ToServer,
  updateCore,
  initShared,
  isBotTurn,
} from "./vs-bot.core";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: ClientModel = {
  vsBotSetup: VsBotSetup.init,
  coreModel: initShared,
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
  ctx: SpaceClientCtx;
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

  if (msg.t === "vs-bot-setup") {
    const updated = VsBotSetup.update(model.vsBotSetup, msg.c);
    return { model: { ...model, vsBotSetup: updated } };
  }

  const handled = updateCore({
    ctx,
    msg,
    model: model.coreModel,
  });

  if (handled.t === "err") {
    return { model, cmd: sendToServer(msg) };
  }

  const coreModel = handled.value;

  const modelNew = syncWithServer({
    clientModel: model,
    serverModel: coreModel,
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
    andThen((model) => {
      if (
        input.model.coreModel.type !== "game-over" &&
        model.coreModel.type === "game-over"
      ) {
        return {
          model: { ...model, openedModal: "game-over" },
          cmd: playAudio(Sounds.gameOver),
        };
      }

      if (
        input.model.coreModel.type !== "game" &&
        model.coreModel.type === "game"
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

    const { didCapture, ...coreModel } = result.value;

    const soundCmd =
      coreModel.type === "game" && Chess.inCheck(coreModel.board)
        ? playAudio(Sounds.check)
        : didCapture
        ? playAudio(Sounds.capture)
        : playAudio(Sounds.move);

    return { model: { ...model, coreModel }, cmd: soundCmd };
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

    const coreModelNew = result.value;

    const modelNew = syncWithServer({
      clientModel: model,
      serverModel: coreModelNew,
    });

    const soundCmd =
      coreModelNew.type === "game" && Chess.inCheck(coreModelNew.board)
        ? playAudio(Sounds.check)
        : coreModelNew.didCapture
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
    coreModel: serverModel,
    vsBotSetup: clientModel.vsBotSetup,
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
  dispatch,
  onClose,
}: {
  ctx: SpaceViewCtx;
  model: Model;
  dispatch: (msg: Msg) => void;
  onClose: () => void;
}) => {
  if (model.coreModel.type === "setup") {
    return (
      <VsBotSetup.View
        model={model.vsBotSetup}
        dispatch={(c) => dispatch({ t: "vs-bot-setup", c })}
        title="Chess"
        renderCoverArt={(props) => {
          return <ViewCoverArt {...props} />;
        }}
        bot={{
          label: Chess.botLevelToString(model.coreModel.botLevel),
          renderIcon: (props) =>
            Chess.renderBotLevel({
              level: model.coreModel.botLevel,
              ...props,
            }),
        }}
        botVariants={Chess.allBotLevels.map((botLevel) => {
          return {
            label: Chess.botLevelToString(botLevel),
            renderIcon: (props) =>
              Chess.renderBotLevel({ level: botLevel, ...props }),
            onSelect: () => dispatch({ t: "input-bot-level", botLevel }),
          };
        })}
        canStartGame={model.coreModel.userId !== null}
        ctx={ctx}
        human={{
          player:
            model.coreModel.userColor === "b" ? "player-two" : "player-one",
          userId: model.coreModel.userId,
        }}
        onQuit={onClose}
        onStartGame={() => dispatch({ t: "start-game" })}
        playerOne={{
          label: "White",
          onStartPlaying: () => dispatch({ t: "start-playing", color: "w" }),
          onStopPlaying: () => dispatch({ t: "stop-playing" }),
          renderIcon: (props) => {
            return <PlayerIcon {...props} color="w" />;
          },
        }}
        playerTwo={{
          label: "Black",
          onStartPlaying: () => dispatch({ t: "start-playing", color: "b" }),
          onStopPlaying: () => dispatch({ t: "stop-playing" }),
          renderIcon: (props) => {
            return <PlayerIcon {...props} color="b" />;
          },
        }}
      />
    );
  }

  const botSlot = (
    <div className="flex w-full items-center gap-3 p-3">
      <IconRobot className="h-10 w-10" />

      <p className="flex-1 text-lg">
        {Chess.botLevelToString(model.coreModel.botLevel)}
      </p>

      {isBotTurn(model.coreModel) && <Spinner className="h-10 w-10" />}
    </div>
  );

  const userSlot = (
    <div className="flex w-full items-center gap-3 p-3">
      <MyAvatar
        className="h-10 w-10"
        src={ctx.profiles[model.coreModel.userId]?.avatarUrl}
      />

      <p className="flex-1 text-lg">
        {ctx.profiles[model.coreModel.userId]?.username}
      </p>
    </div>
  );

  const boardOrientation = model.isFlipped
    ? Chess.toOppositeColor(model.coreModel.userColor)
    : model.coreModel.userColor;

  const topSlot =
    boardOrientation === model.coreModel.userColor ? botSlot : userSlot;

  const bottomSlot =
    boardOrientation === model.coreModel.userColor ? userSlot : botSlot;

  return (
    <GameLayout>
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        {topSlot}

        <Chessboard
          id="chessboard"
          fen={model.coreModel.board.fen}
          orientation={boardOrientation}
          onPieceDrop={(move) => {
            const msg: Msg = {
              t: "input-move",
              move: {
                from: move.source,
                to: move.target,
                promotion: "q",
              },
            };

            dispatch(msg);

            // return result.t === "ok";
            return true;
          }}
        />
        {bottomSlot}
      </div>
      <ViewBottomButtonBar
        actions={[
          {
            label: "Exit",
            icon: <IconArrowLeftOnRect className="h-6 w-6" />,
            onClick: () => dispatch({ t: "stop-game" }),
          },
        ]}
      />
    </GameLayout>
  );
};

export const toGameText = (model: CoreModel): string => {
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
