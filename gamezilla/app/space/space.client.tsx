import { Eff, Sub, chain } from "gamezilla/@SHARED/core";
import {
  ClientCmd,
  ClientCtx,
  ClientEvt,
  RouteGameSpace,
  ViewCtx,
  gotProfiles,
  sendToServer,
} from "gamezilla/app/@SHARED/client";
import { SpaceId } from "gamezilla/app/@SHARED/data";
import {
  ActionButton,
  Button,
  Drawer,
  IconHome,
  IconUserGroup,
  IconVolumeHigh,
  IconVolumeXMark,
  IconXMark,
  LoadingScreen,
  MyAvatar,
  VDom,
} from "gamezilla/app/@SHARED/ui";
import { SpaceViewCtx } from "gamezilla/app/space/@SHARED";
import {
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "gamezilla/app/space/game/@SHARED";
import * as GameClient from "./game/game.client";
import { ViewCoverArt } from "./game/game.core";
import {
  ViewNotInGameScreen,
  ViewSpaceJoinScreen,
  ViewSpaceListScreen,
} from "./space-ui";
import {
  ClientModel,
  ClientMsg,
  Event,
  StateStarted,
  ToClient,
  ToServer,
  updateCore,
  mergeModels,
  toState,
} from "./space.core";
import { withMeta } from "gamezilla/app/space/@SHARED";

//
//
//
// Model
//
//
//

export const init: {
  model: ClientModel;
  cmd: ClientCmd<ToServer>[];
} = {
  model: {
    spaceEvents: {},
    spaceIdByUserId: {},
    games: {},
    modal: null,
    previewUserId: null,
  },
  cmd: [],
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
  ctx: ClientCtx;
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  evt?: ClientEvt[];
  cmd?: ClientCmd<ToServer>[];
} => {
  switch (msg.t) {
    case "modal-closed": {
      return { model: { ...model, modal: null } };
    }

    case "modal-open": {
      return { model: { ...model, modal: msg.c } };
    }

    case "clicked-user": {
      return {
        model: {
          ...model,
          previewUserId: msg.userId,
          modal: "user-preview",
        },
      };
    }

    case "game-msg": {
      const spaceId = model.spaceIdByUserId[ctx.currentUserId];

      if (!spaceId) {
        return { model };
      }

      const game = model.games[spaceId];

      if (!game) {
        return { model };
      }

      const spaceModel = model.spaceEvents[spaceId];

      if (!spaceModel) {
        return { model };
      }

      const state = toState(model.spaceIdByUserId, spaceModel);

      if (state.type === "initial") {
        return { model };
      }

      if (state.type === "ended") {
        return { model };
      }

      if (!state.game) {
        return { model };
      }

      const updated = GameClient.update({
        ctx: { ...ctx, space: state },
        msg: msg.c,
        model: game,
        state: state.game,
      });

      const modelNew: ClientModel = {
        ...model,
        games: {
          ...model.games,
          [spaceId]: updated.model,
        },
      };

      return {
        model: modelNew,
        eff: Eff.t("game-msg", updated.eff),
        cmd: ClientCmd.map(updated.cmd ?? [], (m) => ({
          t: "game-msg",
          spaceId: spaceId,
          c: m,
        })),
      };
    }

    default: {
      return chain(
        model,
        (model): ReturnType<typeof update> => {
          const updated = updateCore(model, msg);

          const modelNew: ClientModel = {
            ...model,
            ...updated,
          };

          return {
            model: modelNew,
            cmd: [
              sendToServer({
                ...msg,
                profile: ctx.profiles[ctx.currentUserId],
              }),
            ],
          };
        },
        (model) => {
          return updateGameModel({ msg, ctx, model });
        }
      );
    }
  }
};

export const updateFromServer = ({
  ctx,
  msg,
  model,
}: {
  ctx: ClientCtx;
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  evt?: ClientEvt[];
  cmd?: ClientCmd<ToServer>[];
} => {
  return chain(
    model,
    (model): ReturnType<typeof updateFromServer> => {
      switch (msg.t) {
        case "game-msg": {
          const space = model.spaceEvents[msg.spaceId];

          if (!space) {
            return { model };
          }

          const state = toState(model.spaceIdByUserId, space);

          if (state.type === "initial") {
            return { model };
          }

          if (state.type === "ended") {
            return { model };
          }

          const game = model.games[msg.spaceId];

          if (!game) {
            return { model };
          }

          if (!state.game) {
            return { model };
          }

          const updated = GameClient.updateFromServer({
            ctx: { ...ctx, space: state },
            model: game,
            msg: msg.c,
            state: state.game,
          });

          return {
            model: {
              ...model,
              games: {
                ...model.games,
                [msg.spaceId]: updated.model,
              },
            },
            eff: Eff.t("game-msg", updated.eff),
            cmd: ClientCmd.map(updated.cmd ?? [], (m) => ({
              t: "game-msg",
              spaceId: msg.spaceId,
              c: m,
            })),
          };
        }

        case "sync": {
          const merged = mergeModels(model, msg.model);
          return {
            model: { ...model, ...merged },
          };
        }

        default: {
          return chain(
            model,
            (model) => {
              const modelNew = updateCore(model, msg);

              return {
                model: {
                  ...model,
                  ...modelNew,
                },
              };
            },
            (model) => {
              return updateGameModel({ msg, ctx, model });
            }
          );
        }
      }
    },
    (model) => {
      return {
        model,
        evt: msg.profiles ? [gotProfiles(msg.profiles)] : [],
      };
    }
  );
};

const updateGameModel = ({
  model,
  msg,
  ctx,
}: {
  model: ClientModel;
  msg: Event;
  ctx: ClientCtx;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<ToServer>[];
} => {
  switch (msg.t) {
    case "user-inputted-game": {
      const spaceModel = model.spaceEvents[msg.spaceId];

      if (!spaceModel) {
        return { model };
      }

      const state = toState(model.spaceIdByUserId, spaceModel);

      if (state.type === "initial") {
        return { model };
      }

      if (state.type === "ended") {
        return { model };
      }

      if (!state.game) {
        return { model };
      }

      const initial = GameClient.init({
        ctx: { ...ctx, space: state },
        state: state.game,
      });

      return {
        model: {
          ...model,
          games: {
            ...model.games,
            [msg.spaceId]: initial.model,
          },
        },
        eff: Eff.t("game-msg", initial.eff),
        cmd: ClientCmd.map(initial.cmd ?? [], (m) => ({
          t: "game-msg",
          spaceId: msg.spaceId,
          c: m,
        })),
      };
    }

    case "game": {
      const spaceModel = model.spaceEvents[msg.spaceId];

      if (!spaceModel) {
        return { model };
      }

      const state = toState(model.spaceIdByUserId, spaceModel);

      if (state.type === "initial") {
        return { model };
      }

      if (state.type === "ended") {
        return { model };
      }

      if (!state.game) {
        return { model };
      }

      const updated = GameClient.updateFromGame({
        ctx: { ...ctx, space: state },
        msg: msg.c,
        model: model.games[msg.spaceId],
        state: state.game,
      });

      return {
        model: {
          ...model,
          games: {
            ...model.games,
            [msg.spaceId]: updated.model,
          },
        },
        eff: Eff.t("game-msg", updated.eff),
        cmd: ClientCmd.map(updated.cmd ?? [], (m) => ({
          t: "game-msg",
          spaceId: msg.spaceId,
          c: m,
        })),
      };
    }

    default: {
      return { model };
    }
  }
};

export const updateFromEvent = (input: {
  msg: ClientEvt;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
} => {
  const { msg, model } = input;

  switch (msg.t) {
    case "route-changed": {
      return { model: { ...model, modal: null } };
    }
    default: {
      return input;
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

export const subscriptions = (
  ctx: ClientCtx,
  model: ClientModel
): Sub<ClientMsg> => {
  for (const spaceId in model.spaceEvents) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }

    const game = model.games[spaceId];

    if (!game) {
      continue;
    }

    const space = model.spaceEvents[spaceId];

    if (!space) {
      continue;
    }

    const state = toState(model.spaceIdByUserId, space);

    if (state.type === "initial") {
      continue;
    }

    if (state.type === "ended") {
      continue;
    }

    if (!state.game) {
      continue;
    }

    return Sub.tag(
      "game-msg",
      GameClient.subscriptions({
        ctx: { ...ctx, space: state },
        state: state.game,
        model: game,
        intervalId: String(spaceId),
      })
    );
  }

  return Sub.None;
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
    dispatch(withMeta(m));
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
  const space = model.spaceEvents[spaceId];

  if (!space) {
    return <ViewSpaceNotFound ctx={ctx} />;
  }

  const state = toState(model.spaceIdByUserId, space);

  if (state.type === "initial") {
    return <LoadingScreen />;
  }

  if (state.type === "ended") {
    return <ViewSpaceEnded ctx={ctx} />;
  }

  const spaceCtx: SpaceViewCtx = {
    ...ctx,
    space: state,
    viewProfile: (userId) => dispatch({ t: "clicked-user", userId: userId }),
    quit: () =>
      dispatchEvent({
        t: "user-inputted-game",
        spaceId: state.spaceId,
        userId: ctx.currentUserId,
        game: null,
      }),
  };

  return (
    <>
      {/* <pre class="w-full text-xs">{JSON.stringify(state, null, 4)}</pre> */}

      <ViewSpaceScreenMain
        state={state}
        dispatchEvent={dispatchEvent}
        dispatch={dispatch}
        model={model}
        ctx={spaceCtx}
      />

      <Drawer
        id="users"
        open={model.modal === "users"}
        onClose={() => dispatch({ t: "modal-closed" })}>
        <ViewUsersInSpaceList ctx={spaceCtx} />
      </Drawer>

      <Drawer
        id="user-preview"
        open={model.modal === "user-preview"}
        onClose={() => dispatch({ t: "modal-closed" })}>
        <div>
          <button
            className="flex w-full flex-col items-center justify-center gap-2 p-4"
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
            }}>
            <MyAvatar
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
                  ctx.push({
                    t: "profile",
                    c: {
                      t: "profile",
                      userId: model.previewUserId,
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

const ViewSpaceScreenMain = ({
  ctx,
  state,
  model,
  dispatch,
  dispatchEvent,
}: {
  state: StateStarted;
  model: ClientModel;
  ctx: SpaceViewCtx;
  dispatch: (m: ClientMsg) => void;
  dispatchEvent: (m: Event) => void;
}) => {
  const currentUserSpaceId = model.spaceIdByUserId[ctx.currentUserId];

  if (!currentUserSpaceId) {
    return (
      <ViewSpaceJoinScreen
        ctx={ctx}
        dispatchEvent={dispatchEvent}
        model={model}
      />
    );
  }

  if (state.spaceId !== currentUserSpaceId) {
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
    <div className="flex h-full w-full flex-1 flex-col">
      <nav className="flex h-14 w-full items-center border-b border-neutral-700 px-2 py-1">
        <div className="grid w-20 place-items-center">
          <ActionButton
            label="Home"
            icon={<IconHome className="h-6 w-6" />}
            onClick={() => ctx.push({ t: "space", c: { t: "space-list" } })}
          />
        </div>

        <div className="grid w-20 place-items-center">
          <ActionButton
            label={peopleCount > 1 ? `People (${peopleCount})` : `People`}
            icon={<IconUserGroup className="h-6 w-6" />}
            onClick={() => dispatch({ t: "modal-open", c: "users" })}
          />
        </div>

        <div className="flex-1"></div>

        <div className="w-20">
          <ActionButton
            label={ctx.sound.muted ? "Unmute" : "Mute"}
            icon={
              ctx.sound.muted ? (
                <IconVolumeHigh className="h-6 w-6" />
              ) : (
                <IconVolumeXMark className="h-6 w-6" />
              )
            }
            onClick={ctx.toggleSound}
          />
        </div>

        {ctx.space.hostId !== ctx.currentUserId && (
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
        )}

        {ctx.space.hostId === ctx.currentUserId && (
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
        )}
      </nav>

      <div className="flex w-full flex-1 flex-col overflow-hidden">
        {state.game ? (
          <GameClient.View
            state={state.game}
            ctx={ctx}
            dispatchEvent={(c) =>
              dispatchEvent({ t: "game", spaceId: ctx.space.spaceId, c })
            }
            dispatch={(msg) => dispatch({ t: "game-msg", c: msg })}
            model={
              gameModel ??
              GameClient.init({
                ctx,
                state: state.game,
              }).model
            }
          />
        ) : (
          <ViewNotInGameScreen ctx={ctx} dispatchEvent={dispatchEvent} />
        )}
      </div>
    </div>
  );
};

const ViewSpaceNotFound = ({ ctx }: { ctx: ViewCtx }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">Space not found</p>
      <Button
        onClick={() => ctx.push({ t: "space", c: { t: "space-list" } })}
        size="lg"
        variant="contained"
        color="primary"
        start={<IconHome className="h-6 w-6" />}
        text="Go Home"
      />
    </div>
  );
};

const ViewSpaceEnded = ({ ctx }: { ctx: ViewCtx }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">Space ended</p>
      <Button
        onClick={() => ctx.push({ t: "space", c: { t: "space-list" } })}
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
  ctx: ViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const dispatchEvent = (msg: Event) => {
    dispatch(withMeta(msg));
  };

  const currentUserSpaceId = model.spaceIdByUserId[ctx.currentUserId];

  if (!currentUserSpaceId) {
    return null;
  }

  const space = model.spaceEvents[currentUserSpaceId];

  if (!space) {
    return null;
  }

  const state = toState(model.spaceIdByUserId, space);

  if (state.type === "initial") {
    return null;
  }

  if (state.type === "ended") {
    return null;
  }

  const game = model.games[currentUserSpaceId];

  const hostProfile = ctx.profiles[state.hostId];

  const userCount = Object.values(state.users).length;

  return (
    <div className="flex w-full items-center overflow-hidden border-t-2 border-blue-600 text-inherit">
      <button
        className="flex flex-1 items-center overflow-hidden"
        onClick={() => {
          ctx.push({
            t: "space",
            c: { t: "space", spaceId: state.spaceId },
          });
        }}>
        <div className="mr-2 p-2">
          {!game && (
            <MyAvatar
              src={hostProfile?.avatarUrl}
              alt="Host Avatar"
              className="h-12 w-12"
            />
          )}
          {game && (
            <div className="h-12 w-12 overflow-hidden rounded border border-neutral-600">
              <ViewCoverArt gameName={game.t} />
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

      {ctx.currentUserId === state.hostId && (
        <button
          aria-label="end space"
          onClick={() => {
            dispatchEvent({
              t: "user-ended-space",
              userId: ctx.currentUserId,
              spaceId: state.spaceId,
            });
          }}
          className="mr-4">
          <IconXMark className="h-8 w-8" />
        </button>
      )}

      {ctx.currentUserId !== state.hostId && (
        <button
          aria-label="leave space"
          onClick={() => {
            dispatchEvent({
              t: "user-left-space",
              userId: ctx.currentUserId,
              spaceId: state.spaceId,
            });
          }}
          className="mr-4">
          <IconXMark className="h-8 w-8" />
        </button>
      )}
    </div>
  );
};
