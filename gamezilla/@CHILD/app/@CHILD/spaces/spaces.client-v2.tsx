import {
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import {
  EventId,
  WithEventId,
  withId,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { FeedItem } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/feed-item";
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import {
  APP_SOUND,
  AnonymousClientCtx,
  AppRoute,
  ClientCmd,
  ClientCtx,
  ClientEvent,
  RouteGameSpace,
  addProfiles,
  playSound,
  pushRoute,
  replaceRoute,
  sendToServer,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Avatar,
  Button,
  Drawer,
  IconHome,
  IconUserGroup,
  IconXMark,
  LoadingScreen,
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub, batchMsgs } from "gamezilla/@SHARED/core";
import { CoverArt } from "./@CHILD/game/game-cover-art";
import { Game } from "./@CHILD/game/game.client";
import * as GameCore from "./@CHILD/game/game.core";
import { ViewScreenJoinSpace } from "./spaces-client/view-screen-join-space";
import { ViewScreenListSpaces } from "./spaces-client/view-screen-list-spaces";
import { ViewScreenNotInGame } from "./spaces-client/view-screen-not-in-game";
import { SpaceEvent } from "./spaces-core/space-event";
import * as SpaceState from "./spaces-core/space-state"
import * as Space from "./spaces-core/space"
import * as Spaces from "./spaces-core/spaces";
import { ToServer, ToClient } from "./spaces.core-v2";

//
//
//
//
//
//
//
//

type Modal = null | "user-preview" | "users";

type ClientModel = Spaces.Model & {
  games: {
    [spaceId: string]: GameCore.ClientModel;
  }
  previewUserId: UserId | null;
  modal: Modal;
  isSyncing: boolean;
};

type Module = AppClientModule<{
  Ctx: AnonymousClientCtx;
  InCmd: never;
  InEvent: ClientEvent;
  Model: ClientModel;
  Msg: ClientMsg;
  OutCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  OutEvent: ClientEvent;
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
      ...Spaces.init,
      games: {},
      modal: null,
      previewUserId: null,
      isSyncing: false,
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

export type ClientMsg =
  | { t: "event"; c: WithEventId<SpaceEvent> }
  | { t: "game"; spaceId: SpaceId; c: GameCore.ClientMsg }
  | { t: "closed-modal" }
  | { t: "clicked-people-button" }
  | { t: "clicked-back-button"; from: "join-screen" }
  | { t: "clicked-space-card"; spaceId: SpaceId }
  | { t: "clicked-user"; userId: UserId }
  | { t: "clicked-link"; route: AppRoute };

export const update: Module["update"] = (input) => {
  return AppClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromServer({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateGame({ ...input, model }),
    (model) => updateProfiles({ ...input, model })
  );
};

const updateProfiles: Module["update"] = ({ model, fromServer }) => {
  if (fromServer?.profiles) {
    return {
      model,
      cmd: [addProfiles(fromServer.profiles)],
    };
  }
  return { model };
};


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

const updateFromServer: Module["update"] = async (input) => {
  const { ctx, fromServer, model } = input;

  if (!fromServer) {
    return { model };
  }

  switch (fromServer.t) {
    case "sync": {
      const merged = Spaces.mergeOne({
        model,
        space: fromServer.space,
      })
      return { model: { ...model, ...merged, isSyncing: false } };
    }

    case "event": {
      return updateFromSpaceEvents({ ctx, events: [fromServer.c], model });
    }

    case 'spaces-list': {
      return { model }
    }

    case "game": {
      return { model };
    }

  }
};

const updateFromEvent: Module["update"] = async (input) => {
  if (!input.event) {
    return { model: input.model };
  }

  const { model, event } = input;

  switch (event.t) {
    case "routing/route-changed": {
      return { model: { ...model, modal: null } };
    }

    case "wire/server-connected": {
      const currentUserId = input.ctx.currentUserId;

      if (!currentUserId) {
        return { model };
      }

      const currentUserProfile = currentUserId
        ? input.ctx.profiles[currentUserId]
        : null;

      const currentUserSpace = Spaces.toSpaceByUserId({
        model,
        userId: currentUserId,
      });

      if (!currentUserSpace) {
        return { model };
      }

      return {
        model: {
          ...model, isSyncing: true,
        },
        cmd: [sendToServer({
          t: "sync", space: currentUserSpace,
          profiles: currentUserProfile ? { [currentUserId]: currentUserProfile, } : {}
        })],
      };
    }

    default: {
      return { model: input.model };
    }
  }
};

const updateGame: Module["update"] = async (input) => {
  const { ctx, model, fromServer, event, msg } = input;

  const spaceId =
    msg && "spaceId" in msg
      ? msg.spaceId
      : fromServer && "spaceId" in fromServer
        ? fromServer.spaceId
        : null;

  if (!spaceId) {
    return { model };
  }

  const state = await deriveState(model);

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
      quit() { },
      viewProfile() { },
    },
    model: model.games[space.spaceId] ?? Game.init(space.game.t),
    gameState: space.game,
    fromServer: fromServer?.t === "game" ? fromServer.c : null,
    cmd: null,
    event,
    msg: msg?.t === "game" ? msg.c : null,
  });

  const eventsNew =
    updated.gameEvent?.map(
      (e): WithEventId<SpaceEvent> => ({
        ...e,
        spaceId: space.spaceId,
        t: "game",
        c: e,
      })
    ) ?? [];

  return AppClientModule.chainUpdates(
    { model },
    (model) => mergeUpdatedGame({ model, spaceId, updated }),
    (model) => updateFromSpaceEvents({ ctx, events: eventsNew, model })
  );
};

const mergeUpdatedGame = ({
  model,
  spaceId,
  updated,
}: {
  spaceId: SpaceId;
  model: ClientModel;
  updated: ReturnType<typeof Game.update>;
}): {
  model: ClientModel;
  cmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  eff: Eff<ClientMsg>;
} => {
  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [spaceId]: updated.model,
      },
    },
    cmd: ClientCmd.map(
      updated.cmd ?? [],
      (c) => ({ t: "game", c, spaceId }),
      (c) => ({ t: "game", c, spaceId })
    ),
    eff: Eff.map_((c) => ({ t: "game", c, spaceId }), updated.eff),
  };
};

