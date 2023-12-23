import {
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import {
  WithEventId,
  withId,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";
import { FeedItem } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/feed-item";
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import {
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  ClientEvt,
  RouteGameSpace,
  addProfiles,
  pushRoute,
  replaceRoute,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Avatar,
  Button,
  Drawer,
  IconHome,
  IconUserGroup,
  IconXMark,
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub } from "gamezilla/@SHARED/core";
import { CoverArt } from "./@CHILD/game/game-cover-art";
import { Game } from "./@CHILD/game/game.client";
import { updateFromSpaceEvents } from "./space-client/update-from-events";
import { updateFromGame } from "./space-client/update-from-game";
import { ViewNotInGameScreen } from "./space-client/view-not-in-game-screen";
import { ViewSpaceJoinScreen } from "./space-client/view-space-join-screen";
import { ViewSpaceListScreen } from "./space-client/view-space-list-screen";
import {
  ClientModel,
  ClientMsg,
  Event,
  SpaceStateStarted,
  ToClient,
  ToServer,
  initCore,
  initState,
  mergeModels,
  toState
} from "./space.core";

//
//
//
//
//
//
//
//

type Module = AppClientModule<{
  Ctx: AnonymousClientCtx;
  InCmd: never;
  InEvt: ClientEvt;
  Model: ClientModel;
  Msg: ClientMsg;
  OutCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  OutEvt: ClientEvt;
  ToClient: ToClient;
  ToServer: ToServer;
}>;

//
//
//
// Model
//
//
//

export const init: Module["init"] = async ({ stored }) => {
  if (stored) {
    return {
      model: stored,
    };
  }

  return {
    model: {
      ...(await initCore()),
      games: {},
      modal: null,
      previewUserId: null,
      latestState: initState(),
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

export const update: Module["update"] = (input) => {
  return AppClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromServer({ ...input, model }),
    (model) => updateFromEvt({ ...input, model }),
    (model) => updateGame({ ...input, model }),
    (model) => updateLatestState({ ...input, model }),
  );
};

const updateLatestState: Module["update"] = async ({  model }) => {
  const latestState = await toState(model);
  return {
    model: {
      ...model,
      latestState
    },
  }

}

const updateFromMsg: Module["update"] = ({ msg, model, ctx }) => {
  if (!msg) {
    return { model };
  }

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

    case "clicked-link": {
      return { model, cmd: [pushRoute(msg.route)] };
    }

    case "clicked-back-button": {
      switch (msg.from) {
        case "join-screen": {
          return {
            model,
            cmd: [replaceRoute({ t: "space", c: { t: "space-list" } })],
          };
        }
      }
    }

    case "clicked-space-card": {
      return {
        model,
        cmd: [
          pushRoute({ t: "space", c: { t: "space", spaceId: msg.spaceId } }),
        ],
      };
    }

    case "game": {
      return { model };
    }

    case "event": {
      return updateFromSpaceEvents({ ctx, events: [msg.c], model });
    }
  }
};

const updateFromServer: Module["update"] = (input) => {
  const { ctx, fromServer } = input;

  if (!fromServer) {
    return { model: input.model };
  }

  return AppClientModule.chainUpdates(
    { model: input.model },
    (model) => {
      return {
        model,
        cmd: fromServer.profiles ? [addProfiles(fromServer.profiles)] : [],
      };
    },
    async (model) => {
      switch (fromServer.t) {
        case "sync": {
          const merged = await mergeModels(model, {
            events: fromServer.events,
            clock: fromServer.clock,
            snapshots: model.snapshots,
          });

          return { model: { ...model, ...merged } };
        }

        case "game": {
          return { model };
        }

        case "event": {
          return updateFromSpaceEvents({ ctx, events: [fromServer.c], model });
        }
      }
    }
  );
};

const updateFromEvt: Module["update"] = (input) => {
  if (!input.evt) {
    return { model: input.model };
  }

  const { model, evt } = input;

  switch (evt.t) {
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
            clock: model.clock,
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
      return { model: input.model };
    }
  }
};

const updateGame: Module["update"] = async (input) => {
  const { ctx, model, fromServer, evt, msg } = input;

  const spaceId =
    msg && "spaceId" in msg
      ? msg.spaceId
      : fromServer && "spaceId" in fromServer
      ? fromServer.spaceId
      : null;

  if (!spaceId) {
    return { model };
  }

  const state = await toState(model);

  const space = state.spaces[spaceId] ?? {
    type: "initial",
  };

  if (space.type !== "started" || !space.game || !ctx.currentUserId) {
    return { model };
  }

  const updated = Game.update({
    ctx: {
      ...ctx,
      space: space,
      currentUserId: ctx.currentUserId,
      quit() {},
      viewProfile() {},
    },
    model: model.games[space.spaceId] ?? Game.init(space.game.t),
    gameState: space.game,
    fromServer: fromServer?.t === "game" ? fromServer.c : null,
    cmd: null,
    evt,
    msg: msg?.t === "game" ? msg.c : null,
  });

  const eventsNew =
    updated.gameEvent?.map(
      (e): WithEventId<Event> => ({
        ...e,
        spaceId: space.spaceId,
        t: "game",
        c: e,
      })
    ) ?? [];

  return AppClientModule.chainUpdates(
    { model },
    (model) => updateFromGame({ model, spaceId, updated }),
    (model) => updateFromSpaceEvents({ ctx, events: eventsNew, model })
  );
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

export const subscriptions: Module["subscriptions"] = ({ ctx, model }) => {
  const { currentUserId } = ctx;

  if (!currentUserId) {
    return Sub.None;
  }

  const clientCtx = {
    ...ctx,
    currentUserId,
  };

  const subs: Sub<ClientMsg>[] = [];

  const state = model.latestState;

  for (const spaceId in state.active) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }

    const space = state.spaces[spaceId] ?? {
      type: "initial",
    };

    if (space.type !== "started") {
      continue;
    }

    if (!space?.game) {
      continue;
    }

    const sub = Sub.map(
      Game.subscriptions({
        ctx: { ...clientCtx, space: space, quit() {}, viewProfile() {} },
        gameState: space.game,
        model: model.games[spaceId] ?? Game.init(space.game.t),
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
  ctx: ClientCtx;
  dispatch: (m: ClientMsg) => void;
  route: RouteGameSpace;
  viewBottomBar: VDom;
}): VDom => {
  const dispatchEvent = (m: Event) => {
    dispatch({ t: "event", c: withId(m) });
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
  ctx: ClientCtx;
  dispatchEvent: (m: Event) => void;
  dispatch: (m: ClientMsg) => void;
  spaceId: SpaceId;
}) => {
  const space = model.latestState.spaces[spaceId] ?? {
    type: "initial",
  };

  switch (space.type) {
    case "ended": {
      return <ViewSpaceEnded dispatch={dispatch} />;
    }

    case "initial": {
      return <ViewSpaceNotFound dispatch={dispatch} />;
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
  ctx: ClientCtx;
  dispatchEvent: (m: Event) => void;
  dispatch: (m: ClientMsg) => void;
  space: SpaceStateStarted;
}) => {
  const spaceCtx: SpaceClientCtx = {
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
                dispatch({
                  t: "clicked-link",
                  route: {
                    t: "profile",
                    c: {
                      t: "profile",
                      userId: model.previewUserId,
                    },
                  },
                });
              }
            }}
          >
            <Avatar
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
                  dispatch({
                    t: "clicked-link",
                    route: {
                      t: "profile",
                      c: {
                        t: "profile",
                        userId: model.previewUserId,
                      },
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
  ctx: SpaceClientCtx;
}) => {
  const event = model.events._events[state.latestEvent];

  if (!event) {
    return null;
  }

  return (
    <div class="flex h-6 w-full items-center justify-center border-b border-neutral-700 p-1">
      <ViewFeedItem ctx={ctx} event={event} state={state} />
    </div>
  );
};

const ViewFeedItem = ({
  ctx,
  event,
  state,
}: {
  ctx: SpaceClientCtx;
  event: WithEventId<Event>;
  state: SpaceStateStarted;
}) => {
  switch (event.t) {
    case "game": {
      if (!state.game) {
        return null;
      }
      return (
        <Game.ViewFeedItem
          ctx={ctx}
          gameEvent={{ ...event, ...event.c }}
          gameState={state.game}
          dispatch={(_msg) => {
            //
          }}
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
  ctx: SpaceClientCtx;
  dispatch: (m: ClientMsg) => void;
  dispatchEvent: (m: Event) => void;
}) => {
  const currentUserSpaceId =
    model.latestState.spaceIdByUserId[ctx.currentUserId];

  if (currentUserSpaceId !== space.spaceId) {
    return (
      <ViewSpaceJoinScreen
        ctx={ctx}
        dispatch={dispatch}
        dispatchEvent={dispatchEvent}
        model={model}
      />
    );
  }

  return (
    <div class="flex h-full w-full flex-1 flex-col">
      <ViewTopBar ctx={ctx} dispatch={dispatch} dispatchEvent={dispatchEvent} />

      <ViewFeed state={space} ctx={ctx} model={model} dispatch={dispatch} />

      <div class="flex w-full flex-1 flex-col overflow-hidden">
        <ViewGame
          ctx={ctx}
          dispatch={dispatch}
          dispatchEvent={dispatchEvent}
          model={model}
          space={space}
        />
      </div>
    </div>
  );
};

const ViewGame = ({
  space,
  model,
  ctx,
  dispatch,
  dispatchEvent,
}: {
  space: SpaceStateStarted;
  model: ClientModel;
  ctx: SpaceClientCtx;
  dispatch: (m: ClientMsg) => void;
  dispatchEvent: (m: Event) => void;
}) => {
  if (space.game) {
    return (
      <Game.View
        gameState={space.game}
        ctx={ctx}
        dispatch={(c) => dispatch({ t: "game", spaceId: ctx.space.spaceId, c })}
        model={model.games[ctx.space.spaceId] ?? Game.init(space.game.t)}
      />
    );
  }

  return <ViewNotInGameScreen ctx={ctx} dispatchEvent={dispatchEvent} />;
};

function ViewTopBar({
  ctx,
  dispatch,
  dispatchEvent,
}: {
  ctx: SpaceClientCtx;
  dispatch: (m: ClientMsg) => void;
  dispatchEvent: (m: Event) => void;
}) {
  const peopleCount = Object.keys(ctx.space.users).length;

  return (
    <nav class="flex h-14 w-full items-center border-b border-neutral-700">
      <ViewTopButton
        onClick={() =>
          dispatch({
            t: "clicked-link",
            route: { t: "space", c: { t: "space-list" } },
          })
        }
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
  );
}

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

const ViewSpaceNotFound = ({
  dispatch,
}: {
  dispatch: (m: ClientMsg) => void;
}) => {
  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-4">
      <p class="text-center text-2xl">Space not found</p>
      <Button
        onClick={() =>
          dispatch({
            t: "clicked-link",
            route: { t: "space", c: { t: "space-list" } },
          })
        }
        size="lg"
        variant="contained"
        color="primary"
        start={<IconHome class="h-6 w-6" />}
        text="Go Home"
      />
    </div>
  );
};

const ViewSpaceEnded = ({ dispatch }: { dispatch: (m: ClientMsg) => void }) => {
  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-4">
      <p class="text-center text-2xl">Space ended</p>
      <Button
        onClick={() =>
          dispatch({
            t: "clicked-link",
            route: { t: "space", c: { t: "space-list" } },
          })
        }
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
  ctx: ClientCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const dispatchEvent = (msg: Event) => {
    dispatch({
      t: "event",
      c: withId(msg),
    });
  };

  const userSpaceId = model.latestState.spaceIdByUserId[ctx.currentUserId];

  const userState = {
    userId: ctx.currentUserId,
    spaceId: userSpaceId ?? null,
  };

  if (!userState.spaceId) {
    return null;
  }

  const space = model.latestState.spaces[userState.spaceId] ?? {
    type: "initial",
  };

  if (space.type !== "started") {
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
          dispatch({
            t: "clicked-link",
            route: {
              t: "space",
              c: { t: "space", spaceId: space.spaceId },
            },
          });
        }}
      >
        <div class="mr-2 p-2">
          {!game && (
            <Avatar
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
