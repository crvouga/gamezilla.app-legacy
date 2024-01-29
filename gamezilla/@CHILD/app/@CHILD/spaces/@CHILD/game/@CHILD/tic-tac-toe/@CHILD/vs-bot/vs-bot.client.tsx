import { ViewBottomButtonBar } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import {
  IconBotCute,
  IconBotLevel1,
  IconBotScary,
  VsBotGame,
  VsBotSetup,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/vs-bot";
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import {
  ClientCmd,
  ClientCtx,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
  LoadingBar,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Posix } from "gamezilla/@SHARED/core";
import {
  BotLevel,
  allBotLevels,
  toStatus,
  toTurn,
} from "../../@SHARED/tic-tic-toe/tic-tac-toe";
import {
  CoverArt,
  PlayerTypeIcon,
  ViewBoard,
  gameTheme,
} from "../../@SHARED/tic-tic-toe/tic-tac-toe-ui";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
  handle,
  initCoreModel,
} from "./vs-bot.core";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = (...input: Parameters<typeof initCoreModel>): Model => {
  return {
    ...initCoreModel(...input),
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
}: {
  ctx: SpaceClientCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;

  eff?: Eff<Msg>;
  msgCmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  if (msg.t === "vs-bot-setup") {
    const updated = VsBotSetup.update(model.vsBotSetup, msg.c);
    return { model: { ...model, vsBotSetup: updated } };
  }

  const handled = handle({ ctx, msg, model });
  if (handled.t === "err") {
    return { model, msgCmd: [sendToServer(msg)] };
  }
  const merged = mergeWithServer({
    ...ctx,
    client: model,
    server: handled.value,
  });
  return { model: merged, msgCmd: [sendToServer(msg)] };
};

export const updateFromServer = ({
  msg,
  model,
  ctx,
}: {
  ctx: ClientCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
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
  emit,
}: {
  ctx: SpaceClientCtx;
  goBack: () => void;
  model: Model;
  emit: (msg: Msg) => void;
}) => {
  const vsBotProps: VsBotSetup.VsBotSetupProps = {
    bot: {
      label: model.botLevel,
      renderIcon: (props) =>
        renderBotLevel({ level: model.botLevel, ...props }),
    },
    onSwapSides: () => emit({ t: "swap-sides" }),
    canStartGame: Boolean(model.player),
    ctx,
    human: {
      player: model.userPlayerType === "X" ? "player-one" : "player-two",
      userId: model.player ?? null,
    },
    onQuit: goBack,
    onStartGame: () => emit({ t: "start-game" }),
    botVariants: allBotLevels.map((botLevel) => {
      return {
        label: botLevel,
        renderIcon: (props) => renderBotLevel({ level: botLevel, ...props }),
        onSelect: () => emit({ t: "input-bot-level", botLevel }),
      };
    }),
    playerOne: {
      label: "Cross",
      onStartPlaying: () => emit({ t: "start-playing", playerType: "X" }),
      onStopPlaying: () => emit({ t: "stop-playing" }),
      renderIcon: (props) => <PlayerTypeIcon {...props} playerType="X" />,
    },
    playerTwo: {
      label: "Naught",
      onStartPlaying: () => emit({ t: "start-playing", playerType: "O" }),
      onStopPlaying: () => emit({ t: "stop-playing" }),
      renderIcon: (props) => <PlayerTypeIcon {...props} playerType="O" />,
    },
    renderCoverArt: (props) => <CoverArt {...props} />,
    title: "Tic-Tac-Toe",
  };

  if (model.type === "setup") {
    return (
      <VsBotSetup.View
        model={model.vsBotSetup}
        emit={(c) => emit({ t: "vs-bot-setup", c })}
        {...vsBotProps}
      />
    );
  }

  const vsBotGameProps: VsBotGame.VsBotGameProps = {
    ...vsBotProps,
    human: {
      ...vsBotProps.human,
      userId: model.player,
    },
    turn: null,
    isSpectating: false,
  };

  const turn = toTurn(model.board);
  const status = toStatus(model.board);

  return (
    <div className="flex h-full w-full flex-col ">
      <div className="flex flex-1 flex-col items-center justify-center">
        <VsBotGame.VsBotPlayerSection {...vsBotGameProps} />

        <LoadingBar
          className="w-full"
          disabled={model.userPlayerType === turn || status.type !== "Turn"}
          color={gameTheme.background}
        />

        <ViewBoard
          board={model.board}
          onClick={(position) => emit({ t: "input-move", position })}
        />
      </div>

      <ViewBottomButtonBar
        actions={[
          {
            icon: <IconArrowLeftOnRect className="h-6 w-6" />,
            label: "Exit",
            onClick: () => emit({ t: "stop-game" }),
          },
          {
            icon: <IconRightLeft className="h-6 w-6" />,
            label: "Swap sides",
            onClick: () => emit({ t: "swap-sides" }),
          },
          {
            icon: <IconArrowRotateLeft className="h-6 w-6" />,
            label: "Restart",
            onClick: () => emit({ t: "restart" }),
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