const updateFromSpaceEvents = (input: {
  ctx: ClientCtx | AnonymousClientCtx;
  model: ClientModel;
  events: WithEventId<SpaceEvent>[];
}): Promise<{
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
}> => {
  return loop(input.ctx, input.events, {
    model: input.model,
    cmd: [],
    eff: Eff.None,
  });
};

const loop = async (
  ctx: ClientCtx | AnonymousClientCtx,
  events: WithEventId<SpaceEvent>[],
  acc: {
    model: ClientModel;
    cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
    eff?: Eff<ClientMsg>;
  }
): Promise<{
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  eff?: Eff<ClientMsg>;
}> => {
  const [event, ...rest] = events;

  if (!event) {
    return acc;
  }

  if (await SpaceEvents.has(acc.model.events, event.eventId)) {
    return loop(ctx, rest, acc);
  }

  const stateBefore = await deriveState(acc.model);
  const spaceBefore = toStartedSpace(stateBefore, event.spaceId);

  const updated = await AppClientModule.chainUpdates(
    acc,
    (model) => appendEvents({ model, event }),
    (model) => updateSpaceFromEvent({ stateBefore, model, ctx, event }),
    (model) => sendEventToServer({ model, eventId: event.eventId })
  );

  const spaceAfter = toStartedSpace(
    await deriveState(updated.model),
    event.spaceId
  );

  const updatedGame = await updateGameFromEvent({
    model: updated.model,
    ctx,
    eventId: event.eventId,
    before: spaceBefore,
    after: spaceAfter,
  });

  const accNew: typeof acc = {
    model: updatedGame.model,
    cmd: batchMsgs(acc.cmd, updatedGame.cmd, updated.cmd),
    eff: Eff.batch([acc.eff, updatedGame.eff, updated.eff]),
  };

  const eventsNew = batchMsgs(rest, updatedGame.event);

  return loop(ctx, eventsNew, accNew);
};

const sendEventToServer = async ({
  model,
  eventId,
}: {
  model: ClientModel;
  eventId: EventId;
}): Promise<{
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
}> => {
  const eventWithMeta = await SpaceEvents.get(model.events, eventId);

  if (!eventWithMeta) {
    return { model };
  }

  return {
    model,
    cmd: [
      sendToServer({ t: "event", c: { ...eventWithMeta }, clock: model.clock }),
    ],
  };
};

const appendEvents = async ({
  model,
  event,
}: {
  model: ClientModel;
  event: WithEventId<SpaceEvent>;
}): Promise<{
  model: ClientModel;
}> => {
  const appended = await appendEvent(model, event);
  return { model: { ...model, ...appended } };
};

