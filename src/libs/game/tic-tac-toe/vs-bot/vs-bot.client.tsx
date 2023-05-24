import {
  AppMsg,
  Ctx,
  RoomCtx,
  ViewCtx,
  ViewVsBotGameScreen,
  ViewVsBotSetupScreen,
} from "@gamezilla/shared/client";
import { Cmd, Posix } from "@gamezilla/shared/core";
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
} from "@gamezilla/shared/ui";
import {
  BotLevel,
  PlayerType,
  botLevels,
  playerTypes,
  toGameOver,
  toOpposite,
  toTurn,
} from "../tic-tic-toe/tic-tac-toe";
import {
  PlayerTypeIcon,
  ViewBoard,
  viewCoverArt,
} from "../tic-tic-toe/tic-tac-toe-ui";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
  handle,
  initSharedModel,
} from "./vs-bot.shared";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = initSharedModel;

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  msg,
  model,
  ctx,
  sendToServer,
}: {
  sendToServer: (msg: ToServer) => Cmd;
  ctx: RoomCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  msgs?: AppMsg[];
  cmd?: Cmd<Msg>;
} => {
  const handled = handle({ ctx, msg, model });
  if (handled.t === "err") {
    return { model, cmd: sendToServer(msg) };
  }
  const merged = mergeWithServer({
    ...ctx,
    client: model,
    server: handled.value,
  });
  return { model: merged, cmd: sendToServer(msg) };
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
  msgs?: AppMsg[];
} => {
  if (msg.result.t === "err") {
    return {
      model,
    };
  }

  const modelNew = mergeWithServer({
    ...ctx,
    client: model,
    server: msg.result.value,
  });

  return {
    model: modelNew,
  };
};

export const mergeWithServer = ({
  server,
  client,
}: {
  now: Posix;
  client: ClientModel;
  server: ServerModel;
}): ClientModel => {
  return {
    ...client,
    ...server,
  };
};

//
//
//
// View
//
//
//

export const View = ({
  goBack,
  model,
  $send,
  ctx,
}: {
  ctx: ViewCtx;
  goBack: () => void;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  if (model.type === "setup") {
    return (
      <ViewVsBotSetupScreen<BotLevel, PlayerType>
        leftPlayerType="X"
        playerId={model.player}
        subtitle="Vs Computer"
        title="Tic-Tac-Toe"
        coverArt={viewCoverArt()}
        ctx={ctx}
        onCancel={goBack}
        onStartGame={() => $send({ t: "start-game" })}
        onStartPlaying={() => $send({ t: "start-playing" })}
        onStopPlaying={() => $send({ t: "stop-playing" })}
        player={{
          values: Object.values(playerTypes),
          onInput: (player) =>
            $send({ t: "input-player-type", playerType: player }),
          selected: model.userPlayerType,
          icon: ({ playerType }) => (
            <PlayerTypeIcon playerType={playerType} className="w-6 h-6" />
          ),
          render: ({ playerType }) => (
            <PlayerTypeIcon
              playerType={playerType}
              className="w-6 h-6 mx-auto"
            />
          ),
          toName: (player) => player,
        }}
        botLevel={{
          onInput: (botLevel) => $send({ t: "input-bot-level", botLevel }),
          selected: model.botLevel,
          values: Object.values(botLevels),
          toName: (botLevel) => botLevel,
          render: ({ botLevel }) => botLevel,
        }}
      />
    );
  }
  const gameOver = toGameOver(model.board);

  return (
    <ViewVsBotGameScreen<PlayerType>
      leftPlayer="X"
      actions={[
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
      ]}
      ctx={ctx}
      botName={model.botLevel}
      botPlayer={toOpposite(model.userPlayerType)}
      gameOver={
        gameOver.type === "Tie"
          ? { type: "draw" }
          : gameOver.type === "Win"
          ? { type: "winner", winner: gameOver.winner }
          : { type: "none" }
      }
      gameOverActions={[
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
      ]}
      playerUserId={model.player}
      turn={toTurn(model.board)}
      userPlayer={model.userPlayerType}
      viewBoard={() => (
        <ViewBoard
          board={model.board}
          onClick={(position) => $send({ t: "input-move", position })}
        />
      )}
      viewPlayerIcon={({ playerType, className }) => (
        <PlayerTypeIcon className={className} playerType={playerType} />
      )}
    />
  );
};

export const ViewMsg = ({ msg }: { msg: Msg | ToClient }) => {
  if ("result" in msg && msg.result.t === "err") {
    return msg.result.error;
  }
  return null;
};
