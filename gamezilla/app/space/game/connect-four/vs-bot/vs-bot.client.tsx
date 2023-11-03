import { Eff, Sub, chain } from "gamezilla/@SHARED/core";
import { APP_SOUND, ClientCmd, playSound } from "gamezilla/app/@SHARED/client";
import {
  Drawer,
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
  LoadingBar,
  cn,
} from "gamezilla/app/@SHARED/ui";
import {
  GameClient,
  SpaceViewCtx,
  ViewActivityFeedItem,
} from "gamezilla/app/space/@SHARED";
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
import { Columns, toStatus, toTurn } from "../@SHARED/connect-four";
import {
  PlayerOneIcon,
  PlayerTwoIcon,
  ViewColumns,
  gameTheme,
} from "../@SHARED/connect-four-ui";
import { ViewCoverArt } from "../connect-four-cover-art";
import {
  BotLevel,
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  ToClient,
  ToServer,
  allBotLevels,
  eventErrorToString,
} from "./vs-bot.core";

type Client = GameClient<
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  GameState,
  GameEvent,
  SpaceViewCtx & { onQuit: () => void }
>;

//
//
//
//

export const init: Client["init"] = () => {
  return {
    model: {
      opened: null,
      vsBotSetup: VsBotSetup.init,
      vsBotGame: VsBotGame.init(),
    },
  };
};

//
//
//
//
//

export const update: Client["update"] = (input) => {
  return chain(
    input,
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

        case "opened-activity-feed-drawer": {
          return { model: { ...model, opened: "activity-feed-drawer" } };
        }
        case "closed-activity-feed-drawer": {
          return { model: { ...model, opened: null } };
        }
      }
    },
    (model) => watch({ ...input, model })
  );
};

export const updateFromServer: Client["updateFromServer"] = (input) => {
  return chain(
    input.model ? { model: input.model } : init(input),
    (model) => {
      const { msg } = input;
      switch (msg.t) {
        default: {
          return { model };
        }
      }
    },
    (model) => watch({ ...input, model })
  );
};

export const updateFromGame: Client["updateFromGame"] = (input) => {
  const { model, msg } = input;

  return chain(
    model ? { model } : init(input),
    (model) => {
      const soundCmd = eventToSound(msg);
      return {
        model,
        cmd: soundCmd,
      };
    },

    (model) => {
      return watch({ ...input, model });
    }
  );
};

const eventToSound = (event: GameEvent): ClientCmd<ToServer>[] => {
  switch (event.t) {
    case "user-started-playing":
    case "user-stopped-playing":
    case "user-dropped-disc":
    case "user-changed-bot-level":
    case "user-swapped-sides":
    case "bot-dropped-disc": {
      return [playSound(APP_SOUND.tap)];
    }

    case "user-restarted-game":
    case "user-started-game": {
      return [playSound(APP_SOUND.navForwardMin)];
    }

    case "user-stopped-game": {
      return [playSound(APP_SOUND.navBackwardMin)];
    }

    default: {
      return [];
    }
  }
};

export const updateFromEvent: Client["updateFromEvent"] = (input) => {
  return input;
};