const updateGameFromEvent = async ({
  model,
  eventId,
  ctx,
  before,
  after,
}: {
  before: SpaceStateStarted | null;
  after: SpaceStateStarted | null;
  model: ClientModel;
  eventId: EventId;
  ctx: ClientCtx | AnonymousClientCtx;
}): Promise<{
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  event?: WithEventId<SpaceEvent>[];
}> => {
  const eventWithMeta = await SpaceEvents.get(model.events, eventId);

  if (!after || !after.game || !ctx.currentUserId || !eventWithMeta) {
    return { model };
  }

  const updatedGame = Game.update({
    ctx: {
      ...ctx,
      currentUserId: ctx.currentUserId,
      space: after,
      quit() { },
      viewProfile() { },
    },
    gameEvent:
      eventWithMeta.t === "game"
        ? { ...eventWithMeta, ...eventWithMeta.c }
        : null,
    model: model.games[eventWithMeta.spaceId] ?? Game.init(after.game.t),
    gameState: before?.game ?? after.game,
  });

  const eventsNew =
    updatedGame.gameEvent?.map((e) =>
      withId<SpaceEvent>({
        t: "game",
        spaceId: eventWithMeta.spaceId,
        c: e,
      })
    ) ?? [];

  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [eventWithMeta.spaceId]: updatedGame.model,
      },
    },
    eff: Eff.map_(
      (c) => ({ t: "game", spaceId: eventWithMeta.spaceId, c }),
      updatedGame.eff
    ),
    event: eventsNew,
    cmd: ClientCmd.map(
      updatedGame?.cmd ?? [],
      (c) => ({
        t: "game",
        c,
        spaceId: eventWithMeta.spaceId,
      }),
      (c) => ({
        t: "game",
        c,
        spaceId: eventWithMeta.spaceId,
      })
    ),
  };
};

