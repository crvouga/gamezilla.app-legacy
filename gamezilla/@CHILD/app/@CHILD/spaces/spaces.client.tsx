import {
  ViewGameHeader,
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import {
  WithEventId,
  withId,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { FeedItem } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/feed-item";
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import {
  APP_SOUND,
  AnonymousClientCtx,
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
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Avatar,
  Button,
  Drawer,
  IconHome,
  IconUserGroup,
  IconXMark,
  TopBar,
  TopBarBackButton,
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub, batchMsgs } from "gamezilla/@SHARED/core";
import { CoverArt } from "./@CHILD/game/game-cover-art";
import { Game } from "./@CHILD/game/game.client";
import { gameNameToString } from "./@CHILD/game/game.core";
import { ViewScreenListSpaces } from "./spaces-client/view-screen-list-spaces";
import { ViewScreenNotInGame } from "./spaces-client/view-screen-not-in-game";
import * as Space from "./spaces-core/space";
import { SpaceEvent } from "./spaces-core/space-event";
import * as SpaceState from "./spaces-core/space-state";
import * as Spaces from "./spaces-core/spaces";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./spaces.core";

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

const initModel: ClientModel = {
  ...Spaces.init,
  games: {},
  modal: null,
  previewUserId: null,
  isFetchingSpaces: false,
};

export const init: Module["init"] = async ({ stored, ctx }) => {
  return AppClientModule.chainUpdates(
    { model: initModel },
    (model) => {
      if (stored) {
        return { model: stored };
      }
      return { model };
    },
    (model) => fetchSpacesFromRoute({ model, ctx })
  );
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
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateGame({ ...input, model }),
    (model) => updateProfiles({ ...input, model })
  );
};

const updateProfiles: Module["update"] = ({ model, msgFromServer }) => {
  if (msgFromServer?.profiles) {
    return {
      model,
      msgCmd: [addProfiles(msgFromServer.profiles)],
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
      return { model, msgCmd: [pushRoute(msg.route)] };
    }

    case "clicked-back-button": {
      switch (msg.from) {
        case "join-screen": {
          return {
            model,
            msgCmd: [replaceRoute({ t: "spaces", c: { t: "space-list" } })],
          };
        }
      }
    }

    case "clicked-space-card": {
      return {
        model,
        msgCmd: [
          pushRoute({ t: "spaces", c: { t: "space", spaceId: msg.spaceId } }),
        ],
      };
    }

    case "game": {
      return { model };
    }

    case "msgEvent": {
      return updateFromManySpaceEvents({ ctx, msgEvents: [msg.c], model });
    }
  }
};

const updateFromServer: Module["update"] = async (input) => {
  const { ctx, msgFromServer, model } = input;

  if (!msgFromServer) {
    return { model };
  }

  switch (msgFromServer.t) {
    case "listed-spaces": {
      const merged = Spaces.mergeMany({ model, spaces: msgFromServer.spaces });
      return {
        model: {
          games: model.games,
          modal: model.modal,
          previewUserId: model.previewUserId,
          spaceIdByUserId: merged.spaceIdByUserId,
          spaces: merged.spaces,
          isFetchingSpaces: false,
        },
      };
    }

    case "current-user-space":
    case "synced": {
      const merged = Spaces.mergeOne({ model, space: msgFromServer.space });
      return {
        model: {
          games: model.games,
          modal: model.modal,
          previewUserId: model.previewUserId,
          spaceIdByUserId: merged.spaceIdByUserId,
          spaces: merged.spaces,
          isFetchingSpaces: false,
        },
      };
    }

    case "msgEvent": {
      return updateFromManySpaceEvents({
        ctx,
        msgEvents: [msgFromServer.c],
        model,
      });
    }

    case "game": {
      return { model };
    }
  }
};

const fetchSpacesFromRoute: Module["update"] = async (input) => {
  switch (input.ctx.currentRoute.t) {
    case "spaces": {
      switch (input.ctx.currentRoute.c.t) {
        case "space": {
          return {
            model: { ...input.model, isFetchingSpaces: true },
            msgCmd: [
              sendToServer({
                t: "list-spaces",
                limit: 100,
                offset: 0,
                where: { spaceId: input.ctx.currentRoute.c.spaceId },
              }),
            ],
          };
        }

        case "space-list": {
          return {
            model: { ...input.model, isFetchingSpaces: true },
            msgCmd: [sendToServer({ t: "list-spaces", limit: 100, offset: 0 })],
          };
        }
      }
    }

    default: {
      return { model: input.model };
    }
  }
};

const updateFromEvent: Module["update"] = async (input) => {
  if (!input.msgEvent) {
    return { model: input.model };
  }

  const { model, msgEvent } = input;

  switch (msgEvent.t) {
    case "routing/route-changed": {
      return AppClientModule.chainUpdates(
        { model },
        (model) => {
          return { model: { ...model, modal: null } };
        },
        (model) => fetchSpacesFromRoute({ ...input, model })
      );
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

      const started = Space.startFromLatestSnapshot(currentUserSpace);

      return {
        model: {
          ...model,
          isSyncing: true,
        },
        msgCmd: [
          sendToServer({
            t: "sync",
            space: started,
            profiles: currentUserProfile
              ? { [currentUserId]: currentUserProfile }
              : {},
            causedBy: msgEvent.t,
          }),
        ],
      };
    }

    default: {
      return { model: input.model };
    }
  }
};

const inputToSpaceId = (input: Parameters<Module["update"]>[0]) => {
  if (input.msg && "spaceId" in input.msg) {
    return input.msg.spaceId;
  }

  if (input.msgFromServer && "spaceId" in input.msgFromServer) {
    return input.msgFromServer.spaceId;
  }

  return null;
};

const updateGame: Module["update"] = async (input) => {
  const { ctx, model, msgFromServer, msgEvent, msg } = input;

  if (!ctx.currentUserId) {
    return { model };
  }

  const spaceId = inputToSpaceId(input);

  if (!spaceId) {
    return { model };
  }

  const spaceState = Spaces.toSpaceStarted(model, spaceId);

  if (!spaceState) {
    return { model };
  }

  const modelGame = spaceState.game;

  if (!modelGame) {
    return { model };
  }

  const gameModel = model.games[spaceId] ?? Game.init(modelGame.t);

  const gameUpdated = Game.update({
    ctx: {
      ...ctx,
      space: spaceState,
      currentUserId: ctx.currentUserId,
      quit() {},
      viewProfile() {},
    },
    model: gameModel,
    modelGame: modelGame,
    msgFromServer: msgFromServer?.t === "game" ? msgFromServer.c : null,
    msgCmd: null,
    msgEvent,
    msg: msg?.t === "game" ? msg.c : null,
  });

  const msgEventsNew = (gameUpdated.msgGame ?? []).map(
    (e): WithEventId<SpaceEvent> => ({ ...e, spaceId, t: "game", c: e })
  );

  return AppClientModule.chainUpdates(
    { model },
    (model) => mergeUpdatedGame({ model, spaceId, gameUpdated }),
    (model) =>
      updateFromManySpaceEvents({ ctx, msgEvents: msgEventsNew, model })
  );
};

const mergeUpdatedGame = ({
  model,
  spaceId,
  gameUpdated,
}: {
  spaceId: SpaceId;
  model: ClientModel;
  gameUpdated: ReturnType<typeof Game.update>;
}): {
  model: ClientModel;
  msgCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  eff: Eff<ClientMsg>;
} => {
  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [spaceId]: gameUpdated.model,
      },
    },
    msgCmd: ClientCmd.map(
      gameUpdated.msgCmd ?? [],
      (c) => ({ t: "game", c, spaceId }),
      (c) => ({ t: "game", c, spaceId })
    ),
    eff: Eff.map_((c) => ({ t: "game", c, spaceId }), gameUpdated.eff),
  };
};

