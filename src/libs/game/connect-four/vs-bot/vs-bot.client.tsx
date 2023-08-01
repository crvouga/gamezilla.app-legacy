import { Cmd, Posix, Sub, andThen, p } from "@gamezilla/core";
import { ClientCtx } from "@gamezilla/shared/client";
import {
  GameClient,
  GameLayout,
  GameSpaceClientCtx,
  GameSpaceViewCtx,
  IconBotHappy,
  IconBotLevel1,
  IconBotLevel4,
  ViewBottomButtonBar,
  ViewGameOverOverlay,
  VsBotGame,
  VsBotPlayerSection,
  VsBotProps,
  VsBotSetup,
} from "@gamezilla/shared/game-space";
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
  LoadingBar,
} from "@gamezilla/ui";
import { Columns, toStatus, toTurn } from "../connect-four";
import { ViewCoverArt } from "../connect-four-cover-art";
import {
  ColumnsUI,
  PlayerOneIcon,
  PlayerTwoIcon,
  gameTheme,
} from "../connect-four-ui";
import {
  BotLevel,
  ClientModel,
  ClientMsg,
  CoreModel,
  ServerModel,
  ToClient,
  ToServer,
  allBotLevels,
  updateCore,
  initCore,
} from "./vs-bot.core";

export type Client = GameClient<
  ClientModel,
  CoreModel,
  ClientMsg,
  ToClient,
  ToServer
>;

//
//
//
//

export const init = (...params: Parameters<typeof initCore>): ClientModel => {
  const shared = initCore(...params);

  return {
    ...shared,
    vsBotSetup: VsBotSetup.init,
    vsBotGame: VsBotGame.init(null),
    columnsUI: ColumnsUI.init(),
  };
};

//
//
//
//
//

