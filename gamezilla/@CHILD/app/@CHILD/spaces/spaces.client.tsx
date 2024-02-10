import {
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
  addProfiles,
  playSound,
  pushRoute,
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
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Posix, Sub, batchMsgs, notAsked } from "gamezilla/@SHARED/core";
import { CoverArt } from "./@CHILD/game/game-cover-art";
import { Game } from "./@CHILD/game/game.client";
import { SpaceClientModule } from "./architechure/space-client";
import { JoinSpaceClient } from "./join-space/join-space.client";
import { ListSpacesClient } from "./list-spaces/list-spaces.client";
import { ViewScreenNotInGame } from "./spaces-client/view-screen-not-in-game";
import * as Space from "./spaces-core/space";
import { SpaceEvent } from "./spaces-core/space-event";
import * as SpaceState from "./spaces-core/space-state";
import * as Spaces from "./spaces-core/spaces";
import {
  ClientModule,
  ModelClient,
  MsgClient,
  MsgToServer,
} from "./spaces.core";

//
//
//
// Model
//
//
//

export const init: ClientModule["init"] = async ({ ctx }) => {
  const model: ModelClient = {
    ...Spaces.init,
    games: {},
    modal: null,
    previewUserId: null,
    listSpacesRequest: notAsked,
  };
  const listSpaces = await ListSpacesClient.init({ ctx, model });
  return {
    model: {
      ...model,
      ...listSpaces.model,
    },
    eff: Eff.batch([listSpaces.eff]),
    msgCmd: batchMsgs(listSpaces.msgCmd),
    msgEvt: batchMsgs(listSpaces.msgEvt),
  };
};

//
//
//
// Update
//
//
//

export const update: ClientModule["update"] = (input) => {
  return AppClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromServer({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateProfiles({ ...input, model }),
    (model) => updateMainLoop({ ...input, model })
  );
};

const updateProfiles: ClientModule["update"] = ({ model, msgServer }) => {
  if (msgServer?.profiles) {
    return {
      model,
      msgCmd: [addProfiles(msgServer.profiles)],
    };
  }

  return { model };
};

const updateMainLoop: ClientModule["update"] = async (input) => {
  const output = await updateMain(input);

  while (true) {
    const [spaceEvent, ...spaceEventsRest] = output.msgSpaceEvent ?? [];

    if (!spaceEvent) {
      return output;
    }

    const updated = await updateMain({
      ctx: input.ctx,
      model: output.model,
      msgSpaceEvent: spaceEvent,
    });

    output.model = updated.model;
    output.msgSpaceEvent = batchMsgs(spaceEventsRest, updated.msgSpaceEvent);
    output.eff = Eff.batch([output.eff, updated.eff]);
    output.msgCmd = batchMsgs(output.msgCmd, updated.msgCmd);
    output.msgSpaceEvent = batchMsgs(
      output.msgSpaceEvent,
      updated.msgSpaceEvent
    );
  }
};

const updateMain: SpaceClientModule["update"] = (input) => {
  if (
    input.msgSpaceEvent &&
    Spaces.hasEvent(
      input.model,
      input.msgSpaceEvent.spaceId,
      input.msgSpaceEvent.eventId
    )
  ) {
    return { model: input.model };
  }

  return SpaceClientModule.chainUpdates(
    { model: input.model },

    (model) => {
      if (input.msg?.t === "event") {
        return {
          model,
          msgSpaceEvent: [input.msg.c],
        };
      }
      if (input.msgServer?.t === "event") {
        return {
          model,
          msgSpaceEvent: [input.msgServer.c],
        };
      }
      return { model };
    },
    (model) => updateSpacesFromSpaceEvent({ ...input, model }),
    (model) => updateFromSpaceEvent({ ...input, model }),
    (model) => sendSpaceEventToServer({ ...input, model }),
    (model) => JoinSpaceClient.update({ ...input, model }),
    (model) => ListSpacesClient.update({ ...input, model }),
    (model) => updateGame({ ...input, model })
  );
};

const updateSpacesFromSpaceEvent: SpaceClientModule["update"] = ({
  msgSpaceEvent,
  model,
}) => {
  if (!msgSpaceEvent) {
    return { model };
  }

  const updated = Spaces.updateFromSpaceEvent({
    model,
    spaceEvent: msgSpaceEvent,
  });

  return { model: { ...model, ...updated.model } };
};

const updateFromSpaceEvent: SpaceClientModule["update"] = async (input) => {
  const { ctx, model, msgSpaceEvent } = input;

  if (!ctx.currentUserId) {
    return { model };
  }

  switch (msgSpaceEvent?.t) {
    case "user-left-space": {
      const currentUserSpaceId = Spaces.toSpaceIdByUserId(
        model,
        ctx.currentUserId
      );

      if (msgSpaceEvent.spaceId === currentUserSpaceId) {
        return {
          model,
          msgCmd: [playSound(APP_SOUND.navBackward)],
        };
      }
      return { model };
    }

    case "user-started-space": {
      if (msgSpaceEvent.userId === ctx.currentUserId) {
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.navForward),
            pushRoute({
              t: "spaces",
              c: { t: "space", spaceId: msgSpaceEvent.spaceId },
            }),
          ],
        };
      }

      return { model };
    }

    case "user-ended-space": {
      const currentUserSpaceId = Spaces.toSpaceIdByUserId(
        model,
        ctx.currentUserId
      );

      if (msgSpaceEvent.spaceId !== currentUserSpaceId) {
        return { model };
      }

      return SpaceClientModule.chainUpdates(
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
            ctx.currentRoute.c.spaceId === msgSpaceEvent.spaceId
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
          if (msgSpaceEvent.userId === ctx.currentUserId) {
            return {
              model,
              msgCmd: [showToast("Space ended")],
            };
          }

          const profile = ctx.profiles[msgSpaceEvent.userId];

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
      const currentUserSpaceId = Spaces.toSpaceIdByUserId(
        model,
        ctx.currentUserId
      );
      if (msgSpaceEvent.spaceId === currentUserSpaceId) {
        return {
          model,
          msgCmd: [
            playSound(
              msgSpaceEvent.game
                ? APP_SOUND.navForwardMin
                : APP_SOUND.navBackwardMin
            ),
          ],
        };
      }
      return { model };
    }

    default: {
      return { model };
    }
  }
};

