import { Cmd, Posix } from "@gamezilla/core";
import {
  ClientAppMsg,
  Ctx,
  IconBotCute,
  IconBotLevel1,
  IconBotScary,
  SpaceCtx,
  SpaceViewCtx,
  ViewBottomButtonBar,
  VsBotPlayerSection,
  VsBotProps,
  VsBotSetup,
} from "@gamezilla/shared/client";
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
  LoadingBar,
} from "@gamezilla/ui";
import {
  BotLevel,
  allBotLevels,
  toStatus,
  toTurn,
} from "../tic-tic-toe/tic-tac-toe";
import {
  PlayerTypeIcon,
  ViewBoard,
  ViewCoverArt,
  gameTheme,
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

export const init = (...input: Parameters<typeof initSharedModel>): Model => {
  return {
    ...initSharedModel(...input),
    vsBotSetup: VsBotSetup.init,
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
  if (msg.t === "vs-bot-setup") {
    const updated = VsBotSetup.update({ msg: msg.c, model: model.vsBotSetup });
    return { model: { ...model, vsBotSetup: updated.model } };
  }

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
  client = init({ userId: null }),
}: {
  now: Posix;
  client?: ClientModel;
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
  dispatch,
}: {
  ctx: SpaceViewCtx;
  goBack: () => void;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  const vsBotProps: VsBotProps = {
    bot: {
      label: model.botLevel,
      renderIcon: (props) =>
        renderBotLevel({ level: model.botLevel, ...props }),
    },
    canStartGame: Boolean(model.player),
    ctx,
    human: {
      player: model.userPlayerType === "X" ? "player-one" : "player-two",
      userId: model.player ?? null,
    },
    onQuit: goBack,
    onStartGame: () => dispatch({ t: "start-game" }),
    botVariants: allBotLevels.map((botLevel) => {
      return {
        label: botLevel,
        renderIcon: (props) => renderBotLevel({ level: botLevel, ...props }),
        onSelect: () => dispatch({ t: "input-bot-level", botLevel }),
      };
    }),
    playerOne: {
      label: "Cross",
      onStartPlaying: () => dispatch({ t: "start-playing", playerType: "X" }),
      onStopPlaying: () => dispatch({ t: "stop-playing" }),
      renderIcon: (props) => <PlayerTypeIcon {...props} playerType="X" />,
    },
    playerTwo: {
      label: "Naught",
      onStartPlaying: () => dispatch({ t: "start-playing", playerType: "O" }),
      onStopPlaying: () => dispatch({ t: "stop-playing" }),
      renderIcon: (props) => <PlayerTypeIcon {...props} playerType="O" />,
    },
    renderCoverArt: (props) => <ViewCoverArt {...props} />,
    title: "Tic-Tac-Toe",
  };

  if (model.type === "setup") {
    return (
      <VsBotSetup.View
        model={model.vsBotSetup}
        dispatch={(c) => dispatch({ t: "vs-bot-setup", c })}
        {...vsBotProps}
      />
    );
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
          color={gameTheme.background}
        />
        <ViewBoard
          board={model.board}
          onClick={(position) => dispatch({ t: "input-move", position })}
        />
      </div>
      <ViewBottomButtonBar
        actions={[
          {
            icon: <IconArrowLeftOnRect />,
            label: "Exit",
            onClick: () => dispatch({ t: "stop-game" }),
          },
          {
            icon: <IconRightLeft />,
            label: "Swap sides",
            onClick: () => dispatch({ t: "swap-sides" }),
          },
          {
            icon: <IconArrowRotateLeft />,
            label: "Restart",
            onClick: () => dispatch({ t: "restart" }),
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

export const renderBotLevel = ({
  level,
  ...props
}: {
  level: BotLevel;
  className?: string;
}) => {
  switch (level) {
    case "Easy": {
      return <IconBotCute {...props} />;
    }
    case "Medium": {
      return <IconBotLevel1 {...props} />;
    }
    case "Impossible": {
      return <IconBotScary {...props} />;
    }
  }
};
