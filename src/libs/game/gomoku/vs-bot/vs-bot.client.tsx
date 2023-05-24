import {
  Ctx,
  ViewCtx,
  ViewVsBotGameScreen,
  ViewVsBotSetupScreen,
} from "@gamezilla/shared/client";
import { Cmd, Sub } from "@gamezilla/shared/core";
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
} from "@gamezilla/shared/ui";
import {
  BotLevel,
  Stone,
  botLevels,
  stones,
  toOppositeStone,
  toStatus,
  toTurn,
} from "../gomoku/gomoku";
import { ViewBoard, ViewCoverArt, viewStoneIcon } from "../gomoku/gomoku-ui";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
  handle,
  initShared,
} from "./vs-bot.shared";
//
//
//
// model
//
//
//

export type Model = ClientModel;

export const init = initShared;

//
//
//
// update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  ctx,
  sendToServer,
  msg,
  model,
}: {
  ctx: Ctx;
  sendToServer: (m: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    default: {
      const result = handle({ ctx, msg, model });

      if (result.t === "err") {
        return {
          model,
          cmd: sendToServer(msg),
        };
      }

      const merged = syncWithServer({
        ctx,
        serverModel: result.value,
        clientModel: model,
      });

      return {
        model: merged,
        cmd: sendToServer(msg),
      };
    }
  }
};

export const updateFromServer = ({
  msg,
  model,
  ctx,
}: {
  ctx: Ctx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.result.t === "err") {
    return { model };
  }

  const merged = syncWithServer({
    ctx,
    clientModel: model,
    serverModel: msg.result.value,
  });

  return { model: merged };
};

export const syncWithServer = ({
  serverModel,
  clientModel,
}: {
  ctx: Ctx;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  return { ...clientModel, ...serverModel };
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_ctx: Ctx, model: Model): Sub<Msg> => {
  switch (model.type) {
    case "game": {
      return Sub.None;
    }

    case "setup": {
      return Sub.None;
    }
  }
};

//
//
//
// view
//
//
//

export const view = ({
  $send,
  model,
  ctx,
  onBack,
}: {
  model: Model;
  ctx: ViewCtx;
  $send: (m: Msg) => void;
  onBack: () => void;
}) => {
  switch (model.type) {
    case "setup": {
      return ViewVsBotSetupScreen<BotLevel, Stone>({
        leftPlayerType: "white",
        botLevel: {
          onInput: (botLevel) => $send({ t: "input-bot-level", botLevel }),
          selected: model.botLevel,
          values: Object.values(botLevels),
          toName: (botLevel) => botLevel,
          render: (props) => props.botLevel,
        },
        coverArt: ViewCoverArt(),
        player: {
          onInput: (userStone) =>
            $send({ t: "inputted-user-stone", userStone }),
          selected: model.userStone,
          values: Object.values(stones),
          icon: ({ sx, playerType: stone }) => viewStoneIcon({ ...sx, stone }),
          toName: (stone) => stone,
          render: (props) => (
            <div className="flex items-center justify-center gap-2">
              {viewStoneIcon({ stone: props.playerType })}
              {props.playerType === "white" ? "White" : "Black"}
            </div>
          ),
        },
        ctx,
        title: "gomoku",
        subtitle: "Vs Computer",
        onCancel: onBack,
        onStartPlaying: () => $send({ t: "start-playing" }),
        onStopPlaying: () => $send({ t: "stop-playing" }),
        onStartGame: () => $send({ t: "start-game" }),
        playerId: model.userId,
      });
    }

    case "game": {
      const status = toStatus(model.board);

      return ViewVsBotGameScreen<Stone>({
        ctx,
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
            onClick: () => $send({ t: "swap-sides" }),
          },
        ],
        botName: model.botLevel,
        botPlayer: toOppositeStone(model.userStone),
        gameOver:
          status.type === "draw"
            ? { type: "draw" }
            : status.type === "win"
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
        leftPlayer: "white",
        playerUserId: model.userId,
        turn: toTurn(model.board),
        userPlayer: model.userStone,
        viewBoard: () => (
          <ViewBoard
            onPress={(position) => $send({ t: "input-move", position })}
            board={model.board}
          />
        ),
        viewPlayerIcon: ({ playerType: stone }) => viewStoneIcon({ stone }),
      });
    }
  }
};
