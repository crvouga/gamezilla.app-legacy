import {
  Eff,
  Loading,
  Ok,
  RemoteResult,
  Sub,
  andThen,
  p,
  dissoc,
} from "gamezilla/@SHARED/core";
import {
  ClientAppMsg,
  ClientCtx,
  RouteGameSpace,
  ViewCtx,
} from "gamezilla/app/@SHARED/client";
import { SpaceId } from "gamezilla/app/@SHARED/data";
import {
  ActionButton,
  Button,
  Drawer,
  IconHome,
  IconUserGroup,
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
  ToClient,
  ToServer,
  findSpaceByUserId,
} from "./space.core";

//
//
//
// ClientModel
//
//
//

export const init: { model: ClientModel } = {
  model: {
    spaces: {},
    req: {},
    modal: null,
    previewUserId: null,
  },
};

//
//
//
// Update
//
//
//

export const update = (input: {
  ctx: ClientCtx;
  sendToServer: (msg: ToServer) => Eff;
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  msgs?: ClientAppMsg[];
} => {
  return p(
    input,
    andThen((model) => updateMain({ ...input, model })),
    andThen((model) => watchCreate({ ...input, model }))
  );
};

const watchCreate: typeof update = ({ msg, model }) => {
  switch (msg.t) {
    case "create": {
      return {
        model,
        msgs: [
          {
            t: "push-route",
            route: {
              t: "space",
              c: { t: "space", spaceId: msg.spaceId },
            },
          },
        ],
      };
    }
    default: {
      return { model };
    }
  }
};

const updateMain: typeof update = ({ ctx, sendToServer, msg, model }) => {
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
        msgs: [
          {
            t: "push-route",
            route: {
              t: "profile",
              c: { t: "profile", userId: msg.userId },
            },
          },
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
      const space = findSpaceByUserId(model, ctx.currentUserId);

      if (!space) {
        return { model };
      }

      if (!space.game) {
        return { model };
      }

      const updated = GameClient.update({
        ctx: { ...ctx, hostId: space.hostId },
        sendToServer: (c) =>
          sendToServer({
            t: "game",
            c,
            profile: ctx.profiles[ctx.currentUserId],
          }),
        msg: msg.c,
        model: space.game,
      });

      const spaceNew: Space<GameClient.Model> = {
        ...space,
        game: updated.model,
      };

      const modelNew = {
        ...model,
        spaces: {
          ...model.spaces,
          [space.spaceId]: spaceNew,
        },
      };

      return {
        model: modelNew,
        eff: Eff.t("game", updated.eff),
        msgs: updated.msgs,
      };
    }

    default: {
      return {
        model: {
          ...model,
          req: { ...model.req, [msg.t]: RemoteResult.Loading },
        },

        eff: sendToServer({ ...msg, profile: ctx.profiles[ctx.currentUserId] }),
      };
    }
  }
};