const watch = ({
  model,
  state,
}: {
  state: GameState;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<ToServer>[];
} => {
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

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = (
  input
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

export const View: Client["View"] = ({
  model,
  ctx,
  state,
  dispatch,
  dispatchEvent,
}) => {
  const vsBotProps: VsBotProps = {
    ctx: ctx,
    onQuit: ctx.onQuit,
    title: "Connect Four",
    renderCoverArt: (props) => <ViewCoverArt {...props} />,
    canStartGame: state.playingUserId !== null,
    onSwapSides: () =>
      dispatchEvent({ t: "user-swapped-sides", userId: ctx.currentUserId }),
    onStartGame: () =>
      dispatchEvent({ t: "user-started-game", userId: ctx.currentUserId }),
    botVariants: allBotLevels.map((botLevel) => {
      return {
        label: botLevel,
        renderIcon: (props) => renderBotLevel({ level: botLevel, ...props }),
        onSelect: () =>
          dispatchEvent({
            t: "user-changed-bot-level",
            botLevel,
            userId: ctx.currentUserId,
          }),
      };
    }),
    human: {
      player:
        state.userPlayerType === "player-one" ? "player-one" : "player-two",
      userId: state.playingUserId,
    },
    bot: {
      label: state.botLevel,
      renderIcon: (props) =>
        renderBotLevel({ level: state.botLevel, ...props }),
    },
    playerOne: {
      label: "Red",
      renderIcon: (props) => <PlayerOneIcon {...props} />,
      onStartPlaying: () =>
        dispatchEvent({
          t: "user-started-playing",
          playerType: "player-one",
          userId: ctx.currentUserId,
        }),
      onStopPlaying: () =>
        dispatchEvent({ t: "user-stopped-playing", userId: ctx.currentUserId }),
    },
    playerTwo: {
      label: "Yellow",
      renderIcon: (props) => <PlayerTwoIcon {...props} />,
      onStartPlaying: () =>
        dispatchEvent({
          t: "user-started-playing",
          playerType: "player-two",
          userId: ctx.currentUserId,
        }),
      onStopPlaying: () =>
        dispatchEvent({ t: "user-stopped-playing", userId: ctx.currentUserId }),
    },
  };

  if (state.type === "setup") {
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
      userId: state.playingUserId,
    },
  };

  const turn = toTurn(state.columns);
  const status = toStatus(state.columns);

  return (
    <GameLayout isSpectating={ctx.currentUserId !== state.playingUserId}>
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <VsBotPlayerSection {...vsBotGameProps} />

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <LoadingBar
            disabled={
              turn === state.userPlayerType || status.type !== "Playing"
            }
            className="w-full"
            color={gameTheme.primary.dark}
          />

          <ViewColumns
            gameId={0}
            columns={state.columns}
            disabled={ctx.currentUserId !== state.playingUserId}
            onDropDisc={(columnIndex) => {
              dispatchEvent({
                t: "user-dropped-disc",
                columnIndex,
                userId: ctx.currentUserId,
              });
            }}
          />

          <ViewGameOverOverlay
            {...vsBotGameProps}
            model={model.vsBotGame}
            onPlayAgain={() =>
              dispatchEvent({
                t: "user-restarted-game",
                userId: ctx.currentUserId,
              })
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

      {ctx.currentUserId === state.playingUserId && (
        <ViewBottomButtonBar
          actions={[
            {
              label: "Exit",
              icon: <IconArrowLeftOnRect className="h-6 w-6" />,
              onClick: () =>
                dispatchEvent({
                  t: "user-stopped-game",
                  userId: ctx.currentUserId,
                }),
            },
            {
              label: "Swap sides",
              icon: <IconRightLeft className="h-6 w-6" />,
              onClick: () =>
                dispatchEvent({
                  t: "user-swapped-sides",
                  userId: ctx.currentUserId,
                }),
            },
            {
              label: "Restart",
              icon: <IconArrowRotateLeft className="h-6 w-6" />,
              onClick: () =>
                dispatchEvent({
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

export const viewEvent: Client["viewEvent"] = ({ event, ctx }) => {
  const username =
    "userId" in event ? ctx.profiles[event.userId]?.username ?? null : null;

  switch (event.t) {
    case "bot-dropped-disc": {
      return {
        text: "Bot dropped disc",
      };
    }
    case "user-changed-bot-level": {
      return { text: `${username} changed bot level to ${event.botLevel}` };
    }
    case "user-dropped-disc": {
      if (event.userId === ctx.currentUserId) {
        return { text: "You dropped disc" };
      }

      return { text: `${username} dropped disc` };
    }
    case "user-restarted-game": {
      return { text: `${username} restarted game` };
    }
    case "user-started-game": {
      return { text: `${username} started game` };
    }
    case "user-started-playing": {
      return { text: `${username} started playing` };
    }
    case "user-stopped-game": {
      return { text: `${username} stopped game` };
    }
    case "user-stopped-playing": {
      return { text: `${username} stopped playing` };
    }
    case "user-swapped-sides": {
      return { text: `${username} swapped sides` };
    }
    case "time-passed": {
      return null;
    }
    case "user-left": {
      return { text: `${username} left` };
    }
  }
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