const updateFromMsg: ClientModule["update"] = ({ msg, model }) => {
  switch (msg?.t) {
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

    default: {
      return { model };
    }
  }
};

const updateFromServer: ClientModule["update"] = async (input) => {
  const { msgServer, model } = input;

  if (!msgServer) {
    return { model };
  }

  switch (msgServer.t) {
    case "current-user-space":
    case "synced": {
      const merged = Spaces.mergeOne({ model, space: msgServer.space });
      return {
        model: {
          errors: {},
          games: model.games,
          modal: model.modal,
          previewUserId: model.previewUserId,
          spaceIdByUserId: merged.spaceIdByUserId,
          spaces: merged.spaces,
          listSpacesRequest: notAsked,
          listSpacesRequestedAt: Posix.zero,
        },
      };
    }

    default: {
      return { model };
    }
  }
};

const updateFromEvent: ClientModule["update"] = async (input) => {
  if (!input.msgEvt) {
    return { model: input.model };
  }

  const { model, msgEvt } = input;

  switch (msgEvt.t) {
    case "routing/route-changed": {
      return AppClientModule.chainUpdates({ model }, (model) => {
        return { model: { ...model, modal: null } };
      });
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
            causedBy: msgEvt.t,
          }),
        ],
      };
    }

    default: {
      return { model: input.model };
    }
  }
};

const inputToSpaceId = (input: Parameters<ClientModule["update"]>[0]) => {
  if (input.msg && "spaceId" in input.msg) {
    return input.msg.spaceId;
  }

  if (input.msgServer && "spaceId" in input.msgServer) {
    return input.msgServer.spaceId;
  }

  return null;
};

const updateGame: SpaceClientModule["update"] = (input) => {
  const { ctx, model, msgServer, msgEvt, msg, msgSpaceEvent } = input;

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

  const msgSpaceEventWithMeta = msgSpaceEvent?.eventId
    ? Spaces.toEventWithMeta(model, spaceId, msgSpaceEvent?.eventId)
    : null;

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
    msgGame:
      msgSpaceEventWithMeta?.t === "game"
        ? { ...msgSpaceEventWithMeta, ...msgSpaceEventWithMeta.c }
        : null,
    modelGame: modelGame,
    msgServer: msgServer?.t === "game" ? msgServer.c : null,
    msgCmd: null,
    msgEvt,
    msg: msg?.t === "game" ? msg.c : null,
  });

  const msgSpaceEventNew = (gameUpdated.msgGame ?? []).map(
    (e): WithEventId<SpaceEvent> => ({ ...e, spaceId, t: "game", c: e })
  );

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
    msgEvt: [],
    msgSpaceEvent: msgSpaceEventNew,
  };
};