export const updateFromServer = ({
  ctx,
  sendToServer,
  msg,
  model,
}: {
  ctx: ClientCtx;
  sendToServer: (msg: ToServer) => Eff;
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  msgs?: ClientAppMsg[];
} => {
  switch (msg.t) {
    case "game": {
      const space = findSpaceByUserId(model, ctx.currentUserId);

      if (!space) {
        return { model };
      }

      if (!space.game) {
        return { model };
      }

      const updated = GameClient.updateFromServer({
        ctx: { ...ctx, hostId: space.hostId },
        sendToServer: (msg) => sendToServer({ t: "game", c: msg }),
        model: space.game,
        msg: msg.c,
      });

      const spaceNew: Space<GameClient.Model> = {
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
        msgs: updated.msgs,
      };
    }

    case "list": {
      if (msg.result.t === "err") {
        return {
          model: { ...model, req: { ...model.req, list: msg.result } },
          msgs: [{ t: "enqueue-toast", text: msg.result.error }],
        };
      }

      const merged = syncWithServer({
        ctx,
        client: model,
        server: msg.result.value,
        sendToServer,
      });

      return {
        model: { ...merged.model, req: { ...model.req, list: Ok(null) } },
        eff: merged.eff,
        msgs: msg.profiles
          ? [{ t: "got-profiles", profiles: msg.profiles }]
          : [],
      };
    }

    case "destroy": {
      if (msg.result.t === "err") {
        return {
          model: { ...model, req: { ...model.req, [msg.t]: msg.result } },
          msgs: [{ t: "enqueue-toast", text: msg.result.error }],
        };
      }

      return {
        model: {
          ...model,
          spaces: dissoc(model.spaces, msg.result.value.spaceId),
          req: { ...model.req, [msg.t]: Ok(null) },
        },
        msgs: msg.profiles
          ? [{ t: "got-profiles", profiles: msg.profiles }]
          : [],
      };
    }

    default: {
      if (msg.result.t === "err") {
        return {
          model: { ...model, req: { ...model.req, [msg.t]: msg.result } },
          msgs: [{ t: "enqueue-toast", text: msg.result.error }],
        };
      }

      const merged = syncWithServer({
        ctx,
        client: model,
        server: [msg.result.value],
        sendToServer,
      });

      return {
        model: {
          ...merged.model,
          req: { ...model.req, [msg.t]: Ok(null) },
        },
        eff: merged.eff,
        msgs: msg.profiles
          ? [{ t: "got-profiles", profiles: msg.profiles }]
          : [],
      };
    }
  }
};

export const updateFromEvent = (input: {
  msg: ClientAppMsg;
  model: ClientModel;
  sendToServer: (m: ToServer) => Eff;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
  const { msg } = input;

  switch (msg.t) {
    case "client-authenticated": {
      return listSpaces(input);
    }

    case "route-changed": {
      if (msg.route.t === "space") {
        return listSpaces(input);
      }

      return input;
    }

    default: {
      return input;
    }
  }
};

const listSpaces = (input: {
  model: ClientModel;
  sendToServer: (m: ToServer) => Eff;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
  const { model, sendToServer } = input;

  return {
    model: { ...model, req: { ...model.req, list: Loading } },
    eff: sendToServer({ t: "list" }),
  };
};

const syncWithServer = ({
  ctx,
  client,
  server,
  sendToServer,
}: {
  ctx: ClientCtx;
  sendToServer: (msg: ToServer) => Eff;
  client: ClientModel;
  server: Space<Game.ServerModel>[];
}): {
  model: ClientModel;
  eff: Eff<ClientMsg>;
} => {
  const clientSpaces: { [id: SpaceId]: Space<Game.ClientModel> } = {};
  const effs: Eff<ClientMsg>[] = [];

  for (const serverSpace of server) {
    if (!serverSpace.game) {
      const clientSpaceNew: Space<Game.ClientModel> = {
        ...serverSpace,
        game: null,
      };
      clientSpaces[clientSpaceNew.spaceId] = clientSpaceNew;
      continue;
    }

    const clientSpace = client.spaces[serverSpace.spaceId];

    const merged = GameClient.syncWithServer({
      ctx: { ...ctx, hostId: serverSpace.hostId },
      sendToServer: (msg) => sendToServer({ t: "game", c: msg }),
      server: serverSpace.game,
      client: clientSpace?.game,
    });

    const clientSpaceNew: Space<Game.ClientModel> = {
      ...serverSpace,
      game: merged.model,
    };
    clientSpaces[clientSpaceNew.spaceId] = clientSpaceNew;
    effs.push(Eff.t("game", merged.eff));
    continue;
  }

  return {
    model: {
      ...client,
      spaces: clientSpaces,
    },
    eff: Eff.batch(effs),
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
  const space = findSpaceByUserId(model, ctx.currentUserId);

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
}) => {
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
  if (
    model.req.list?.t === "loading" ||
    model.req.create?.t === "loading" ||
    model.req.join?.t === "loading"
  ) {
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
    onViewProfile: (input) =>
      dispatch({ t: "clicked-user", userId: input.userId }),
    onQuit: () => dispatch({ t: "input-game", gameName: undefined }),
  };

  return (
    <>
      <ViewPage ctx={spaceCtx} dispatch={dispatch} model={model} />

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

const ViewPage = ({
  ctx,
  dispatch,
  model,
}: {
  model: ClientModel;
  ctx: SpaceViewCtx;
  dispatch: (m: ClientMsg) => void;
}) => {
  const space = findSpaceByUserId(model, ctx.currentUserId);

  if (!space) {
    return <ViewSpaceJoinScreen model={model} dispatch={dispatch} ctx={ctx} />;
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <ViewTopBar space={space} dispatch={dispatch} ctx={ctx} />
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

const ViewTopBar = ({
  ctx,
  space,
  dispatch,
}: {
  space: Space<Game.ClientModel>;
  ctx: SpaceViewCtx;
  dispatch: (m: ClientMsg) => void;
}) => {
  return (
    <nav className="flex h-14 w-full items-center border-b border-neutral-700 px-2 py-1">
      <div className="grid w-20 place-items-center">
        <ActionButton
          label="Home"
          icon={<IconHome className="h-6 w-6" />}
          onClick={() => ctx.push({ t: "space", c: { t: "space-list" } })}
        />
      </div>

      <div className="grid w-20 place-items-center">
        {/* label={peopleCount > 1 ? `People (${peopleCount})` : `People`} */}
        <ActionButton
          label="People"
          icon={<IconUserGroup className="h-6 w-6" />}
          onClick={() => dispatch({ t: "modal-open", c: "users" })}
        />
      </div>

      <div className="flex-1"></div>

      <Button
        color="danger"
        variant="contained"
        size="sm"
        text={space.hostId === ctx.currentUserId ? "End" : "Leave"}
        onClick={() => {
          if (space.hostId === ctx.currentUserId) {
            dispatch({ t: "destroy", userId: ctx.currentUserId });
            return;
          }
          dispatch({ t: "leave", userId: ctx.currentUserId });
        }}
      />
    </nav>
  );
};

export const ViewSpaceNotFound = ({ ctx }: { ctx: ViewCtx }) => {
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
  const space = findSpaceByUserId(model, ctx.currentUserId);

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
            dispatch({ t: "destroy", userId: ctx.currentUserId });
            return;
          }
          dispatch({ t: "leave", userId: ctx.currentUserId });
        }}
        className="mr-4">
        <IconXMark className="h-8 w-8" />
      </button>
    </div>
  );
};
