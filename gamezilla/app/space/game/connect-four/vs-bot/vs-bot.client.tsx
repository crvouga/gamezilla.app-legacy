import { Eff, Sub, chain } from "gamezilla/@SHARED/core";
import { ClientCmd } from "gamezilla/app/@SHARED/client";
import {
  Drawer,
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
  LoadingBar,
  cn,
} from "gamezilla/app/@SHARED/ui";
import {
  SpaceClientCtx,
  GameClient,
  SpaceViewCtx,
} from "gamezilla/app/space/@SHARED";
import { EventMeta } from "gamezilla/app/space/@SHARED/evt";
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
import { ViewCoverArt } from "../connect-four-cover-art";
import {
  PlayerOneIcon,
  PlayerTwoIcon,
  ViewColumns,
  gameTheme,
} from "../@SHARED/connect-four-ui";
import {
  BotLevel,
  ClientModel,
  ClientMsg,
  Event,
  State,
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
  State,
  Event,
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
      vsBotGame: VsBotGame.init(null),
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
    input.model,
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
  const { model } = input;
  if (model) {
    return { model };
  }
  return init(input);
};

export const updateFromEvent: Client["updateFromEvent"] = (input) => {
  return input;
};

const watch = ({
  model,
  state,
}: {
  state: State;
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
      <div className="flex h-full w-full flex-col">
        <ViewActivityFeedBar
          dispatch={dispatch}
          state={state}
          model={model}
          ctx={ctx}
        />

        <VsBotSetup.View
          model={model.vsBotSetup}
          dispatch={(c) => dispatch({ t: "vs-bot-setup", c })}
          {...vsBotProps}
        />
      </div>
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
    <div className="flex w-full flex-1 flex-col">
      <ViewActivityFeedBar
        dispatch={dispatch}
        state={state}
        model={model}
        ctx={ctx}
      />
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
    </div>
  );
};

export const ViewEvent: Client["ViewEvent"] = (input) => {
  return null;
};

const ViewActivityFeedBar = ({
  model,
  ctx,
  state,
  dispatch,
}: {
  dispatch: (m: ClientMsg) => void;
  state: State;
  model: ClientModel;
  ctx: SpaceViewCtx;
}) => {
  const events: (Event & EventMeta)[] = [];
  const latestEvent = events.findLast(
    (e) => toActivityFeedItemUI({ event: e, ctx, state }) !== null
  );
  if (!latestEvent) {
    return null;
  }
  return (
    <>
      <button
        className="flex w-full items-center justify-start text-center"
        onClick={() => dispatch({ t: "opened-activity-feed-drawer" })}>
        <ViewActivityFeedItem event={latestEvent} ctx={ctx} state={state} />
      </button>
      <Drawer
        id="activity-feed-drawer"
        open={model.opened === "activity-feed-drawer"}
        onClose={() => dispatch({ t: "closed-activity-feed-drawer" })}>
        <div className="pb-4ya flex max-h-72 w-full flex-col justify-end overflow-y-scroll text-left">
          {events.map((event) => {
            return (
              <ViewActivityFeedItem
                key={event.eventId}
                ctx={ctx}
                event={event}
                state={state}
              />
            );
          })}
        </div>
      </Drawer>
    </>
  );
};

const toActivityFeedItemUI = ({
  event,
  ctx,
  state,
}: {
  ctx: SpaceViewCtx;
  event: Event & EventMeta;
  state: State;
}): {
  text: string;
  variant?: "error";
} | null => {
  const username =
    "userId" in event ? ctx.profiles[event.userId]?.username ?? null : null;

  switch (event.t) {
    case "bot-dropped-disc": {
      const errored = state.errors[event.eventId];
      if (errored) {
        return null;
      }
      return { text: "Bot dropped disc" };
    }
    case "user-changed-bot-level": {
      return { text: `${username} changed bot level to ${event.botLevel}` };
    }
    case "user-dropped-disc": {
      const errored = state.errors[event.eventId];

      if (event.userId === ctx.currentUserId) {
        if (errored) {
          return { variant: "error", text: eventErrorToString(errored) };
        }
        return { text: "You dropped disc" };
      }

      if (errored) {
        return null;
      }

      return { text: `${username} dropped disc` };
    }
    case "user-restarted-game": {
      const errored = state.errors[event.eventId];

      if (errored) {
        return null;
      }

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

const ViewActivityFeedItem = ({
  event,
  ctx,
  state,
}: {
  ctx: SpaceViewCtx;
  event: Event & EventMeta;
  state: State;
}) => {
  const itemUI = toActivityFeedItemUI({
    event,
    ctx,
    state,
  });
  return itemUI ? <Item text={itemUI.text} variant={itemUI.variant} /> : null;
};

const Item = ({
  text,
  variant,
}: {
  text: string;
  variant?: "error" | "normal";
}) => {
  return (
    <div
      className={cn(
        "w-full p-2 text-sm text-secondary",
        variant === "error" && "text-orange-500"
      )}>
      {text}
    </div>
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
