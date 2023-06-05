import {
  Ctx,
  RoomCtx,
  ViewCtx,
  ViewVsBotGameScreen,
  ViewVsBotSetupScreen,
} from "@gamezilla/shared/client";
import { Cmd, Posix, Sub } from "@gamezilla/shared/core";
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
} from "@gamezilla/shared/ui";
import {
  PlayerType,
  opposite,
  playerTypes,
  toStatus,
  toTurn,
} from "../connect-four/connect-four";
import {
  PlayerIcon,
  ViewColumns,
  ViewCoverArt,
} from "../connect-four/connect-four-ui";
import {
  BotLevel,
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
  botLevel,
  handle,
  initShared,
} from "./vs-bot.shared";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = (...params: Parameters<typeof initShared>): ClientModel => {
  const shared = initShared(...params);

  if (shared.type === "setup") {
    return shared;
  }

  return {
    ...shared,
    ghostIndex: "none",
  };
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
  ctx,
  msg,
  model,
}: {
  ctx: RoomCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case "hovered": {
      if (model.type !== "game") {
        return { model };
      }
      return { model: { ...model, ghostIndex: msg.columnIndex } };
    }

    case "input-move": {
      const result = handle({ ctx, msg, model });

      if (result.t === "err") {
        return { model };
      }

      const modelNext = syncWithServer({
        ctx,
        serverModel: result.value,
        clientModel: model,
      });

      return { model: modelNext, cmd: sendToServer(msg) };
    }

    case "input-player-type":
    case "restart":
    case "start-game":
    case "start-playing":
    case "stop-game":
    case "stop-playing":
    case "swap-sides":
    case "input-bot-level": {
      return { model, cmd: sendToServer(msg) };
    }
  }
};

export const updateFromServer = ({
  ctx,
  msg,
  model,
}: {
  ctx: RoomCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case "player-left": {
      const modelNew = syncWithServer({
        ctx,
        clientModel: model,
        serverModel: msg.model,
      });
      return { model: modelNew };
    }

    case "bot-move":
    case "input-move": {
      if (msg.result.t === "err") {
        return { model };
      }

      const modelNew = syncWithServer({
        ctx,
        clientModel: model,
        serverModel: msg.result.value,
      });

      return { model: modelNew };
    }

    case "input-player-type":
    case "restart":
    case "start-game":
    case "start-playing":
    case "stop-game":
    case "stop-playing":
    case "swap-sides":
    case "input-bot-level": {
      if (msg.result.t === "err") {
        return { model };
      }

      const modelNew = syncWithServer({
        ctx,
        clientModel: model,
        serverModel: msg.result.value,
      });

      return { model: modelNew };
    }
  }
};

export const syncWithServer = ({
  serverModel,
  clientModel,
}: {
  ctx: Ctx;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  if (serverModel.type === "setup") {
    return serverModel;
  }

  if (clientModel.type === "setup") {
    return {
      ...serverModel,
      ghostIndex: "none",
    };
  }

  return {
    ...serverModel,
    ghostIndex: clientModel.ghostIndex,
  };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (
  _intervalId: string,
  _now: Posix,
  _model: Model
): Sub<Msg> => {
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
  model,
  goBack,
  ctx,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
  goBack: () => void;
  ctx: ViewCtx;
}) => {
  if (model.type === "setup") {
    return (
      <ViewVsBotSetupScreen<BotLevel, PlayerType>
        coverArt={<ViewCoverArt />}
        title="Connect Four"
        subtitle="Play Computer"
        ctx={ctx}
        playerId={model.player === "none" ? null : model.player}
        leftPlayerType="PlayerOne"
        onCancel={goBack}
        onStartGame={() => $send({ t: "start-game" })}
        onStartPlaying={() => $send({ t: "start-playing" })}
        onStopPlaying={() => $send({ t: "stop-playing" })}
        botLevel={{
          values: Object.values(botLevel),
          selected: model.botLevel,
          onInput: (level) => $send({ t: "input-bot-level", botLevel: level }),
          toName: (level) => level,
          render: ({ botLevel }) => <div>{botLevel}</div>,
        }}
        player={{
          values: Object.values(playerTypes),
          selected: model.userPlayerType,
          onInput: (playerType) =>
            $send({ t: "input-player-type", playerType }),
          icon: ({ playerType }) => {
            return <PlayerIcon playerType={playerType} />;
          },
          toName: (playerType) =>
            playerType === "PlayerOne" ? "Red" : "Yellow",
          render: ({ playerType }) => (
            <div className="flex items-center justify-center gap-2">
              <PlayerIcon playerType={playerType} />
              <div>{playerType === "PlayerOne" ? "Red" : "Yellow"}</div>
            </div>
          ),
        }}
      />
    );
  }

  const status = toStatus(model.columns);

  return ViewVsBotGameScreen<PlayerType>({
    gameOver:
      status.type === "Tie"
        ? { type: "draw" }
        : status.type === "Winner"
        ? { type: "winner", winner: status.winner }
        : { type: "none" },
    gameOverActions: [
      {
        label: "Exit",
        icon: <IconArrowLeftOnRect />,
        onClick: () => $send({ t: "stop-game" }),
      },
      {
        label: "Restart",
        icon: <IconArrowRotateLeft />,
        onClick: () => $send({ t: "restart" }),
      },
    ],
    botName: model.botLevel,
    botPlayer: opposite[model.userPlayerType],
    ctx,
    leftPlayer: "PlayerOne",
    playerUserId: model.player,
    userPlayer: model.userPlayerType,
    turn: toTurn(model.columns),
    actions: [
      {
        label: "Exit",
        icon: <IconArrowLeftOnRect />,
        onClick: () => $send({ t: "stop-game" }),
      },
      {
        label: "Restart",
        icon: <IconArrowRotateLeft />,
        onClick: () => $send({ t: "restart" }),
      },
      {
        label: "Swap",
        icon: <IconRightLeft />,
        onClick: () => $send({ t: "restart" }),
      },
    ],
    viewPlayerIcon: (props) => <PlayerIcon key={props.playerType} {...props} />,
    viewBoard: () => (
      <ViewColumns
        ghost={
          ctx.currentUserId === model.player &&
          toTurn(model.columns) === model.userPlayerType &&
          model.ghostIndex !== "none"
            ? {
                columnIndex: model.ghostIndex,
                playerType: model.userPlayerType,
              }
            : undefined
        }
        columns={model.columns}
        onHover={(columnIndex) => $send({ t: "hovered", columnIndex })}
        onClick={(columnIndex) => $send({ t: "input-move", columnIndex })}
      />
    ),
  });
};