const updateFromManySpaceEvents = (input: {
  ctx: ClientCtx | AnonymousClientCtx;
  model: ClientModel;
  msgEvents: WithEventId<SpaceEvent>[];
}): Promise<{
  model: ClientModel;
  msgCmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  eff?: Eff<ClientMsg>;
}> => {
  return updateFromManySpaceEventsLoop(input.ctx, input.msgEvents, {
    model: input.model,
    msgCmd: [],
    eff: Eff.None,
  });
};

const updateFromManySpaceEventsLoop = async (
  ctx: ClientCtx | AnonymousClientCtx,
  msgEvents: WithEventId<SpaceEvent>[],
  acc: Awaited<ReturnType<typeof updateFromManySpaceEvents>>
): ReturnType<typeof updateFromManySpaceEvents> => {
  const [spaceEvent, ...spaceEventsRest] = msgEvents;

  if (!spaceEvent) {
    return acc;
  }

  const spaceModelBefore =
    Spaces.toSpace(acc.model, spaceEvent.spaceId) ?? Space.init;

  if (!spaceModelBefore) {
    return updateFromManySpaceEventsLoop(ctx, spaceEventsRest, acc);
  }

  if (Space.hasEvent(spaceModelBefore, spaceEvent.msgEventId)) {
    return updateFromManySpaceEventsLoop(ctx, spaceEventsRest, acc);
  }

  const modelBefore = acc.model;

  const updated = await AppClientModule.chainUpdates(
    acc,
    (model) => Spaces.updateFromSpaceEvent({ model, spaceEvent }),
    (model) =>
      updateClientFromSpaceEvent({ model, modelBefore, ctx, spaceEvent }),
    (model) => sendSpaceEventToServer({ model, ctx, spaceEvent })
  );

  const accNew: typeof acc = {
    model: updated.model,
    msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
    eff: Eff.batch([acc.eff, updated.eff]),
  };

  const spaceEventsNew = batchMsgs(spaceEventsRest, updated.msgEvent);

  return updateFromManySpaceEventsLoop(ctx, spaceEventsNew, accNew);
};

