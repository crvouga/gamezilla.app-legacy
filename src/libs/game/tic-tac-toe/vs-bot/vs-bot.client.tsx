import {
  ClientAppMsg,
  Ctx,
  SpaceCtx,
  SpaceViewCtx,
  ViewBottomButtonBar,
  VsBotPlayerSection,
  VsBotProps,
  VsBotSetupScreen,
} from "@gamezilla/shared/client";
import { Cmd, Posix } from "@gamezilla/shared/core";
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
  LoadingBar,
} from "@gamezilla/shared/ui";
import { toStatus, toTurn } from "../tic-tic-toe/tic-tac-toe";
import {
  PlayerTypeIcon,
  ViewBoard,
  ViewCoverArt,
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
  ctx: SpaceCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  msgs?: ClientAppMsg[];
  cmd?: Cmd<Msg>;
} => {
  const handled = handle({ ctx, msg, model });
  if (handled.t === "err") {
    return { model, cmd: sendToServer(msg) };
  }
  const merged = syncWithServer({
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
  msgs?: ClientAppMsg[];
} => {
  if (msg.result.t === "err") {
    return {
      model,
    };
  }

  const modelNew = syncWithServer({
    ...ctx,
    client: model,
    server: msg.result.value,
  });

  return {
    model: modelNew,
  };
};

export const syncWithServer = ({
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
  ctx,
  $send,
}: {
  ctx: SpaceViewCtx;
  goBack: () => void;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const vsBotProps: VsBotProps = {
    bot: {
      label: model.botLevel,
    },
    canStartGame: Boolean(model.player),
    ctx,
    human: {
      player: model.userPlayerType === "X" ? "player-one" : "player-two",
      userId: model.player ?? null,
    },
    onQuit: goBack,
    onStartGame: () => $send({ t: "start-game" }),
    playerOne: {
      label: "Cross",
      onStartPlaying: () => $send({ t: "start-playing", playerType: "X" }),
      onStopPlaying: () => $send({ t: "stop-playing" }),
      renderIcon: (props) => <PlayerTypeIcon {...props} playerType="X" />,
    },

    playerTwo: {
      label: "Naught",
      onStartPlaying: () => $send({ t: "start-playing", playerType: "O" }),
      onStopPlaying: () => $send({ t: "stop-playing" }),
      renderIcon: (props) => <PlayerTypeIcon {...props} playerType="O" />,
    },
    renderCoverArt: (props) => <ViewCoverArt {...props} />,
    title: "Tic Tac Toe",
  };

  if (model.type === "setup") {
    return <VsBotSetupScreen {...vsBotProps} />;
  }

  const vsBotGameProps = {
    ...vsBotProps,
    human: {
      ...vsBotProps.human,
      userId: model.player,
    },
  };

  const turn = toTurn(model.board);
  const status = toStatus(model.board);

  return (
    <div className="flex h-full w-full flex-col ">
      <div className="flex flex-1 flex-col items-center justify-center">
        <VsBotPlayerSection {...vsBotGameProps} />

        <LoadingBar
          className="w-full"
          disabled={model.userPlayerType === turn || status.type !== "Turn"}
        />
        <ViewBoard
          board={model.board}
          onClick={(position) => $send({ t: "input-move", position })}
        />
      </div>
      <ViewBottomButtonBar
        actions={[
          {
            icon: <IconArrowLeftOnRect />,
            label: "Exit",
            onClick: goBack,
          },
          {
            icon: <IconRightLeft />,
            label: "Swap sides",
            onClick: () => $send({ t: "swap-sides" }),
          },
          {
            icon: <IconArrowRotateLeft />,
            label: "Restart",
            onClick: () => $send({ t: "restart" }),
          },
        ]}
      />
    </div>
  );
};

export const ViewMsg = ({ msg }: { msg: Msg | ToClient }) => {
  if ("result" in msg && msg.result.t === "err") {
    return msg.result.error;
  }
  return null;
};