const sendSpaceEventToServer: SpaceClientModule["update"] = ({
  ctx,
  model,
  msgSpaceEvent,
}) => {
  if (!msgSpaceEvent) {
    return { model };
  }

  const msgEvtWithMeta = Spaces.toEventWithMeta(
    model,
    msgSpaceEvent.spaceId,
    msgSpaceEvent.eventId
  );

  if (!msgEvtWithMeta) {
    return { model };
  }

  const profile =
    "userId" in msgEvtWithMeta ? ctx.profiles[msgEvtWithMeta.userId] : null;

  const profiles = profile ? { [profile.userId]: profile } : {};

  return {
    model,
    msgCmd: [sendToServer({ t: "event", c: msgEvtWithMeta, profiles })],
  };
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

export const subscriptions: ClientModule["subscriptions"] = (input) => {
  return subscriptionsCurrentUserGame(input);
};

export const subscriptionsCurrentUserGame: ClientModule["subscriptions"] = ({
  ctx,
  model,
}) => {
  const { currentUserId } = ctx;

  if (!currentUserId) {
    return Sub.None;
  }

  const clientCtx = { ...ctx, currentUserId };

  const spaceId = Spaces.toSpaceIdByUserId(model, currentUserId);

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

  const sub = Sub.map(gameSub, (c): MsgClient => ({ t: "game", c, spaceId }));

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
  viewBottomBar,
}: {
  model: ModelClient;
  ctx: ClientCtx;
  dispatch: (m: MsgClient) => void;
  viewBottomBar: VDom;
}): VDom => {
  const dispatchEvent = (m: SpaceEvent) => {
    dispatch({ t: "event", c: withId(m) });
  };
  switch (ctx.currentRoute.t) {
    case "spaces": {
      switch (ctx.currentRoute.c.t) {
        case "space-list": {
          return (
            <>
              <ListSpacesClient.View
                dispatch={dispatch}
                ctx={ctx}
                model={model}
              />

              {viewBottomBar}
            </>
          );
        }

        case "space": {
          return (
            <ViewSpaceScreen
              dispatchEvent={dispatchEvent}
              spaceId={ctx.currentRoute.c.spaceId}
              ctx={ctx}
              dispatch={dispatch}
              model={model}
            />
          );
        }
      }
    }
    default: {
      return null;
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
  model: ModelClient;
  ctx: ClientCtx;
  dispatchEvent: (m: SpaceEvent) => void;
  dispatch: (m: MsgClient) => void;
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
  model: ModelClient;
  ctx: ClientCtx;
  dispatchEvent: (m: SpaceEvent) => void;
  dispatch: (m: MsgClient) => void;
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
  dispatch: (m: MsgClient) => void;
  model: ModelClient;
  ctx: SpaceClientCtx;
}) => {
  const msgEvt =
    spaceState.type === "started"
      ? Spaces.toEventWithMeta(
          model,
          spaceState.spaceId,
          spaceState.latestEvent
        )
      : null;

  return (
    <div className="flex h-6 w-full items-center justify-center border-b border-neutral-600 p-1">
      {spaceState.type === "started" && msgEvt ? (
        <ViewFeedItem ctx={ctx} msgEvt={msgEvt} state={spaceState} />
      ) : null}
    </div>
  );
};

const ViewFeedItem = ({
  ctx,
  msgEvt,
  state,
}: {
  ctx: SpaceClientCtx;
  msgEvt: WithEventId<SpaceEvent>;
  state: SpaceState.Started;
}) => {
  switch (msgEvt.t) {
    case "game": {
      if (!state.game) {
        return null;
      }
      return (
        <Game.ViewFeedItem
          ctx={ctx}
          msgGame={{ ...msgEvt, ...msgEvt.c }}
          modelGame={state.game}
          dispatch={(_msg) => {
            //
          }}
        />
      );
    }

    case "user-ended-space": {
      const profile = ctx.profiles[msgEvt.userId];
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} ended the space`}
        />
      );
    }

    case "user-inputted-game": {
      const profile = ctx.profiles[msgEvt.userId];
      if (!msgEvt.game) {
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
      const profile = ctx.profiles[msgEvt.userId];
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} joined the space`}
        />
      );
    }

    case "user-left-space": {
      const profile = ctx.profiles[msgEvt.userId];
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} left the space`}
        />
      );
    }

    case "user-started-space": {
      const profile = ctx.profiles[msgEvt.userId];
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
  space: SpaceState.Started;
  model: ModelClient;
  ctx: SpaceClientCtx;
  dispatch: (m: MsgClient) => void;
  dispatchEvent: (m: SpaceEvent) => void;
}) => {
  const currentUserSpaceId = Spaces.toSpaceIdByUserId(model, ctx.currentUserId);

  if (currentUserSpaceId !== space.spaceId) {
    return <JoinSpaceClient.View ctx={ctx} dispatch={dispatch} model={model} />;
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
  model: ModelClient;
  ctx: SpaceClientCtx;
  dispatch: (m: MsgClient) => void;
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
  dispatch: (m: MsgClient) => void;
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
  dispatch: (m: MsgClient) => void;
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

const ViewSpaceEnded = ({ dispatch }: { dispatch: (m: MsgClient) => void }) => {
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
  model: ModelClient;
  dispatch: (msg: MsgClient) => void;
}) => {
  const dispatchEvent = (msg: SpaceEvent) =>
    dispatch({ t: "event", c: withId(msg) });

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
