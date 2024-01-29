import {
  GameLayout,
  ViewBottomButtonBar,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import {
  IconBotHappy,
  IconBotLevel1,
  IconBotLevel4,
  VsBotGame,
  VsBotSetup,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/vs-bot";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import {
  EventMeta,
  withId,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { FeedItem } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/feed-item";
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub, TimeSpan } from "gamezilla/@SHARED/core";
import * as ConnectFour from "../../@SHARED/connect-four";
import {
  CoverArt,
  PlayerOneIcon,
  PlayerTwoIcon,
  ViewColumns,
} from "../../@SHARED/connect-four-ui";
import {
  BotLevel,
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  ToClient,
  ToServer,
  allBotLevels,
  reducer,
} from "./vs-bot.core";

//
//
//
//
//
//
//

type Module = GameClientModule<{
  Model: ClientModel;
  Msg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
  Ctx: SpaceClientCtx & { onQuit: () => void };
  OutCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  InEvent: SpaceClientEvent;
  InCmd: null;
  OutEvent: null;
}>;

//
//
//
//

const init: Module["init"] = {
  vsBotSetup: VsBotSetup.init,
  vsBotGame: VsBotGame.init(),
};

//
//
//
//
//

const update: Module["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg(model)(input),
    (model) => updateFromGameEvent(model)(input),
    (model) => watchGameOver(model)(input)
  );
};

const watchGameOver =
  (model: ClientModel): Module["update"] =>
  (input) => {
    const { msgGameEvent, modelGameState } = input;

    if (!msgGameEvent) {
      return { model };
    }

    const modelGameStateNext = reducer({
      msgGameEvent: msgGameEvent,
      modelGameState: modelGameState,
    });

    if (modelGameState.type !== "game" || modelGameStateNext.type !== "game") {
      return { model };
    }

    const statusBefore = ConnectFour.toStatus(modelGameState.columns);

    const status = ConnectFour.toStatus(modelGameStateNext.columns);

    if (statusBefore.type === status.type) {
      return { model };
    }

    switch (status.type) {
      case "Playing": {
        return { model };
      }

      case "Tie": {
        return { model, msgCmd: [playSound(APP_SOUND.alertErrorSm)] };
      }

      case "Winner": {
        if (status.winner === modelGameStateNext.userPlayerType) {
          return {
            model,
            msgCmd: [
              playSound(APP_SOUND.celebration, {
                delay: TimeSpan.fromSeconds(1 / 2),
              }),
            ],
          };
        }
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.alertErrorLg, {
              delay: TimeSpan.fromSeconds(1 / 2),
            }),
          ],
        };
      }
    }
  };

const updateFromGameEvent =
  (model: ClientModel): Module["update"] =>
  (input) => {
    const { msgGameEvent, modelGameState, ctx } = input;

    if (!msgGameEvent) {
      return { model };
    }

    return {
      model,
      msgCmd: updateSound(ctx.currentUserId, modelGameState, msgGameEvent),
    };
  };

const updateFromMsg =
  (model: ClientModel): Module["update"] =>
  (input) => {
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
        const msgGameEvent = withId(msg);
        return { model, msgGameEvent: [msgGameEvent] };
      }
    }
  };