const updateSpaceFromEvent = async ({
  ctx,
  model,
  event,
  stateBefore,
}: {
  stateBefore: State;
  ctx: ClientCtx | AnonymousClientCtx;
  model: ClientModel;
  event: SpaceEvent;
}): Promise<{
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
}> => {
  if (!ctx.currentUserId) {
    return { model };
  }

  const state = await deriveState(model);

  const currentUserStateBefore = toUserState(stateBefore, ctx.currentUserId);
  const currentUserState = toUserState(state, ctx.currentUserId);

  switch (event.t) {
    case "user-joined-space": {
      if (event.spaceId === currentUserState.spaceId) {
        return {
          model,
          cmd: [playSound(APP_SOUND.navForward)],
        };
      }
      return { model };
    }

    case "user-left-space": {
      if (event.spaceId === currentUserState.spaceId) {
        return {
          model,
          cmd: [playSound(APP_SOUND.navBackward)],
        };
      }
      return { model };
    }

    case "user-started-space": {
      if (event.userId === ctx.currentUserId) {
        return {
          model,
          cmd: [
            playSound(APP_SOUND.navForward),
            pushRoute({
              t: "space",
              c: { t: "space", spaceId: event.spaceId },
            }),
          ],
        };
      }
      return { model };
    }

    case "user-ended-space": {
      if (event.spaceId !== currentUserStateBefore.spaceId) {
        return { model };
      }
      return AppClientModule.chainUpdates(
        { model },
        (model) => {
          return {
            model,
            cmd: [playSound(APP_SOUND.navBackward)],
          };
        },
        (model) => {
          if (
            ctx.currentRoute.t === "space" &&
            ctx.currentRoute.c.t === "space" &&
            ctx.currentRoute.c.spaceId === event.spaceId
          ) {
            return {
              model,
              cmd: [pushRoute({ t: "space", c: { t: "space-list" } })],
            };
          }
          return {
            model,
            cmd: [],
          };
        },
        (model) => {
          if (event.userId === ctx.currentUserId) {
            return {
              model,
              cmd: [showToast("Space ended")],
            };
          }

          const profile = ctx.profiles[event.userId];

          if (!profile) {
            return {
              model,
              cmd: [showToast("Space ended by host")],
            };
          }

          return {
            model,
            cmd: [showToast(`Space ended by ${profile.username}`)],
          };
        }
      );
    }

    case "user-inputted-game": {
      if (event.spaceId === currentUserState.spaceId) {
        return {
          model,
          cmd: [
            playSound(
              event.game ? APP_SOUND.navForwardMin : APP_SOUND.navBackwardMin
            ),
          ],
        };
      }
      return { model };
    }

    case "game": {
      return { model };
    }
  }
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
        ctx: { ...clientCtx, space: space, quit() { }, viewProfile() { } },
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
  const dispatchEvent = (m: SpaceEvent) => {
    dispatch({ t: "event", c: withId(m) });
  };
  switch (route.t) {
    case "space-list": {
      return (
        <>
          <ViewScreenListSpaces dispatch={dispatch} ctx={ctx} model={model} />
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
  dispatchEvent: (m: SpaceEvent) => void;
  dispatch: (m: ClientMsg) => void;
  spaceId: SpaceId;
}) => {
  const space = model.latestState.spaces[spaceId] ?? {
    type: "initial",
  };

  switch (space.type) {
    case "ended": {
      if (model.isSyncing) {
        return <LoadingScreen />;
      }
      return <ViewSpaceEnded dispatch={dispatch} />;
    }

    case "initial": {
      if (model.isSyncing) {
        return <LoadingScreen />;
      }
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
  dispatchEvent: (m: SpaceEvent) => void;
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
            className="flex w-full flex-col items-center justify-center gap-2 p-4"
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
              className="h-24 w-24"
            />
            <p className="text-xl font-semibold">
              {model.previewUserId
                ? ctx.profiles[model.previewUserId]?.username ?? "..."
                : "..."}
            </p>
            <div className="flex items-center gap-2">
              {spaceCtx.space.hostId === model.previewUserId && (
                <ViewSpaceHostChip />
              )}
              {spaceCtx.currentUserId === model.previewUserId && (
                <ViewYouChip />
              )}
            </div>
          </button>

          <div className="w-full px-4 pb-8">
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
              className="w-full"
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
    <div className="flex h-6 w-full items-center justify-center border-b border-neutral-600 p-1">
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
  event: WithEventId<SpaceEvent>;
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
  dispatchEvent: (m: SpaceEvent) => void;
}) => {
  const currentUserSpaceId =
    model.latestState.spaceIdByUserId[ctx.currentUserId];

  if (currentUserSpaceId !== space.spaceId) {
    return (
      <ViewScreenJoinSpace
        ctx={ctx}
        dispatch={dispatch}
        dispatchEvent={dispatchEvent}
        model={model}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <ViewTopBar ctx={ctx} dispatch={dispatch} dispatchEvent={dispatchEvent} />

      <ViewFeed state={space} ctx={ctx} model={model} dispatch={dispatch} />

      <div className="flex w-full flex-1 flex-col overflow-hidden">
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
  dispatchEvent: (m: SpaceEvent) => void;
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

  return <ViewScreenNotInGame ctx={ctx} dispatchEvent={dispatchEvent} />;
};

function ViewTopBar({
  ctx,
  dispatch,
  dispatchEvent,
}: {
  ctx: SpaceClientCtx;
  dispatch: (m: ClientMsg) => void;
  dispatchEvent: (m: SpaceEvent) => void;
}) {
  const peopleCount = Object.keys(ctx.space.users).length;

  return (
    <nav className="flex h-14 w-full items-center border-b border-neutral-600">
      <ViewTopButton
        onClick={() =>
          dispatch({
            t: "clicked-link",
            route: { t: "space", c: { t: "space-list" } },
          })
        }
        label="Home"
        icon={<IconHome className="h-6 w-6" />}
      />

      <ViewTopButton
        onClick={() => dispatch({ t: "clicked-people-button" })}
        label={peopleCount > 1 ? `People (${peopleCount})` : `People`}
        icon={<IconUserGroup className="h-6 w-6" />}
      />

      <div className="flex-1"></div>

      {ctx.space.hostId !== ctx.currentUserId && (
        <div className="p-2">
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
        <div className="p-2">
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
    <button className="grid w-20 place-items-center py-1" onClick={onClick}>
      {icon}
      <p className="text-xs">{label}</p>
    </button>
  );
}

const ViewSpaceNotFound = ({
  dispatch,
}: {
  dispatch: (m: ClientMsg) => void;
}) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">Space not found</p>
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
        start={<IconHome className="h-6 w-6" />}
        text="Go Home"
      />
    </div>
  );
};

const ViewSpaceEnded = ({ dispatch }: { dispatch: (m: ClientMsg) => void }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">Space ended</p>
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
        start={<IconHome className="h-6 w-6" />}
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
  const dispatchEvent = (msg: SpaceEvent) => {
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
    <div className="flex w-full items-center overflow-hidden border-t-2 border-blue-600 text-inherit">
      <button
        className="flex flex-1 items-center overflow-hidden"
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
        <div className="mr-2 p-2">
          {!game && (
            <Avatar
              src={hostProfile?.avatarUrl}
              alt="Host Avatar"
              className="h-12 w-12"
            />
          )}
          {game && (
            <div className="h-12 w-12 overflow-hidden rounded border border-neutral-600">
              <CoverArt gameName={game.t} />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <p className="text-left">
            {hostProfile ? `${hostProfile.username}'s space` : "..."}
          </p>
          <p className="text-left text-xs text-neutral-300">
            {userCount} in space
          </p>
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
          className="mr-4"
        >
          <IconXMark className="h-8 w-8" />
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
          className="mr-4"
        >
          <IconXMark className="h-8 w-8" />
        </button>
      )}
    </div>
  );
};
