import {
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import {
  FeedItem,
  SpaceViewCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  ClientEvt,
  RouteGameSpace,
  ViewCtx,
  addProfiles,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Button,
  Drawer,
  IconHome,
  IconUserGroup,
  IconXMark,
  MyAvatar,
  VDom,
  Transition,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub, chain } from "gamezilla/@SHARED/core";
import { withMeta$ } from "gamezilla/@SHARED/event-stream";
import { CoverArt } from "./@CHILD/game/game-cover-art";
import * as GameClient from "./@CHILD/game/game.client";
import { updateFromEvents } from "./space-client/update-from-events";
import { updateFromGame } from "./space-client/update-from-game";
import { ViewNotInGameScreen } from "./space-client/view-not-in-game-screen";
import { ViewSpaceJoinScreen } from "./space-client/view-space-join-screen";
import { ViewSpaceListScreen } from "./space-client/view-space-list-screen";
import {
  ClientModel,
  ClientMsg,
  Event,
  EventWithMeta,
  SpaceStateStarted,
  ToClient,
  ToServer,
  initCore,
  mergeModels,
  toSpaceState,
  toStartedSpace,
  toState,
  toUserState,
} from "./space.core";

//
//
//
// Model
//
//
//

export const init = ({
  stored,
}: {
  stored: ClientModel | null;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  if (stored) {
    return {
      model: stored,
    };
  }
  return {
    model: {
      ...initCore(),
      games: {},
      modal: null,
      previewUserId: null,
    },
  };
};

//
//
//
// Update
//
//
//

export const update = ({
  msg,
  model,
  ctx,
}: {
  ctx: ClientCtx | AnonymousClientCtx;
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  evt?: ClientEvt[];
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  switch (msg.t) {
    case "closed-modal": {
      return { model: { ...model, modal: null } };
    }

    case "clicked-people-button": {
      return { model: { ...model, modal: "users" } };
    }

    case "clicked-user": {
      return {
        model: { ...model, previewUserId: msg.userId, modal: "user-preview" },
      };
    }

    case "game": {
      const space = toStartedSpace(model, msg.spaceId);

      if (!space || !space.game || !ctx.currentUserId) {
        return { model };
      }

      const updatedGame = GameClient.update({
        ctx: { ...ctx, currentUserId: ctx.currentUserId, space: space },
        msg: msg.c,
        model: model.games[msg.spaceId],
        state: space.game,
        stateBefore: space.game,
      });

      const eventsNew =
        updatedGame.gameEvent?.map(
          (c): EventWithMeta => ({ ...c, t: "game", c, spaceId: msg.spaceId })
        ) ?? [];

      return chain(
        { model },
        (model) => {
          return updateFromGame({
            model,
            spaceId: msg.spaceId,
            updated: updatedGame,
          });
        },
        (model) => {
          return updateFromEvents({ ctx, events: eventsNew, model });
        }
      );
    }

    default: {
      return updateFromEvents({ ctx, events: [msg.c], model });
    }
  }
};

export const updateFromServer = ({
  ctx,
  msg,
  model,
}: {
  ctx: ClientCtx | AnonymousClientCtx;
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  evt?: ClientEvt[];
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  return chain(
    { model },
    (model) => {
      return {
        model,
        cmd: msg.profiles ? [addProfiles(msg.profiles)] : [],
      };
    },
    (model): ReturnType<typeof updateFromServer> => {
      switch (msg.t) {
        case "sync": {
          const merged = mergeModels(model, {
            events: msg.events,
            initialState: model.initialState,
          });

          return { model: { ...model, ...merged } };
        }

        case "game": {
          const space = toStartedSpace(model, msg.spaceId);

          if (!space || !space.game || !ctx.currentUserId) {
            return { model };
          }

          const updatedGame = GameClient.update({
            ctx: { ...ctx, space: space, currentUserId: ctx.currentUserId },
            model: model.games[msg.spaceId],
            serverMsg: msg.c,
            state: space.game,
            stateBefore: space.game,
          });

          const eventsNew =
            updatedGame.gameEvent?.map(
              (e): EventWithMeta => ({
                ...e,
                spaceId: msg.spaceId,
                t: "game",
                c: e,
              })
            ) ?? [];

          return chain(
            { model },
            (model) => {
              return updateFromGame({
                model,
                spaceId: msg.spaceId,
                updated: updatedGame,
              });
            },
            (model) => {
              return updateFromEvents({ ctx, events: eventsNew, model });
            }
          );
        }

        case "event": {
          return updateFromEvents({ ctx, events: [msg.c], model });
        }
      }
    }
  );
};

export const updateFromEvent = (input: {
  ctx: ClientCtx | AnonymousClientCtx;
  msg: ClientEvt;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  return chain(input, (model) => {
    const { msg } = input;

    switch (msg.t) {
      case "routing/route-changed": {
        return { model: { ...model, modal: null } };
      }

      case "wire/server-connected": {
        const currentUserId = input.ctx.currentUserId;
        const currentUserProfile = currentUserId
          ? input.ctx.profiles[currentUserId]
          : null;
        return {
          model,
          cmd: [
            sendToServer({
              t: "sync",
              events: model.events,
              profiles: currentUserProfile
                ? {
                    [currentUserProfile.userId]: currentUserProfile,
                  }
                : {},
            }),
          ],
        };
      }

      default: {
        return input;
      }
    }
  });
};

//
//
//
//
// Subscriptions
//
//
//
//

export const subscriptions = (
  ctx: AnonymousClientCtx,
  model: ClientModel
): Sub<ClientMsg> => {
  const { currentUserId } = ctx;

  if (!currentUserId) {
    return Sub.None;
  }

  const clientCtx = {
    ...ctx,
    currentUserId,
  };

  const subs: Sub<ClientMsg>[] = [];

  const state = toState(model);

  for (const spaceId in state.active) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }

    const space = toStartedSpace(model, spaceId);

    if (!space?.game) {
      continue;
    }

    const sub = Sub.map(
      GameClient.subscriptions({
        ctx: { ...clientCtx, space: space },
        state: space.game,
        model: model.games[spaceId],
        intervalId: spaceId,
      }),
      (c): ClientMsg => ({ t: "game", c, spaceId })
    );

    subs.push(sub);
  }

  return Sub.batch(subs);
};

//
//
//
//
// View
//
//
//
//

export const View = ({
  ctx,
  dispatch,
  model,
  route,
  viewBottomBar,
}: {
  model: ClientModel;
  ctx: ViewCtx;
  dispatch: (m: ClientMsg) => void;
  route: RouteGameSpace;
  viewBottomBar: VDom;
}): VDom => {
  const dispatchEvent = (m: Event) => {
    dispatch({
      t: "event",
      c: withMeta$(m),
    });
  };
  switch (route.t) {
    case "space-list": {
      return (
        <>
          <ViewSpaceListScreen dispatch={dispatch} ctx={ctx} model={model} />
          {viewBottomBar}
        </>
      );
    }

    case "space": {
      return (
        <ViewSpaceScreen
          dispatchEvent={dispatchEvent}
          spaceId={route.spaceId}
          ctx={ctx}
          dispatch={dispatch}
          model={model}
        />
      );
    }
  }
};

const ViewSpaceScreen = ({
  ctx,
  dispatchEvent,
  dispatch,
  model,
  spaceId,
}: {
  model: ClientModel;
  ctx: ViewCtx;
  dispatchEvent: (m: Event) => void;
  dispatch: (m: ClientMsg) => void;
  spaceId: SpaceId;
}) => {
  const space = toSpaceState(model, spaceId);

  switch (space.type) {
    case "ended": {
      return <ViewSpaceEnded ctx={ctx} />;
    }

    case "initial": {
      return <ViewSpaceNotFound ctx={ctx} />;
    }

    case "started": {
      return (
        <ViewSpaceStarted
          ctx={ctx}
          dispatchEvent={dispatchEvent}
          dispatch={dispatch}
          model={model}
          space={space}
        />
      );
    }
  }
};

const ViewSpaceStarted = ({
  ctx,
  dispatchEvent,
  dispatch,
  model,
  space,
}: {
  model: ClientModel;
  ctx: ViewCtx;
  dispatchEvent: (m: Event) => void;
  dispatch: (m: ClientMsg) => void;
  space: SpaceStateStarted;
}) => {
  const spaceCtx: SpaceViewCtx = {
    ...ctx,
    space: space,
    viewProfile: (userId) => {
      dispatch({ t: "clicked-user", userId: userId });
    },
    quit: () => {
      dispatchEvent({
        t: "user-inputted-game",
        spaceId: space.spaceId,
        userId: ctx.currentUserId,
        game: null,
      });
    },
  };

  return (
    <>
      <ViewSpaceScreenMain
        space={space}
        dispatchEvent={dispatchEvent}
        dispatch={dispatch}
        model={model}
        ctx={spaceCtx}
      />

      <Drawer
        position="bottom"
        id="users"
        open={model.modal === "users"}
        onClose={() => dispatch({ t: "closed-modal" })}
      >
        <ViewUsersInSpaceList ctx={spaceCtx} />
      </Drawer>

      <Drawer
        position="bottom"
        id="user-preview"
        open={model.modal === "user-preview"}
        onClose={() => dispatch({ t: "closed-modal" })}
      >
        <div>
          <button
            class="flex w-full flex-col items-center justify-center gap-2 p-4"
            onClick={() => {
              if (model.previewUserId) {
                ctx.push({
                  t: "profile",
                  c: {
                    t: "profile",
                    userId: model.previewUserId,
                  },
                });
              }
            }}
          >
            <MyAvatar
              src={
                model.previewUserId
                  ? ctx.profiles[model.previewUserId]?.avatarUrl
                  : undefined
              }
              class="h-24 w-24"
            />
            <p class="text-xl font-semibold">
              {model.previewUserId
                ? ctx.profiles[model.previewUserId]?.username ?? "..."
                : "..."}
            </p>
            <div class="flex items-center gap-2">
              {spaceCtx.space.hostId === model.previewUserId && (
                <ViewSpaceHostChip />
              )}
              {spaceCtx.currentUserId === model.previewUserId && (
                <ViewYouChip />
              )}
            </div>
          </button>

          <div class="w-full px-4 pb-8">
            <Button
              onClick={() => {
                if (model.previewUserId) {
                  ctx.push({
                    t: "profile",
                    c: {
                      t: "profile",
                      userId: model.previewUserId,
                    },
                  });
                }
              }}
              class="w-full"
              text="See profile"
            />
          </div>
        </div>
      </Drawer>
    </>
  );
};

const ViewFeed = ({
  state,
  ctx,
  model,
}: {
  state: SpaceStateStarted;
  dispatch: (m: ClientMsg) => void;
  model: ClientModel;
  ctx: SpaceViewCtx;
}) => {
  const event = model.events.events[state.latestEvent];

  if (!event) {
    return null;
  }

  return (
    <Transition
      id="event"
      mode="in-out"
      onEnter={async (el) => {
        await el.animate([{ opacity: 0 }, { opacity: 1 }], {
          fill: "both",
          duration: 200,
        }).finished;
      }}
      onExit={async (el) => {
        await el.animate([{ opacity: 1 }, { opacity: 0 }], {
          fill: "both",
          duration: 200,
        }).finished;
      }}
      class="relative h-6 w-full"
    >
      <div
        key={event.eventId}
        class="absolute inset-0 flex items-center justify-center"
      >
        <ViewFeedItem ctx={ctx} event={event} state={state} />
      </div>
    </Transition>
  );
};

const ViewFeedItem = ({
  ctx,
  event,
  state,
}: {
  ctx: SpaceViewCtx;
  event: EventWithMeta;
  state: SpaceStateStarted;
}) => {
  switch (event.t) {
    case "game": {
      if (!state.game) {
        return null;
      }
      return (
        <GameClient.ViewFeedItem
          ctx={ctx}
          event={{ ...event, ...event.c }}
          state={state.game}
        />
      );
    }

    case "user-ended-space": {
      const profile = ctx.profiles[event.userId];
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} ended the space`}
        />
      );
    }

    case "user-inputted-game": {
      const profile = ctx.profiles[event.userId];
      if (!event.game) {
        return (
          <FeedItem.Info
            text={`${profile?.username ?? "Someone"} quit the game`}
          />
        );
      }
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} started a game`}
        />
      );
    }

    case "user-joined-space": {
      const profile = ctx.profiles[event.userId];
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} joined the space`}
        />
      );
    }

    case "user-left-space": {
      const profile = ctx.profiles[event.userId];
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} left the space`}
        />
      );
    }

    case "user-started-space": {
      const profile = ctx.profiles[event.userId];
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} started the space`}
        />
      );
    }
  }
};

const ViewSpaceScreenMain = ({
  ctx,
  space,
  model,
  dispatch,
  dispatchEvent,
}: {
  space: SpaceStateStarted;
  model: ClientModel;
  ctx: SpaceViewCtx;
  dispatch: (m: ClientMsg) => void;
  dispatchEvent: (m: Event) => void;
}) => {
  const user = toUserState(model, ctx.currentUserId);

  if (user.spaceId !== space.spaceId) {
    return (
      <ViewSpaceJoinScreen
        ctx={ctx}
        dispatchEvent={dispatchEvent}
        model={model}
      />
    );
  }

  const peopleCount = Object.keys(ctx.space.users).length;

  const gameModel = model.games[ctx.space.spaceId];

  return (
    <div class="flex h-full w-full flex-1 flex-col">
      <nav class="flex h-14 w-full items-center border-b border-neutral-700">
        <ViewTopButton
          onClick={() => ctx.push({ t: "space", c: { t: "space-list" } })}
          label="Home"
          icon={<IconHome class="h-6 w-6" />}
        />

        <ViewTopButton
          onClick={() => dispatch({ t: "clicked-people-button" })}
          label={peopleCount > 1 ? `People (${peopleCount})` : `People`}
          icon={<IconUserGroup class="h-6 w-6" />}
        />

        <div class="flex-1"></div>

        {ctx.space.hostId !== ctx.currentUserId && (
          <div class="p-2">
            <Button
              color="danger"
              variant="contained"
              size="sm"
              text="Leave"
              onClick={() => {
                dispatchEvent({
                  t: "user-left-space",
                  spaceId: ctx.space.spaceId,
                  userId: ctx.currentUserId,
                });
              }}
            />
          </div>
        )}
        {ctx.space.hostId === ctx.currentUserId && (
          <div class="p-2">
            <Button
              color="danger"
              variant="contained"
              size="sm"
              text="End"
              onClick={() => {
                dispatchEvent({
                  t: "user-ended-space",
                  userId: ctx.currentUserId,
                  spaceId: ctx.space.spaceId,
                });
              }}
            />
          </div>
        )}
      </nav>

      <ViewFeed state={space} ctx={ctx} model={model} dispatch={dispatch} />

      <div class="w-full border-b border-neutral-700"></div>

      <div class="flex w-full flex-1 flex-col overflow-hidden">
        {space.game ? (
          <GameClient.View
            state={space.game}
            ctx={ctx}
            dispatch={(msg) =>
              dispatch({ t: "game", spaceId: ctx.space.spaceId, c: msg })
            }
            model={gameModel}
          />
        ) : (
          <ViewNotInGameScreen ctx={ctx} dispatchEvent={dispatchEvent} />
        )}
      </div>
    </div>
  );
};

function ViewTopButton({
  icon,
  label,
  onClick,
}: {
  icon: VDom;
  label: string;
  onClick: () => void;
}) {
  return (
    <button class="grid w-20 place-items-center py-1" onClick={onClick}>
      {icon}
      <p class="text-xs">{label}</p>
    </button>
  );
}

const ViewSpaceNotFound = ({ ctx }: { ctx: ViewCtx }) => {
  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-4">
      <p class="text-center text-2xl">Space not found</p>
      <Button
        onClick={() => ctx.push({ t: "space", c: { t: "space-list" } })}
        size="lg"
        variant="contained"
        color="primary"
        start={<IconHome class="h-6 w-6" />}
        text="Go Home"
      />
    </div>
  );
};

const ViewSpaceEnded = ({ ctx }: { ctx: ViewCtx }) => {
  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-4">
      <p class="text-center text-2xl">Space ended</p>
      <Button
        onClick={() => ctx.push({ t: "space", c: { t: "space-list" } })}
        size="lg"
        variant="contained"
        color="primary"
        start={<IconHome class="h-6 w-6" />}
        text="Go Home"
      />
    </div>
  );
};

export const ViewCurrentSpaceBar = ({
  ctx,
  model,
  dispatch,
}: {
  ctx: ViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const dispatchEvent = (msg: Event) => {
    dispatch({
      t: "event",
      c: withMeta$(msg),
    });
  };

  const userState = toUserState(model, ctx.currentUserId);

  if (!userState.spaceId) {
    return null;
  }

  const space = toStartedSpace(model, userState.spaceId);

  if (!space) {
    return null;
  }

  const game = model.games[userState.spaceId];

  const hostProfile = ctx.profiles[space.hostId];

  const userCount = Object.values(space.users).length;

  return (
    <div class="flex w-full items-center overflow-hidden border-t-2 border-blue-600 text-inherit">
      <button
        class="flex flex-1 items-center overflow-hidden"
        onClick={() => {
          ctx.push({
            t: "space",
            c: { t: "space", spaceId: space.spaceId },
          });
        }}
      >
        <div class="mr-2 p-2">
          {!game && (
            <MyAvatar
              src={hostProfile?.avatarUrl}
              alt="Host Avatar"
              class="h-12 w-12"
            />
          )}
          {game && (
            <div class="h-12 w-12 overflow-hidden rounded border border-neutral-600">
              <CoverArt gameName={game.t} />
            </div>
          )}
        </div>

        <div class="flex flex-1 flex-col gap-1 overflow-hidden">
          <p class="text-left">
            {hostProfile ? `${hostProfile.username}'s space` : "..."}
          </p>
          <p class="text-left text-xs text-neutral-300">{userCount} in space</p>
        </div>
      </button>

      {ctx.currentUserId === space.hostId && (
        <button
          aria-label="end space"
          onClick={() => {
            dispatchEvent({
              t: "user-ended-space",
              userId: ctx.currentUserId,
              spaceId: space.spaceId,
            });
          }}
          class="mr-4"
        >
          <IconXMark class="h-8 w-8" />
        </button>
      )}

      {ctx.currentUserId !== space.hostId && (
        <button
          aria-label="leave space"
          onClick={() => {
            dispatchEvent({
              t: "user-left-space",
              userId: ctx.currentUserId,
              spaceId: space.spaceId,
            });
          }}
          class="mr-4"
        >
          <IconXMark class="h-8 w-8" />
        </button>
      )}
    </div>
  );
};