export const update = ({
  sendToServer,
  ctx,
  msg,
  model,
}: {
  ctx: GameSpaceClientCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: Cmd<ClientMsg>;
} =>
  p(
    { model },
    andThen(({ model }) => {
      if (msg.t === "columns-ui") {
        const updated = ColumnsUI.update(model.columnsUI, msg.c);
        return { model: { ...model, columnsUI: updated } };
      }

      if (msg.t === "vs-bot-game") {
        const updated = VsBotGame.update(model.vsBotGame, msg.c);
        return { model: { ...model, vsBotGame: updated } };
      }

      if (msg.t === "vs-bot-setup") {
        const updated = VsBotSetup.update(model.vsBotSetup, msg.c);
        return { model: { ...model, vsBotSetup: updated } };
      }

      const result = updateCore({ ctx, msg, model });

      if (result.t === "err") {
        return { model };
      }

      const sync = syncWithServer({
        ctx,
        serverModel: result.value,
        clientModel: model,
      });

      return {
        model: sync.model,
        cmd: Cmd.batch<ClientMsg>([sync.cmd, sendToServer(msg)]),
      };
    }),
    andThen(({ model }) => watch(model))
  );

function watch(model: ClientModel) {
  const columnsUI = ColumnsUI.watch(
    model.columnsUI,
    "columns" in model ? model.columns : undefined
  );

  const vsBotGame = VsBotGame.watch(
    model.vsBotGame,
    "columns" in model ? toGameOver(model.columns) : undefined
  );

  return {
    model: {
      ...model,
      columnsUI: columnsUI.model,
      vsBotGame: vsBotGame.model,
    },
    cmd: Cmd.batch<ClientMsg>([
      Cmd.tag_("vs-bot-game", vsBotGame.cmd),
      Cmd.tag_("columns-ui", columnsUI.cmd),
    ]),
  };
}

export const updateFromServer = (input: {
  ctx: GameSpaceClientCtx;
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: Cmd<ClientMsg>;
} => {
  return p(
    updateFromServer_(input),
    andThen(({ model }) => watch(model))
  );
};

const updateFromServer_: typeof updateFromServer = ({ ctx, msg, model }) => {
  if (msg.t === "player-left") {
    const sync = syncWithServer({
      ctx,
      clientModel: model,
      serverModel: msg.model,
    });
    return sync;
  }

  if (msg.result.t === "err") {
    return { model };
  }

  const sync = syncWithServer({
    ctx,
    clientModel: model,
    serverModel: msg.result.value,
  });

  return sync;
};

export const syncWithServer = ({
  serverModel,
  clientModel = init({ player: null }),
}: {
  ctx: ClientCtx;
  clientModel?: ClientModel;
  serverModel: ServerModel;
}): { model: ClientModel; cmd?: Cmd<ClientMsg> } => {
  const modelNew: ClientModel = {
    ...clientModel,
    ...serverModel,
    columnsUI: clientModel.columnsUI
      ? clientModel.columnsUI
      : serverModel.type === "game"
      ? ColumnsUI.init(serverModel.columns)
      : ColumnsUI.init(),
    vsBotGame: clientModel.vsBotGame
      ? clientModel.vsBotGame
      : VsBotGame.init(
          "columns" in serverModel ? toGameOver(serverModel.columns) : null
        ),
  };

  return watch(modelNew);
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
  _model: ClientModel
): Sub<ClientMsg> => {
  return Sub.None;
};

//
//
//
// View
//
//
//

function toGameOver(columns: Columns): VsBotGame.GameOver {
  const status = toStatus(columns);
  switch (status.type) {
    case "Playing": {
      return { t: null };
    }
    case "Tie": {
      return { t: "draw" };
    }
    case "Winner": {
      return {
        t: "winner",
        winner: status.winner === "player-one" ? "player-one" : "player-two",
      };
    }
  }
}

export const View = ({
  model,
  onQuit,
  ctx,
  dispatch,
}: {
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
  onQuit: () => void;
  ctx: GameSpaceViewCtx;
}) => {
  const vsBotProps: VsBotProps = {
    ctx: ctx,
    onQuit: onQuit,
    title: "Connect Four",
    renderCoverArt: (props) => <ViewCoverArt {...props} />,
    canStartGame: model.player !== null,
    onStartGame: () => dispatch({ t: "start-game" }),
    botVariants: allBotLevels.map((botLevel) => {
      return {
        label: botLevel,
        renderIcon: (props) => renderBotLevel({ level: botLevel, ...props }),
        onSelect: () => dispatch({ t: "input-bot-level", botLevel }),
      };
    }),
    human: {
      player:
        model.userPlayerType === "player-one" ? "player-one" : "player-two",
      userId: model.player,
    },
    bot: {
      label: model.botLevel,
      renderIcon: (props) =>
        renderBotLevel({ level: model.botLevel, ...props }),
    },
    playerOne: {
      label: "Red",
      renderIcon: (props) => <PlayerOneIcon {...props} />,
      onStartPlaying: () =>
        dispatch({ t: "start-playing", playerType: "player-one" }),
      onStopPlaying: () => dispatch({ t: "stop-playing" }),
    },
    playerTwo: {
      label: "Yellow",
      renderIcon: (props) => <PlayerTwoIcon {...props} />,
      onStartPlaying: () =>
        dispatch({ t: "start-playing", playerType: "player-two" }),
      onStopPlaying: () => dispatch({ t: "stop-playing" }),
    },
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

  const turn = toTurn(model.columns);
  const status = toStatus(model.columns);

  return (
    <GameLayout isSpectating={ctx.currentUserId !== model.player}>
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <VsBotPlayerSection {...vsBotGameProps} />

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <LoadingBar
            disabled={
              turn === model.userPlayerType || status.type !== "Playing"
            }
            className="w-full"
            color={gameTheme.primary.dark}
          />
          <ColumnsUI.View
            gameId={model.gameId}
            model={model?.columnsUI}
            implementation="svg"
            columns={model.columns}
            onClick={(columnIndex) =>
              dispatch({ t: "input-move", columnIndex })
            }
          />
          <ViewGameOverOverlay
            {...vsBotGameProps}
            model={model.vsBotGame}
            gameOver={
              status.type === "Tie"
                ? { t: "draw" }
                : status.type === "Winner"
                ? {
                    t: "winner",
                    winner:
                      status.winner === "player-one"
                        ? "player-one"
                        : "player-two",
                  }
                : null
            }
          />
        </div>
      </div>

      <ViewBottomButtonBar
        actions={[
          {
            label: "Exit",
            icon: <IconArrowLeftOnRect />,
            onClick: () => dispatch({ t: "stop-game" }),
          },
          {
            label: "Swap sides",
            icon: <IconRightLeft />,
            onClick: () => dispatch({ t: "swap-sides" }),
          },
          {
            label: "Restart",
            icon: <IconArrowRotateLeft />,
            onClick: () => dispatch({ t: "restart" }),
          },
        ]}
      />
    </GameLayout>
  );
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
      return <IconBotHappy {...props} />;
    }
    case "Medium": {
      return <IconBotLevel1 {...props} />;
    }
    case "Hard": {
      return <IconBotLevel4 {...props} />;
    }
  }
};