const sendSpaceEventToServer = async ({
  ctx,
  model,
  spaceEvent: msgEvent,
}: {
  ctx: ClientCtx | AnonymousClientCtx;
  model: ClientModel;
  spaceEvent: WithEventId<SpaceEvent>;
}): Promise<{
  model: ClientModel;
  msgCmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
}> => {
  const msgEventWithMeta = Spaces.toEventWithMeta(
    model,
    msgEvent.spaceId,
    msgEvent.msgEventId
  );

  if (!msgEventWithMeta) {
    return { model };
  }

  const profile =
    "userId" in msgEventWithMeta ? ctx.profiles[msgEventWithMeta.userId] : null;

  const profiles = profile ? { [profile.userId]: profile } : {};

  return {
    model,
    msgCmd: [sendToServer({ t: "msgEvent", c: msgEventWithMeta, profiles })],
  };
};

const updateClientFromSpaceEvent = async ({
  ctx,
  model,
  modelBefore,
  spaceEvent,
}: {
  ctx: ClientCtx | AnonymousClientCtx;
  modelBefore: ClientModel;
  model: ClientModel;
  spaceEvent: WithEventId<SpaceEvent>;
}): Promise<{
  model: ClientModel;
  msgCmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  msgEvent?: WithEventId<SpaceEvent>[];
}> => {
  if (!ctx.currentUserId) {
    return { model };
  }

  switch (spaceEvent.t) {
    case "user-joined-space": {
      const currentUserSpaceId = Spaces.toSpaceIdByUserId({
        model,
        userId: ctx.currentUserId,
      });
      if (spaceEvent.spaceId === currentUserSpaceId) {
        return {
          model,
          msgCmd: [playSound(APP_SOUND.navForward)],
        };
      }
      return { model };
    }

    case "user-left-space": {
      const currentUserSpaceId = Spaces.toSpaceIdByUserId({
        model: modelBefore,
        userId: ctx.currentUserId,
      });

      if (spaceEvent.spaceId === currentUserSpaceId) {
        return {
          model,
          msgCmd: [playSound(APP_SOUND.navBackward)],
        };
      }
      return { model };
    }

    case "user-started-space": {
      if (spaceEvent.userId === ctx.currentUserId) {
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.navForward),
            pushRoute({
              t: "spaces",
              c: { t: "space", spaceId: spaceEvent.spaceId },
            }),
          ],
        };
      }

      return { model };
    }

    case "user-ended-space": {
      const currentUserSpaceId = Spaces.toSpaceIdByUserId({
        model: modelBefore,
        userId: ctx.currentUserId,
      });

      if (spaceEvent.spaceId !== currentUserSpaceId) {
        return { model };
      }
      return AppClientModule.chainUpdates(
        { model },
        (model) => {
          return {
            model,
            msgCmd: [playSound(APP_SOUND.navBackward)],
          };
        },
        (model) => {
          if (
            ctx.currentRoute.t === "spaces" &&
            ctx.currentRoute.c.t === "space" &&
            ctx.currentRoute.c.spaceId === spaceEvent.spaceId
          ) {
            return {
              model,
              msgCmd: [pushRoute({ t: "spaces", c: { t: "space-list" } })],
            };
          }
          return {
            model,
            msgCmd: [],
          };
        },
        (model) => {
          if (spaceEvent.userId === ctx.currentUserId) {
            return {
              model,
              msgCmd: [showToast("Space ended")],
            };
          }

          const profile = ctx.profiles[spaceEvent.userId];

          if (!profile) {
            return {
              model,
              msgCmd: [showToast("Space ended by host")],
            };
          }

          return {
            model,
            msgCmd: [showToast(`Space ended by ${profile.username}`)],
          };
        }
      );
    }

    case "user-inputted-game": {
      const currentUserSpaceId = Spaces.toSpaceIdByUserId({
        model: model,
        userId: ctx.currentUserId,
      });
      if (spaceEvent.spaceId === currentUserSpaceId) {
        return {
          model,
          msgCmd: [
            playSound(
              spaceEvent.game
                ? APP_SOUND.navForwardMin
                : APP_SOUND.navBackwardMin
            ),
          ],
        };
      }
      return { model };
    }

    case "game": {
      const spaceState = Spaces.toSpaceStarted(model, spaceEvent.spaceId);

      if (!spaceState) {
        return { model };
      }

      if (!spaceState.game) {
        return { model };
      }

      const msgEventWithMeta = Spaces.toEventWithMeta(
        model,
        spaceEvent.spaceId,
        spaceEvent.msgEventId
      );

      if (!msgEventWithMeta) {
        return { model };
      }

      if (msgEventWithMeta.t !== "game") {
        return { model };
      }

      const gameUpdated = Game.update({
        ctx: {
          ...ctx,
          currentUserId: ctx.currentUserId,
          space: spaceState,
          quit() {},
          viewProfile() {},
        },
        msgGame: { ...msgEventWithMeta, ...msgEventWithMeta.c },
        model:
          model.games[msgEventWithMeta.spaceId] ?? Game.init(spaceState.game.t),
        modelGame: spaceState.game,
      });

      const msgEventsNew = (gameUpdated.msgGame ?? []).map((e) =>
        withId<SpaceEvent>({
          t: "game",
          spaceId: msgEventWithMeta.spaceId,
          c: e,
        })
      );

      const merged = mergeUpdatedGame({
        gameUpdated,
        model,
        spaceId: msgEventWithMeta.spaceId,
      });

      return {
        ...merged,
        msgEvent: msgEventsNew,
      };
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

export const subscriptions: Module["subscriptions"] = (input) => {
  return subscriptionsCurrentUserGame(input);
};

export const subscriptionsCurrentUserGame: Module["subscriptions"] = ({
  ctx,
  model,
}) => {
  const { currentUserId } = ctx;

  if (!currentUserId) {
    return Sub.None;
  }

  const clientCtx = { ...ctx, currentUserId };

  const spaceId = Spaces.toSpaceIdByUserId({
    model,
    userId: currentUserId,
  });

  if (!spaceId) {
    return Sub.None;
  }

  const spaceModel = model.spaces[spaceId];

  if (!spaceModel) {
    return Sub.None;
  }

  const spaceState = Space.toSpaceStarted(spaceModel);

  if (!spaceState) {
    return Sub.None;
  }

  const modelGame = spaceState.game;

  if (!modelGame) {
    return Sub.None;
  }

  const gameModel = model.games[spaceId] ?? Game.init(modelGame.t);

  const gameSub = Game.subscriptions({
    ctx: { ...clientCtx, space: spaceState, quit() {}, viewProfile() {} },
    modelGame: modelGame,
    model: gameModel,
  });

  const sub = Sub.map(gameSub, (c): ClientMsg => ({ t: "game", c, spaceId }));

  return sub;
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
    dispatch({ t: "msgEvent", c: withId(m) });
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
  const spaceState = Spaces.toSpaceState(model, spaceId);

  switch (spaceState.type) {
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
          spaceState={spaceState}
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
  spaceState,
}: {
  model: ClientModel;
  ctx: ClientCtx;
  dispatchEvent: (m: SpaceEvent) => void;
  dispatch: (m: ClientMsg) => void;
  spaceState: SpaceState.Started;
}) => {
  const spaceCtx: SpaceClientCtx = {
    ...ctx,
    space: spaceState,
    viewProfile: (userId) => {
      dispatch({ t: "clicked-user", userId: userId });
    },
    quit: () => {
      dispatchEvent({
        t: "user-inputted-game",
        spaceId: spaceState.spaceId,
        userId: ctx.currentUserId,
        game: null,
      });
    },
  };

  return (
    <>
      <ViewSpaceScreenMain
        space={spaceState}
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
  spaceState,
  ctx,
  model,
}: {
  spaceState: SpaceState.State;
  dispatch: (m: ClientMsg) => void;
  model: ClientModel;
  ctx: SpaceClientCtx;
}) => {
  const msgEvent =
    spaceState.type === "started"
      ? Spaces.toEventWithMeta(
          model,
          spaceState.spaceId,
          spaceState.latestEvent
        )
      : null;

  return (
    <div className="flex h-6 w-full items-center justify-center border-b border-neutral-600 p-1">
      {spaceState.type === "started" && msgEvent ? (
        <ViewFeedItem ctx={ctx} msgEvent={msgEvent} state={spaceState} />
      ) : null}
    </div>
  );
};

const ViewFeedItem = ({
  ctx,
  msgEvent,
  state,
}: {
  ctx: SpaceClientCtx;
  msgEvent: WithEventId<SpaceEvent>;
  state: SpaceState.Started;
}) => {
  switch (msgEvent.t) {
    case "game": {
      if (!state.game) {
        return null;
      }
      return (
        <Game.ViewFeedItem
          ctx={ctx}
          msgGame={{ ...msgEvent, ...msgEvent.c }}
          modelGame={state.game}
          dispatch={(_msg) => {
            //
          }}
        />
      );
    }

    case "user-ended-space": {
      const profile = ctx.profiles[msgEvent.userId];
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} ended the space`}
        />
      );
    }

    case "user-inputted-game": {
      const profile = ctx.profiles[msgEvent.userId];
      if (!msgEvent.game) {
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
      const profile = ctx.profiles[msgEvent.userId];
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} joined the space`}
        />
      );
    }

    case "user-left-space": {
      const profile = ctx.profiles[msgEvent.userId];
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} left the space`}
        />
      );
    }

    case "user-started-space": {
      const profile = ctx.profiles[msgEvent.userId];
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} started the space`}
        />
      );
    }
  }
};

