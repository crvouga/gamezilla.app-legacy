import {
  Eff,
  Loading,
  Ok,
  Result,
  Sub,
  andThen,
  dissoc,
  p,
} from "gamezilla/@SHARED/core";
import {
  APP_SOUND,
  ClientCmd,
  ClientCtx,
  ClientEvt,
  RouteGameSpace,
  ViewCtx,
  gotProfiles,
  playSound,
  preloadSound,
  pushRoute,
  replaceRoute,
  sendToServer,
  showToast,
} from "gamezilla/app/@SHARED/client";
import { Profile, SpaceId, UserId } from "gamezilla/app/@SHARED/data";
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
import { Space, SpaceViewCtx } from "gamezilla/app/space/@SHARED";
import {
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "gamezilla/app/space/game/@SHARED";
import * as GameClient from "./game/game.client";
import * as Game from "./game/game.core";
import { ViewCoverArt } from "./game/game.core";
import {
  ViewNotInGameScreen,
  ViewSpaceJoinScreen,
  ViewSpaceListScreen,
} from "./space-ui";
import {
  ClientModel,
  ClientMsg,
  Req,
  Res,
  ToClient,
  ToClientExtra,
  ToServer,
  toSpaceByUserId,
} from "./space.core";

//
//
//
// Model
//
//
//

const SPACE_SOUND = {
  // joined: "./space/joined.wav",
  // left: "./space/left.wav",
  joined: APP_SOUND.navForward,
  left: APP_SOUND.navBackward,
};

export const init: {
  model: ClientModel;
  cmd: ClientCmd<ToServer>[];
} = {
  model: {
    spaces: {},
    requests: {},
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

    case "clicked-user-link": {
      return {
        model: { ...model, modal: null },
        cmd: [
          pushRoute({ t: "profile", c: { t: "profile", userId: msg.userId } }),
        ],
      };
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

    case "game": {
      const space = toSpaceByUserId(model, ctx.currentUserId);

      if (!space) {
        return { model };
      }

      if (!space.game) {
        return { model };
      }

      const updated = GameClient.update({
        ctx: { ...ctx, hostId: space.hostId },
        msg: msg.c,
        model: space.game,
      });

      const spaceNew: Space<Game.ClientModel> = {
        ...space,
        game: updated.model,
      };

      const modelNew: ClientModel = {
        ...model,
        spaces: {
          ...model.spaces,
          [space.spaceId]: spaceNew,
        },
      };

      return {
        model: modelNew,
        eff: Eff.t("game", updated.eff),
        evt: updated.evt,
        cmd: ClientCmd.tag("game", updated.cmd),
      };
    }

    case "create": {
      return p(
        { model },
        andThen((model) => updateRequest({ ctx, msg, model })),
        andThen((model) => {
          return {
            model,
            cmd: [
              pushRoute({
                t: "space",
                c: { t: "space", spaceId: msg.spaceId },
              }),
            ],
          };
        })
      );
    }

    default: {
      return updateRequest({ ctx, msg, model });
    }
  }
};

const updateRequest = ({
  ctx,
  msg,
  model,
}: {
  ctx: ClientCtx;
  msg: Req & ToClientExtra;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
  eff?: Eff<ClientMsg>;
  evt?: ClientEvt[];
} => {
  return {
    model: { ...model, requests: { ...model.requests, [msg.t]: Loading } },
    cmd: [sendToServer({ ...msg, profile: ctx.profiles[ctx.currentUserId] })],
  };
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
  return p(
    { model },
    andThen((model) => updateFromServerMain({ ctx, msg, model })),
    andThen((model) => {
      return {
        model,
        evt: msg.profiles ? [gotProfiles(msg.profiles)] : [],
      };
    })
  );
};

export const updateFromServerMain: typeof updateFromServer = ({
  ctx,
  msg,
  model,
}) => {
  switch (msg.t) {
    case "game": {
      const space = model.spaces[msg.spaceId];

      if (!space) {
        return { model };
      }

      if (!space.game) {
        return { model };
      }

      const updated = GameClient.updateFromServer({
        ctx: { ...ctx, hostId: space.hostId },
        model: space.game,
        msg: msg.c,
      });

      const spaceNew = {
        ...space,
        game: updated.model,
      };

      const modelNew: ClientModel = {
        ...model,
        spaces: {
          ...model.spaces,
          [space.spaceId]: spaceNew,
        },
      };

      return {
        model: modelNew,
        eff: Eff.t("game", updated.eff),
        evt: updated.evt,
        cmd: ClientCmd.tag("game", updated.cmd),
      };
    }

    case "list": {
      return p(
        { model },
        andThen((model) => updateLoading({ msg: msg, model })),
        andThen((model) => {
          if (msg.result.t === "err") {
            return { model, cmd: [showToast(msg.result.error, "error")] };
          }

          let merged: ReturnType<typeof updateFromServer> = {
            model: {
              ...model,
              spaces: {},
            },
          };

          let profiles: { [userId: UserId]: Profile } = {};

          for (const server of msg.result.value) {
            const mergedSpace = mergeWithServer({
              ctx,
              client: merged.model.spaces[server.spaceId],
              server: server,
            });
            merged = {
              model: {
                ...merged.model,
                spaces: {
                  ...merged.model.spaces,
                  [server.spaceId]: mergedSpace.client,
                },
              },
              eff: Eff.batch([merged.eff, mergedSpace.eff]),
              cmd: [...(merged?.cmd ?? []), ...(mergedSpace.cmd ?? [])],
              evt: [...(merged?.evt ?? []), ...(mergedSpace.evt ?? [])],
            };
            profiles = {
              ...profiles,
              ...server.profileCache,
            };
          }

          merged = {
            ...merged,
            evt: [...(merged?.evt ?? []), gotProfiles(profiles)],
          };
          return merged;
        })
      );
    }

    case "destroy": {
      return p(
        { model },
        andThen((model) => updateLoading({ msg: msg, model })),
        andThen((model): ReturnType<typeof update> => {
          const currentUserSpace = toSpaceByUserId(model, ctx.currentUserId);

          if (currentUserSpace?.spaceId !== msg.spaceId) {
            return { model };
          }

          if (msg.result.t === "err") {
            return { model, cmd: [showToast(msg.result.error, "error")] };
          }

          const profile = ctx.profiles[msg.userId];

          const toastCmd =
            msg.userId === ctx.currentUserId
              ? []
              : profile
              ? [showToast(`${profile.username} ended space`)]
              : [showToast("Space ended")];

          return {
            model,
            cmd: [
              playSound(SPACE_SOUND.left),
              replaceRoute({ t: "space", c: { t: "space-list" } }),
              ...toastCmd,
            ],
          };

          return { model };
        }),
        andThen((model) => {
          if (msg.result.t !== "ok") {
            return { model };
          }
          return {
            model: { ...model, spaces: dissoc(model.spaces, msg.spaceId) },
          };
        })
      );
    }

    case "join": {
      return p(
        { model },
        andThen((model) => updateLoading({ msg: msg, model })),
        andThen((model) => mergeWithResult({ ctx, result: msg.result, model })),
        andThen((model) => {
          if (msg.result.t === "err") {
            return {
              model,
              cmd: [
                showToast(msg.result.error, "error", 4000),
                playSound(APP_SOUND.error),
              ],
            };
          }

          const currentUserSpace = toSpaceByUserId(model, ctx.currentUserId);

          if (currentUserSpace?.spaceId !== msg.spaceId) {
            return { model };
          }

          if (msg.userId === ctx.currentUserId) {
            return {
              model,
              cmd: [playSound(SPACE_SOUND.joined)],
            };
          }

          const profile = ctx.profiles[msg.userId];

          if (!profile) {
            return { model, cmd: [playSound(SPACE_SOUND.joined)] };
          }

          return {
            model,
            cmd: [
              showToast(`${profile.username} joined space`),
              playSound(SPACE_SOUND.joined),
            ],
          };
        })
      );
    }

    case "leave": {
      return p(
        { model },
        andThen((model) => updateLoading({ msg: msg, model })),
        andThen((model) => mergeWithResult({ ctx, result: msg.result, model })),
        andThen((model) => {
          if (msg.result.t === "err") {
            return { model };
          }

          if (msg.userId === ctx.currentUserId) {
            return { model, cmd: [playSound(SPACE_SOUND.left)] };
          }

          const profile = ctx.profiles[msg.userId];

          if (!profile) {
            return { model, cmd: [playSound(SPACE_SOUND.left)] };
          }

          return {
            model,
            cmd: [
              showToast(`${profile.username} left space`),
              playSound(SPACE_SOUND.left),
            ],
          };
        })
      );
    }

    case "create": {
      return p(
        { model },
        andThen((model) => updateLoading({ msg: msg, model })),
        andThen((model) => mergeWithResult({ ctx, result: msg.result, model })),
        andThen((model) => {
          if (msg.result.t === "err") {
            return { model };
          }

          const currentUserSpace = toSpaceByUserId(model, ctx.currentUserId);

          if (currentUserSpace?.spaceId !== msg.spaceId) {
            return { model };
          }

          return {
            model,
            cmd: [
              playSound(SPACE_SOUND.joined),
              replaceRoute({
                t: "space",
                c: { t: "space", spaceId: msg.spaceId },
              }),
            ],
          };
        })
      );
    }

    case "input-game": {
      return p(
        { model },
        andThen((model) => updateLoading({ msg: msg, model })),
        andThen((model) => mergeWithResult({ ctx, result: msg.result, model })),
        andThen((model) => {
          if (msg.result.t === "err") {
            return { model };
          }

          const currentUserSpace = toSpaceByUserId(model, ctx.currentUserId);

          if (currentUserSpace?.spaceId !== msg.spaceId) {
            return { model };
          }

          if (msg.result.value.game) {
            return {
              model,
              cmd: [playSound(APP_SOUND.navForwardMin)],
            };
          }

          return {
            model,
            cmd: [playSound(APP_SOUND.navBackwardMin)],
          };
        })
      );
    }
  }
};

const updateLoading = ({
  msg,
  model,
}: {
  msg: Res;
  model: ClientModel;
}): ReturnType<typeof updateFromServer> => {
  return {
    model: {
      ...model,
      requests: {
        ...model.requests,
        [msg.t]: msg.result,
      },
    },
  };
};

const mergeWithResult = ({
  ctx,
  model,
  result,
}: {
  ctx: ClientCtx;
  result: Result<string, Space<Game.ServerModel>>;
  model: ClientModel;
}): ReturnType<typeof updateFromServer> => {
  if (result.t === "err") {
    return { model };
  }
  const merged = mergeWithServer({
    ctx,
    server: result.value,
    client: model.spaces[result.value.spaceId],
  });
  return {
    model: {
      ...model,
      spaces: {
        ...model.spaces,
        [merged.client.spaceId]: merged.client,
      },
    },
    cmd: merged.cmd,
    evt: merged.evt,
    eff: merged.eff,
  };
};

export const updateFromEvt = (input: {
  msg: ClientEvt;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
} => {
  const { msg } = input;

  switch (msg.t) {
    default: {
      return input;
    }
  }
};

const listSpaces = (input: {
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
} => {
  const { model } = input;

  return {
    model: {
      ...model,
      requests: {
        ...model.requests,
        list: Loading,
      },
    },
    cmd: [sendToServer({ t: "list" })],
  };
};

/**
 * Merges server space state into client space state.
 */
const mergeWithServer = ({
  ctx,
  client,
  server,
}: {
  ctx: ClientCtx;
  client?: Space<Game.ClientModel> | null;
  server: Space<Game.ServerModel>;
}): {
  client: Space<Game.ClientModel>;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<ToServer>[];
  evt?: ClientEvt[];
} => {
  if (!server.game) {
    const clientNew: Space<Game.ClientModel> = {
      ...client,
      ...server,
      game: null,
    };
    return { client: clientNew };
  }

  const mergedGame = GameClient.mergeWithServer({
    ctx: { ...ctx, hostId: server.hostId },
    server: server.game,
    client: client?.game,
  });

  const clientNew: Space<Game.ClientModel> = {
    ...client,
    ...server,
    game: mergedGame.model,
  };

  return {
    client: clientNew,
    evt: mergedGame.evt,
    cmd: ClientCmd.tag("game", mergedGame.cmd),
    eff: Eff.t("game", mergedGame.eff),
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

export const subscriptions = (
  ctx: ClientCtx,
  model: ClientModel
): Sub<ClientMsg> => {
  const space = toSpaceByUserId(model, ctx.currentUserId);

  if (!space) {
    return Sub.None;
  }

  if (!space.game) {
    return Sub.None;
  }

  return Sub.tag(
    "game",
    GameClient.subscriptions({
      ctx: { ...ctx, hostId: space.hostId },
      model: space.game,
      intervalId: space.spaceId,
    })
  );
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
  dispatch,
  model,
  spaceId,
}: {
  model: ClientModel;
  ctx: ViewCtx;
  dispatch: (m: ClientMsg) => void;
  spaceId: SpaceId;
}) => {
  const isLoading =
    model.requests.list?.t === "loading" ||
    model.requests.create?.t === "loading";

  if (isLoading) {
    return <LoadingScreen />;
  }

  const space = model.spaces[spaceId];

  if (!space) {
    return <ViewSpaceNotFound ctx={ctx} />;
  }

  const spaceCtx: SpaceViewCtx = {
    ...ctx,
    hostId: space.hostId,
    spaceId: space.spaceId,
    viewProfile: (userId) => dispatch({ t: "clicked-user", userId: userId }),
    quit: () =>
      dispatch({
        t: "input-game",
        spaceId: space.spaceId,
        userId: ctx.currentUserId,
        gameName: undefined,
      }),
    space,
  };

  return (
    <>
      <ViewSpaceScreenMain
        dispatch={dispatch}
        model={model}
        space={space}
        ctx={spaceCtx}
      />

      <Drawer
        id="users"
        open={model.modal === "users"}
        onClose={() => dispatch({ t: "modal-closed" })}>
        {spaceCtx && <ViewUsersInSpaceList space={space} ctx={spaceCtx} />}
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
                dispatch({
                  t: "clicked-user-link",
                  userId: model.previewUserId,
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
              {spaceCtx.hostId === model.previewUserId && <ViewSpaceHostChip />}
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
                    t: "clicked-user-link",
                    userId: model.previewUserId,
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
  dispatch,
  model,
  space,
}: {
  model: ClientModel;
  ctx: SpaceViewCtx;
  dispatch: (m: ClientMsg) => void;
  space: Space<Game.ClientModel>;
}) => {
  const currentUserSpace = toSpaceByUserId(model, ctx.currentUserId);

  if (currentUserSpace?.spaceId !== space.spaceId) {
    return <ViewSpaceJoinScreen ctx={ctx} dispatch={dispatch} model={model} />;
  }
  const peopleCount = Object.keys(space.users).length;

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

        <Button
          color="danger"
          variant="contained"
          size="sm"
          text={space.hostId === ctx.currentUserId ? "End" : "Leave"}
          onClick={() => {
            if (space.hostId === ctx.currentUserId) {
              dispatch({
                t: "destroy",
                userId: ctx.currentUserId,
                spaceId: space.spaceId,
              });
              return;
            }
            dispatch({
              t: "leave",
              spaceId: space.spaceId,
              userId: ctx.currentUserId,
            });
          }}
        />
      </nav>

      <div className="w-full flex-1 overflow-hidden">
        {space.game ? (
          <GameClient.View
            ctx={ctx}
            dispatch={(msg) => dispatch({ t: "game", c: msg })}
            model={space.game}
          />
        ) : (
          <ViewNotInGameScreen space={space} ctx={ctx} dispatch={dispatch} />
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

export const ViewCurrentSpaceBar = ({
  ctx,
  model,
  dispatch,
}: {
  ctx: ViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const space = toSpaceByUserId(model, ctx.currentUserId);

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
          ctx.push({
            t: "space",
            c: { t: "space", spaceId: space.spaceId },
          });
        }}>
        <div className="mr-2 p-2">
          {!space.game && (
            <MyAvatar
              src={hostProfile?.avatarUrl}
              alt="Host Avatar"
              className="h-12 w-12"
            />
          )}
          {space.game && (
            <div className="h-12 w-12 overflow-hidden rounded border border-neutral-600">
              <ViewCoverArt gameName={space.game.t} />
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

      <button
        aria-label="destroy or leave space"
        onClick={() => {
          if (ctx.currentUserId === space.hostId) {
            dispatch({
              t: "destroy",
              userId: ctx.currentUserId,
              spaceId: space.spaceId,
            });
            return;
          }
          dispatch({
            t: "leave",
            spaceId: space.spaceId,
            userId: ctx.currentUserId,
          });
        }}
        className="mr-4">
        <IconXMark className="h-8 w-8" />
      </button>
    </div>
  );
};