const updateSound = (
  currentUserId: UserId,
  modelGameState: GameState,
  msgGameEvent: GameEvent & EventMeta
): ClientCmd<{
  ToServer: ToServer;
  ClientMsg: ClientMsg;
}>[] => {
  switch (modelGameState.type) {
    case "game": {
      switch (msgGameEvent.t) {
        case "user-dropped-disc": {
          const error = modelGameState.errors[msgGameEvent.msgEventId];

          if (error && msgGameEvent.userId === currentUserId) {
            return [playSound(APP_SOUND.alertErrorSm)];
          }

          return [playSound(APP_SOUND.tap)];
        }

        case "bot-dropped-disc": {
          return [playSound(APP_SOUND.tap)];
        }

        case "user-started-game":
        case "user-swapped-sides":
        case "user-restarted-game": {
          return [playSound(APP_SOUND.navForwardMin)];
        }

        case "user-stopped-game": {
          return [playSound(APP_SOUND.navBackwardMin)];
        }

        default: {
          return [];
        }
      }
    }

    case "setup": {
      switch (msgGameEvent.t) {
        case "user-started-playing":
        case "user-stopped-playing":
        case "user-swapped-sides":
        case "user-changed-bot-level": {
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

const subscriptions: Module["subscriptions"] = (): Sub<ClientMsg> => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export function toGameOver(columns: ConnectFour.Columns): VsBotGame.GameOver {
  const status = ConnectFour.toStatus(columns);
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

const View: Module["View"] = ({ model, ctx, modelGameState, dispatch }) => {
  const vsBotSetupProps: VsBotSetup.VsBotSetupProps = {
    ctx: ctx,
    onQuit: ctx.onQuit,
    title: "Connect Four",
    renderCoverArt: (props) => <CoverArt {...props} />,
    canStartGame: modelGameState.playingUserId !== null,
    onSwapSides: () =>
      dispatch({ t: "user-swapped-sides", userId: ctx.currentUserId }),
    onStartGame: () =>
      dispatch({ t: "user-started-game", userId: ctx.currentUserId }),
    botVariants: allBotLevels.map((botLevel) => {
      return {
        label: botLevel,
        renderIcon: (props) => <ViewBotLevel {...props} level={botLevel} />,
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
        modelGameState.userPlayerType === "player-one"
          ? "player-one"
          : "player-two",
      userId: modelGameState.playingUserId,
    },
    bot: {
      label: modelGameState.botLevel,
      renderIcon: (props) => (
        <ViewBotLevel {...props} level={modelGameState.botLevel} />
      ),
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

  if (!model) {
    return null;
  }

  if (modelGameState.type === "setup") {
    return (
      <VsBotSetup.View
        model={model.vsBotSetup}
        dispatch={(c) => dispatch({ t: "vs-bot-setup", c })}
        {...vsBotSetupProps}
      />
    );
  }

  const status = ConnectFour.toStatus(modelGameState.columns);

  const vsBotGameProps: VsBotGame.VsBotGameProps = {
    ...vsBotSetupProps,
    human: {
      ...vsBotSetupProps.human,
      userId: modelGameState.playingUserId,
    },
    isSpectating: ctx.currentUserId !== modelGameState.playingUserId,
    turn:
      status.type !== "Playing"
        ? null
        : status.turn === "player-one"
        ? "player-one"
        : "player-two",
  };

  const isSpectating = ctx.currentUserId !== modelGameState.playingUserId;

  return (
    <GameLayout isSpectating={isSpectating}>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-1">
        <VsBotGame.VsBotPlayerSection {...vsBotGameProps} />

        <VsBotGame.ViewStatusBar
          {...vsBotSetupProps}
          status={toVsBotStatus(status)}
        />

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <ViewColumns
            gameId={0}
            columns={modelGameState.columns}
            disabled={isSpectating || status.type !== "Playing"}
            onDropDisc={(columnIndex) => {
              dispatch({
                t: "user-dropped-disc",
                columnIndex,
                userId: ctx.currentUserId,
              });
            }}
          />
          {model && (
            <VsBotGame.ViewGameOverOverlay
              {...vsBotGameProps}
              model={model.vsBotGame}
              onPlayAgain={() =>
                dispatch({
                  t: "user-restarted-game",
                  userId: ctx.currentUserId,
                })
              }
              gameOver={toGameOver(modelGameState.columns)}
            />
          )}
        </div>
      </div>

      {ctx.currentUserId === modelGameState.playingUserId && (
        <ViewBottomButtonBar
          actions={[
            {
              label: "Exit",
              icon: <IconArrowLeftOnRect className="h-6 w-6" />,
              onClick: () =>
                dispatch({
                  t: "user-stopped-game",
                  userId: ctx.currentUserId,
                }),
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

function toVsBotStatus(status: ConnectFour.Status): VsBotGame.Status {
  switch (status.type) {
    case "Playing": {
      return { t: "playing", turn: status.turn };
    }
    case "Tie": {
      return { t: "draw" };
    }
    case "Winner": {
      return { t: "winner", winner: status.winner };
    }
  }
}

const ViewFeedItem: Module["ViewFeedItem"] = ({ msgGameEvent, ctx }) => {
  const username =
    "userId" in msgGameEvent
      ? ctx.profiles[msgGameEvent.userId]?.username ?? null
      : null;

  switch (msgGameEvent.t) {
    case "bot-dropped-disc": {
      return <FeedItem.Info text="Bot dropped disc" />;
    }

    case "user-changed-bot-level": {
      return (
        <FeedItem.Info
          text={`${username} changed bot level to ${msgGameEvent.botLevel}`}
        />
      );
    }

    case "user-dropped-disc": {
      if (msgGameEvent.userId === ctx.currentUserId) {
        return <FeedItem.Info text={`${username} dropped disc`} />;
      }

      return <FeedItem.Info text={`${username} dropped disc`} />;
    }
    case "user-restarted-game": {
      return <FeedItem.Info text={`${username} restarted game`} />;
    }
    case "user-started-game": {
      return <FeedItem.Info text={`${username} started game`} />;
    }
    case "user-started-playing": {
      return <FeedItem.Info text={`${username} started playing`} />;
    }
    case "user-stopped-game": {
      return <FeedItem.Info text={`${username} stopped game`} />;
    }
    case "user-stopped-playing": {
      return <FeedItem.Info text={`${username} stopped playing`} />;
    }
    case "user-swapped-sides": {
      return <FeedItem.Info text={`${username} swapped sides`} />;
    }
    case "time-passed": {
      return null;
    }
    case "user-left": {
      return <FeedItem.Info text={`${username} left space`} />;
    }
    default: {
      return null;
    }
  }
};

const ViewBotLevel = ({
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

export const VsBot: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
