import { Eff, Posix, Sub, andThen, p } from "gamezilla/@SHARED/core";
import {
  APP_SOUND,
  ClientCmd,
  ClientCtx,
  playSound,
  sendToServer,
} from "gamezilla/app/@SHARED/client";
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
  LoadingBar,
} from "gamezilla/app/@SHARED/ui";
import { SpaceClientCtx, SpaceViewCtx } from "gamezilla/app/space/@SHARED";
import {
  GameLayout,
  IconBotHappy,
  IconBotLevel1,
  IconBotLevel4,
  ViewBottomButtonBar,
  ViewGameOverOverlay,
  VsBotGame,
  VsBotPlayerSection,
  VsBotProps,
  VsBotSetup,
} from "gamezilla/app/space/game/@SHARED";

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
  ServerModel,
  ToClient,
  ToServer,
  Req,
  allBotLevels,
  initCore,
  updateCore,
  updateCoreEvent,
} from "./vs-bot.core";

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

export const update = (input: {
  ctx: SpaceClientCtx;
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
  eff?: Eff<ClientMsg>;
} => {
  return p(updateMain(input), andThen(watch));
};

const updateMain: typeof update = ({ ctx, msg, model }) => {
  switch (msg.t) {
    case "columns-ui": {
      const updated = ColumnsUI.update(model.columnsUI, msg.c);
      return { model: { ...model, columnsUI: updated } };
    }

    case "vs-bot-game": {
      const updated = VsBotGame.update(model.vsBotGame, msg.c);
      return { model: { ...model, vsBotGame: updated } };
    }

    case "vs-bot-setup": {
      const updated = VsBotSetup.update(model.vsBotSetup, msg.c);
      return { model: { ...model, vsBotSetup: updated } };
    }

    default: {
      const result = updateCore({ ctx, msg, model });

      if (result.t === "err") {
        return { model, cmd: [sendToServer(msg)] };
      }

      return {
        model: { ...model, ...result.value },
        cmd: [sendToServer(msg), ...msgToSoundCmd(msg)],
      };
    }
  }
};

const watch = (model: ClientModel) => {
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
    eff: Eff.batch<ClientMsg>([
      Eff.t("vs-bot-game", vsBotGame.eff),
      Eff.t("columns-ui", columnsUI.eff),
    ]),
  };
};

export const updateFromServer = (input: {
  ctx: SpaceClientCtx;
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<ToServer>[];
} => {
  return p(updateFromServerMain(input), andThen(watch));
};

const updateFromServerMain: typeof updateFromServer = ({ ctx, msg, model }) => {
  switch (msg.t) {
    case "player-left":
    case "bot-moved": {
      const result = updateCoreEvent({ msg, model });

      if (result.t === "err") {
        return { model };
      }

      return { model: { ...model, ...result.value } };
    }

    default: {
      const result = updateCore({ ctx, msg, model });

      if (result.t === "err") {
        return { model };
      }

      return { model: { ...model, ...result.value } };
    }
  }
};

const msgToSoundCmd = (msg: Req): ClientCmd<ToServer>[] => {
  switch (msg.t) {
    case "input-move": {
      return [];
    }
    case "stop-game": {
      return [playSound(APP_SOUND.navBackwardMin)];
    }
    case "start-game": {
      return [playSound(APP_SOUND.navForwardMin)];
    }
    default: {
      return [playSound(APP_SOUND.tap)];
    }
  }
};

export const mergeWithServer = ({
  serverModel,
  clientModel = init({ player: null }),
}: {
  ctx: ClientCtx;
  clientModel?: ClientModel;
  serverModel: ServerModel;
}): { model: ClientModel; eff?: Eff<ClientMsg> } => {
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
  ctx: SpaceViewCtx;
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
            implementation="element"
            columns={model.columns}
            disabled={ctx.currentUserId !== model.player}
            onClick={(columnIndex) => {
              dispatch({ t: "input-move", columnIndex });
            }}
          />

          <ViewGameOverOverlay
            {...vsBotGameProps}
            model={model.vsBotGame}
            onPlayAgain={() => dispatch({ t: "restart" })}
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

      {ctx.currentUserId === model.player && (
        <ViewBottomButtonBar
          actions={[
            {
              label: "Exit",
              icon: <IconArrowLeftOnRect className="h-6 w-6" />,
              onClick: () => dispatch({ t: "stop-game" }),
            },
            {
              label: "Swap sides",
              icon: <IconRightLeft className="h-6 w-6" />,
              onClick: () => dispatch({ t: "swap-sides" }),
            },
            {
              label: "Restart",
              icon: <IconArrowRotateLeft className="h-6 w-6" />,
              onClick: () => dispatch({ t: "restart" }),
            },
          ]}
        />
      )}
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