export const ViewScreenJoinSpace = ({
  model,
  ctx,
  dispatch,
  dispatchEvent,
}: {
  ctx: SpaceClientCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
  dispatchEvent: (m: SpaceEvent) => void;
}) => {
  const space = Spaces.toSpaceState(model, ctx.space.spaceId);

  const header = (
    <>
      <TopBar
        left={
          <TopBarBackButton
            onClick={() =>
              dispatch({ t: "clicked-back-button", from: "join-screen" })
            }
          />
        }
        title="Space"
      />
      <ViewFeed
        ctx={ctx}
        dispatch={dispatch}
        model={model}
        spaceState={space}
      />
    </>
  );

  switch (space.type) {
    case "ended": {
      return (
        <div className="flex h-full w-full flex-col">
          {header}
          <div className="w-full flex-1 items-center justify-center">
            Space not found
          </div>
        </div>
      );
    }
    case "initial": {
      return (
        <div className="flex h-full w-full flex-col">
          {header}
          <div className="w-full flex-1 items-center justify-center">
            Space not found
          </div>
        </div>
      );
    }
    case "started": {
      const game = space.game;

      return (
        <div className="flex h-full w-full flex-col">
          {header}

          <div className="flex w-full flex-1 flex-col overflow-y-scroll">
            <ViewGameHeader
              title={game ? gameNameToString(game.t) : null}
              renderCoverArt={
                game
                  ? (props) => (
                      <div {...props}>
                        <CoverArt gameName={game.t} />
                      </div>
                    )
                  : undefined
              }
            />

            <ViewUsersInSpaceList ctx={ctx} />
          </div>

          <div className="flex border-t border-neutral-600 p-4">
            <Button
              className="w-full"
              variant="contained"
              color="primary"
              onClick={() => {
                dispatchEvent({
                  t: "user-joined-space",
                  userId: ctx.currentUserId,
                  spaceId: ctx.space.spaceId,
                });
              }}
              text="Join space"
            />
          </div>
        </div>
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
  space: SpaceState.Started;
  model: ClientModel;
  ctx: SpaceClientCtx;
  dispatch: (m: ClientMsg) => void;
  dispatchEvent: (m: SpaceEvent) => void;
}) => {
  const currentUserSpaceId = Spaces.toSpaceIdByUserId({
    model,
    userId: ctx.currentUserId,
  });

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

      <ViewFeed
        spaceState={space}
        ctx={ctx}
        model={model}
        dispatch={dispatch}
      />

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
  space: SpaceState.Started;
  model: ClientModel;
  ctx: SpaceClientCtx;
  dispatch: (m: ClientMsg) => void;
  dispatchEvent: (m: SpaceEvent) => void;
}) => {
  if (space.game) {
    return (
      <Game.View
        modelGame={space.game}
        ctx={ctx}
        dispatch={(c) => dispatch({ t: "game", spaceId: ctx.space.spaceId, c })}
        model={model.games[ctx.space.spaceId] ?? Game.init(space.game.t)}
      />
    );
  }

  return <ViewScreenNotInGame ctx={ctx} dispatchEvent={dispatchEvent} />;
};

const ViewTopBar = ({
  ctx,
  dispatch,
  dispatchEvent,
}: {
  ctx: SpaceClientCtx;
  dispatch: (m: ClientMsg) => void;
  dispatchEvent: (m: SpaceEvent) => void;
}) => {
  const peopleCount = Object.keys(ctx.space.users).length;

  return (
    <nav className="flex h-14 w-full items-center border-b border-neutral-600">
      <ViewTopButton
        onClick={() =>
          dispatch({
            t: "clicked-link",
            route: { t: "spaces", c: { t: "space-list" } },
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
};

const ViewTopButton = ({
  icon,
  label,
  onClick,
}: {
  icon: VDom;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button className="grid w-20 place-items-center py-1" onClick={onClick}>
      {icon}
      <p className="text-xs">{label}</p>
    </button>
  );
};

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
            route: { t: "spaces", c: { t: "space-list" } },
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
            route: { t: "spaces", c: { t: "space-list" } },
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
  const dispatchEvent = (msg: SpaceEvent) =>
    dispatch({ t: "msgEvent", c: withId(msg) });

  const userSpaceId = model.spaceIdByUserId[ctx.currentUserId];

  if (!userSpaceId) {
    return null;
  }

  const space = Spaces.toSpaceStarted(model, userSpaceId);

  if (!space) {
    return null;
  }

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
              t: "spaces",
              c: { t: "space", spaceId: space.spaceId },
            },
          });
        }}
      >
        <div className="mr-2 p-2">
          {!space.game ? (
            <Avatar
              src={hostProfile?.avatarUrl}
              alt="Host Avatar"
              className="h-12 w-12"
            />
          ) : (
            <div className="h-12 w-12 overflow-hidden rounded border border-neutral-600">
              <CoverArt gameName={space.game.t} />
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
