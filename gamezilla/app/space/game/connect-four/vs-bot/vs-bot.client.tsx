import { Eff, Posix, Sub, chain } from "gamezilla/@SHARED/core";
import { ClientCmd, sendToServer } from "gamezilla/app/@SHARED/client";
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
  PlayerOneIcon,
  PlayerTwoIcon,
  ViewColumns,
  gameTheme,
} from "../connect-four-ui";
import {
  BotLevel,
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
  allBotLevels,
  appendEvent,
  initCore,
  toState,
  withMeta,
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
  return chain(
    input.model,
    (model) => {
      const { msg } = input;
      switch (msg.t) {
        case "vs-bot-game": {
          const updated = VsBotGame.update(model.vsBotGame, msg.c);
          return { model: { ...model, vsBotGame: updated } };
        }

        case "vs-bot-setup": {
          const updated = VsBotSetup.update(model.vsBotSetup, msg.c);
          return { model: { ...model, vsBotSetup: updated } };
        }

        default: {
          const eventNew = withMeta(msg);

          const modelNew: ClientModel = {
            ...model,
            ...appendEvent(model, eventNew),
          };

          return {
            model: modelNew,
            cmd: [sendToServer(eventNew)],
          };
        }
      }
    },
    (model) => watch({ ...input, model })
  );
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
  return chain(
    input.model,
    (model) => {
      const { msg } = input;
      switch (msg.t) {
        default: {
          const modelNew: ClientModel = {
            ...model,
            ...appendEvent(model, msg),
          };

          return { model: modelNew };
        }
      }
    },
    (model) => watch({ ...input, model })
  );
};

const watch = ({
  model,
  ctx,
}: {
  ctx: SpaceClientCtx;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<ToServer>[];
} => {
  const state = toState(ctx, model);
  const vsBotGame = VsBotGame.watch(
    model.vsBotGame,
    "columns" in state ? toGameOver(state.columns) : undefined
  );

  return {
    model: {
      ...model,
      vsBotGame: vsBotGame.model,
    },
    eff: Eff.batch<ClientMsg>([Eff.t("vs-bot-game", vsBotGame.eff)]),
  };
};

export const mergeWithServer = ({
  serverModel,
  ctx,
  clientModel = init({ player: null }),
}: {
  ctx: SpaceClientCtx;
  clientModel?: ClientModel;
  serverModel: ServerModel;
}): { model: ClientModel; eff?: Eff<ClientMsg> } => {
  const serverState = toState(ctx, serverModel);

  const modelNew: ClientModel = {
    ...clientModel,
    ...serverModel,
    vsBotGame: clientModel.vsBotGame
      ? clientModel.vsBotGame
      : VsBotGame.init(
          "columns" in serverState ? toGameOver(serverState.columns) : null
        ),
  };

  return watch({ ctx, model: modelNew });
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
  model: model_,
  onQuit,
  ctx,
  dispatch,
}: {
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
  onQuit: () => void;
  ctx: SpaceViewCtx;
}) => {
  const model = toState(ctx, model_);

  const vsBotProps: VsBotProps = {
    ctx: ctx,
    onQuit: onQuit,
    title: "Connect Four",
    renderCoverArt: (props) => <ViewCoverArt {...props} />,
    canStartGame: model.player !== null,
    onStartGame: () =>
      dispatch({ t: "user-started-game", userId: ctx.currentUserId }),
    botVariants: allBotLevels.map((botLevel) => {
      return {
        label: botLevel,
        renderIcon: (props) => renderBotLevel({ level: botLevel, ...props }),
        onSelect: () =>
          dispatch(
            withMeta({
              t: "user-changed-bot-level",
              botLevel,
              userId: ctx.currentUserId,
            })
          ),
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
        dispatch({
          t: "user-started-playing",
          playerType: "player-one",
          userId: ctx.currentUserId,
        }),
      onStopPlaying: () =>
        dispatch({ t: "user-stopped-playing", userId: ctx.currentUserId }),
    },
    playerTwo: {
      label: "Yellow",
      renderIcon: (props) => <PlayerTwoIcon {...props} />,
      onStartPlaying: () =>
        dispatch({
          t: "user-started-playing",
          playerType: "player-two",
          userId: ctx.currentUserId,
        }),
      onStopPlaying: () =>
        dispatch({ t: "user-stopped-playing", userId: ctx.currentUserId }),
    },
  };

  if (model.type === "setup") {
    return (
      <VsBotSetup.View
        model={model_.vsBotSetup}
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

          <ViewColumns
            gameId={model.gameId}
            columns={model.columns}
            disabled={ctx.currentUserId !== model.player}
            onClick={(columnIndex) => {
              dispatch({ t: "user-dropped-disc", columnIndex });
            }}
          />

          <ViewGameOverOverlay
            {...vsBotGameProps}
            model={model_.vsBotGame}
            onPlayAgain={() =>
              dispatch({ t: "user-restarted-game", userId: ctx.currentUserId })
            }
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
              onClick: () =>
                dispatch({ t: "user-stopped-game", userId: ctx.currentUserId }),
            },
            {
              label: "Swap sides",
              icon: <IconRightLeft className="h-6 w-6" />,
              onClick: () =>
                dispatch({
                  t: "user-swapped-sides",
                  userId: ctx.currentUserId,
                }),
            },
            {
              label: "Restart",
              icon: <IconArrowRotateLeft className="h-6 w-6" />,
              onClick: () =>
                dispatch({
                  t: "user-restarted-game",
                  userId: ctx.currentUserId,
                }),
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
