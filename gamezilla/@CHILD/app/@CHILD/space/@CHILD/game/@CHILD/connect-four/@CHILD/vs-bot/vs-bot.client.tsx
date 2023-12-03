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
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED";
import {
  GameClient,
  SpaceClientCtx,
  SpaceClientEvt,
  SpaceViewCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
  LoadingBar,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub, TimeSpan } from "gamezilla/@SHARED/core";
import { EventMeta, withMeta$ } from "gamezilla/@SHARED/event-stream";
import { Columns, toStatus, toTurn } from "../../@SHARED/connect-four";
import {
  CoverArt,
  PlayerOneIcon,
  PlayerTwoIcon,
  ViewColumns,
  gameTheme,
} from "../../@SHARED/connect-four-ui";
import {
  BotLevel,
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  ToClient,
  ToServer,
  allBotLevels
} from "./vs-bot.core";

type Client = GameClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
  ClientCtx: SpaceClientCtx;
  ViewCtx: SpaceViewCtx & { onQuit: () => void };
  ClientCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  ClientEvt: SpaceClientEvt;
}>;

//
//
//
//

export const init: Client["init"] = ({ model }) => {
  if (model) {
    return { model };
  }

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
  return GameClient.chain(
    init(input),
    (model) => {
      const { msg } = input;
      if (!msg) {
        return { model };
      }

      switch (msg.t) {
        case "vs-bot-game": {
          return {
            model: {
              ...model,
              vsBotGame: VsBotGame.update(model.vsBotGame, msg.c),
            },
          };
        }

        case "vs-bot-setup": {
          return {
            model: {
              ...model,
              vsBotSetup: VsBotSetup.update(model.vsBotSetup, msg.c),
            },
          };
        }

        default: {
          const event = withMeta$(msg);
          return { model, gameEvent: [event] };
        }
      }
    },
    (model) => {
      const { gameEvent } = input;

      if (!gameEvent) {
        return { model };
      }

      return {
        model,
        cmd: eventToSound(input.state, gameEvent),
      };
    },
    (model) => {
      const { state, stateBefore } = input;

      if (stateBefore.type !== "game" || state.type !== "game") {
        return { model };
      }

      const statusBefore = toStatus(stateBefore.columns);

      const status = toStatus(state.columns);

      if (statusBefore.type === status.type) {
        return { model };
      }

      switch (status.type) {
        case "Playing": {
          return { model };
        }

        case "Tie": {
          return { model, cmd: [playSound(APP_SOUND.alertErrorSm)] };
        }

        case "Winner": {
          if (status.winner === state.userPlayerType) {
            return {
              model,
              cmd: [
                playSound(APP_SOUND.celebration, {
                  delay: TimeSpan.fromSeconds(1 / 2),
                }),
              ],
            };
          }
          return {
            model,
            cmd: [
              playSound(APP_SOUND.alertErrorLg, {
                delay: TimeSpan.fromSeconds(1 / 2),
              }),
            ],
          };
        }
      }
    }
  );
};

const eventToSound = (
  state: GameState,
  event: GameEvent & EventMeta
): ClientCmd<{
  ToServer: ToServer;
  ClientMsg: ClientMsg;
}>[] => {
  const error = state.errors[event.eventId]

  if (error) {
    return [playSound(APP_SOUND.alertErrorSm)];
  }

  switch (event.t) {
    case "user-started-playing":
    case "user-stopped-playing":
    case "user-changed-bot-level": {
      return [playSound(APP_SOUND.tap)];
    }

    case "user-dropped-disc":
    case "bot-dropped-disc": {
      return [playSound(APP_SOUND.tap)];
    }

    case "user-swapped-sides":
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

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = (
  _input
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

export function toGameOver(columns: Columns): VsBotGame.GameOver {
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

export const View: Client["View"] = ({ model, ctx, state, dispatch }) => {
  const vsBotProps: VsBotProps = {
    ctx: ctx,
    onQuit: ctx.onQuit,
    title: "Connect Four",
    renderCoverArt: (props) => <CoverArt {...props} />,
    canStartGame: state.playingUserId !== null,
    onSwapSides: () =>
      dispatch({ t: "user-swapped-sides", userId: ctx.currentUserId }),
    onStartGame: () =>
      dispatch({ t: "user-started-game", userId: ctx.currentUserId }),
    botVariants: allBotLevels.map((botLevel) => {
      return {
        label: botLevel,
        renderIcon: (props) => renderBotLevel({ level: botLevel, ...props }),
        onSelect: () =>
          dispatch({
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

  if (state.type === "setup") {
    if (!model) {
      return null;
    }
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
      <div class="flex w-full flex-1 flex-col items-center justify-center">
        <VsBotPlayerSection {...vsBotGameProps} />

        <div class="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <LoadingBar
            disabled={
              turn === state.userPlayerType || status.type !== "Playing"
            }
            class="w-full"
            color={gameTheme.primary.dark}
          />
          <ViewColumns
            gameId={0}
            columns={state.columns}
            disabled={ctx.currentUserId !== state.playingUserId}
            onDropDisc={(columnIndex) => {
              dispatch({
                t: "user-dropped-disc",
                columnIndex,
                userId: ctx.currentUserId,
              });
            }}
          />
          {model && (
            <ViewGameOverOverlay
              {...vsBotGameProps}
              model={model.vsBotGame}
              onPlayAgain={() =>
                dispatch({
                  t: "user-restarted-game",
                  userId: ctx.currentUserId,
                })
              }
              gameOver={toGameOver(state.columns)}
            />
          )}
        </div>
      </div>

      {ctx.currentUserId === state.playingUserId && (
        <ViewBottomButtonBar
          actions={[
            {
              label: "Exit",
              icon: <IconArrowLeftOnRect class="h-6 w-6" />,
              onClick: () =>
                dispatch({
                  t: "user-stopped-game",
                  userId: ctx.currentUserId,
                }),
            },
            {
              label: "Swap sides",
              icon: <IconRightLeft class="h-6 w-6" />,
              onClick: () =>
                dispatch({
                  t: "user-swapped-sides",
                  userId: ctx.currentUserId,
                }),
            },
            {
              label: "Restart",
              icon: <IconArrowRotateLeft class="h-6 w-6" />,
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
