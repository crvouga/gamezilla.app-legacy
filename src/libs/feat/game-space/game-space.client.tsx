import {
  Cmd,
  Loading,
  Ok,
  RemoteResult,
  Sub,
  andThen,
  p,
} from "@gamezilla/core";
import { GameSpaceId } from "@gamezilla/shared/app";
import {
  ClientAppMsg,
  ClientCtx,
  RouteGameSpace,
  ViewCtx,
} from "@gamezilla/shared/client";
import {
  GameSpaceClientCtx,
  GameSpaceViewCtx,
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "@gamezilla/shared/game-space";
import {
  ActionButton,
  Button,
  IconHome,
  IconUserGroup,
  IconXMark,
  LoadingScreen,
  MyAvatar,
  Drawer,
  VDom,
} from "@gamezilla/ui";
import {
  ClientModel,
  ClientMsg,
  Res,
  ServerModel,
  ToClient,
  ToServer,
  toSpace,
} from "./game-space.core";
import * as GameClient from "./game.client";
import { ViewCoverArt } from "./game.core";
import {
  ViewNotInGameScreen,
  ViewSpaceJoinScreen,
  ViewSpaceListScreen,
} from "./views";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: { model: Model } = {
  model: {
    games: {},
    spaces: {},
    users: {},
    profiles: {},
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

export type Msg = ClientMsg;

export const update = (input: {
  ctx: ClientCtx | null;
  sendToServer: (msg: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  return p(
    input,
    andThen((model) => update_({ ...input, model })),
    andThen((model) => watchCreate({ ...input, model }))
  );
};

const watchCreate: typeof update = ({ msg, model }) => {
  if (msg.t === "create") {
    return {
      model,
      msgs: [
        {
          t: "push-route",
          route: {
            t: "game-space",
            c: { t: "game-space", spaceId: msg.spaceId },
          },
        },
      ],
    };
  }
  return { model };
};

const update_: typeof update = ({ ctx, sendToServer, msg, model }) => {
  if (msg.t === "modal-closed") {
    return { model: { ...model, modal: null } };
  }

  if (msg.t === "modal-open") {
    return { model: { ...model, modal: msg.c } };
  }

  if (msg.t === "clicked-user-link") {
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

  if (msg.t === "clicked-user") {
    return {
      model: {
        ...model,
        previewUserId: msg.userId,
        modal: "user-preview",
      },
    };
  }

  if (msg.t === "game") {
    if (!ctx) {
      return { model };
    }

    const user = model.users[ctx.currentUserId];

    if (!user) {
      return { model };
    }

    const space = model.spaces[user.spaceId];

    if (!space) {
      return { model };
    }

    const game = model.games[user.spaceId];

    if (!game) {
      return { model };
    }

    const gameMsg = msg.c;

    const spaceCtx: GameSpaceClientCtx = {
      ...ctx,
      hostId: space.hostId,
    };

    const updated = GameClient.update({
      ctx: spaceCtx,
      sendToServer: (msg) =>
        sendToServer({
          t: "game",
          c: msg,
          profile: ctx.profiles[ctx.currentUserId],
        }),
      msg: gameMsg,
      model: game,
    });

    const modelNew: Model = {
      ...model,
      games: {
        ...model.games,
        [user.spaceId]: updated.model,
      },
    };

    return {
      model: modelNew,
      cmd: Cmd.t("game", updated.cmd),
      msgs: updated.msgs,
    };
  }

  return {
    model: {
      ...model,
      req: {
        ...model.req,
        [msg.t]: RemoteResult.Loading,
      },
    },
    cmd: sendToServer({
      ...msg,
      profile: ctx ? ctx.profiles[ctx.currentUserId] : undefined,
    }),
  };
};

export const updateFromServer = ({
  ctx,
  sendToServer,
  msg,
  model,
}: {
  ctx: ClientCtx | null;
  sendToServer: (msg: ToServer) => Cmd;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  switch (msg.t) {
    case "game": {
      if (!ctx) {
        return { model };
      }
      const user = model.users[ctx.currentUserId];

      if (!user) {
        return { model };
      }

      const space = model.spaces[user.spaceId];

      if (!space) {
        return { model };
      }

      const game = model.games[user.spaceId];

      if (!game) {
        return { model };
      }

      const updated = GameClient.updateFromServer({
        ctx: {
          ...ctx,
          hostId: space.hostId,
        },
        sendToServer: (msg) =>
          sendToServer({
            t: "game",
            c: msg,
            profile: ctx.profiles[ctx.currentUserId],
          }),
        model: game,
        msg: msg.c,
      });

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [user.spaceId]: updated.model,
        },
      };

      return {
        model: modelNew,
        cmd: Cmd.t("game", updated.cmd),
        msgs: updated.msgs,
      };
    }
    default: {
      if (msg.result.t === "err") {
        return {
          model: {
            ...model,
            req: {
              ...model.req,
              [msg.t]: msg.result,
            },
          },
        };
      }

      const merged = syncWithServer({
        ctx,
        clientModel: model,
        serverModel: msg.result.value,
        sendToServer,
      });

      return {
        model: {
          ...merged.model,
          req: {
            ...merged.model.req,
            [msg.t]: Ok(null),
          },
        },
        cmd: merged.cmd,
        msgs: [
          ...(ctx ? resToToast({ model: merged.model, ctx, res: msg }) : []),
          { t: "got-profiles", profiles: merged.model.profiles },
        ],
      };
    }
  }
};

const resToToast = ({
  ctx,
  res,
  model,
}: {
  model: Model;
  ctx: ClientCtx;
  res: Res;
}): ClientAppMsg[] => {
  const user = model.users[ctx.currentUserId];

  if (!user) {
    return [];
  }

  if (
    res.t === "join" &&
    res.result.t === "ok" &&
    res.userId !== ctx.currentUserId
  ) {
    const username = ctx.profiles[res.userId]?.username ?? "...";
    return [{ t: "toast-enqueued", text: `${username} joined space` }];
  }

  if (
    res.t === "leave" &&
    res.result.t === "ok" &&
    res.userId !== ctx.currentUserId
  ) {
    const username = ctx.profiles[res.userId]?.username ?? "...";
    return [{ t: "toast-enqueued", text: `${username} left space` }];
  }

  return [];
};

export const updateFromApp = (input: {
  msg: ClientAppMsg;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const { msg } = input;

  if (msg.t === "current-user-authenticated") {
    return loadGameSpaces(input);
  }

  if (msg.t === "wire-connected") {
    return loadGameSpaces(input);
  }

  return input;
};

const loadGameSpaces = (input: {
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const { model, sendToServer } = input;
  return {
    // model,
    model: {
      ...model,
      req: {
        ...model.req,
        list: Loading,
      },
    },
    cmd: sendToServer({ t: "list" }),
  };
};

const syncWithServer = ({
  ctx,
  clientModel,
  serverModel,
  sendToServer,
}: {
  ctx: ClientCtx | null;
  sendToServer: (msg: ToServer) => Cmd;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): {
  model: ClientModel;
  cmd: Cmd<ClientMsg>;
} => {
  const gamesNew = Object.entries(serverModel.games).reduce<
    [ClientModel["games"], Cmd<ClientMsg>]
  >(
    (gamesNew, [spaceId, serverGame]) => {
      if (!GameSpaceId.is(spaceId)) {
        return gamesNew;
      }

      if (!ctx) {
        console.log("skip no ctx");
        return gamesNew;
      }

      const space = serverModel.spaces[spaceId];

      if (!space) {
        return gamesNew;
      }

      const gameSpaceCtx: GameSpaceClientCtx = {
        ...ctx,
        hostId: space.hostId,
      };

      const clientGame = clientModel.games[spaceId];

      if (clientGame) {
        const merged = GameClient.syncWithServer({
          ctx: gameSpaceCtx,
          server: serverGame,
          client: clientGame,
          sendToServer: (msg) => sendToServer({ t: "game", c: msg }),
        });

        return [
          {
            ...gamesNew[0],
            [spaceId]: merged.model,
          },
          Cmd.batch([
            gamesNew[1],
            p(
              merged.cmd ?? Cmd.None,
              Cmd.map((m): Msg => ({ t: "game", c: m }))
            ),
          ]),
        ];
      }

      const gameName = serverGame.t;

      const initial = GameClient.init({ gameName })({
        ctx: gameSpaceCtx,
        sendToServer: (msg) => sendToServer({ t: "game", c: msg }),
      });

      const merged = GameClient.syncWithServer({
        ctx: gameSpaceCtx,
        server: serverGame,
        client: initial.model,
        sendToServer: (msg) => sendToServer({ t: "game", c: msg }),
      });

      return [
        {
          ...gamesNew[0],
          [spaceId]: merged.model,
        },
        Cmd.batch([
          gamesNew[1],
          p(
            initial.cmd ?? Cmd.None,
            Cmd.map((msg) => ({ t: "game", c: msg }))
          ),
          p(
            merged.cmd ?? Cmd.None,
            Cmd.map((msg) => ({ t: "game", c: msg }))
          ),
        ]),
      ];
    },
    [{}, Cmd.None]
  );

  return {
    model: {
      ...clientModel,
      games: gamesNew[0],
      spaces: serverModel.spaces,
      users: serverModel.users,
      profiles: {
        ...clientModel.profiles,
        ...serverModel.profiles,
      },
    },
    cmd: gamesNew[1],
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

export const subscriptions = (ctx: ClientCtx, model: Model): Sub<Msg> => {
  const user = model.users[ctx.currentUserId];

  if (!user) {
    return Sub.None;
  }

  const game = model.games[user.spaceId];

  if (!game) {
    return Sub.None;
  }

  const space = model.spaces[user.spaceId];

  if (!space) {
    return Sub.None;
  }

  const gameSpaceCtx: GameSpaceClientCtx = {
    ...ctx,
    hostId: space.hostId,
  };

  return Sub.tag(
    "game",
    GameClient.subscriptions({
      ctx: gameSpaceCtx,
      model: game,
      intervalId: `space/${user.spaceId}`,
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
  ctx: ctxPrev,
  dispatch,
  model,
  route,
  viewBottomBar,
}: {
  model: Model;
  ctx: ViewCtx;
  dispatch: (m: Msg) => void;
  route: RouteGameSpace;
  viewBottomBar: VDom;
}) => {
  const ctx: ViewCtx = {
    ...ctxPrev,
    profiles: {
      ...ctxPrev.profiles,
      ...model.profiles,
    },
  };

  if (route.t === "game-space") {
    return (
      <ViewSpaceScreen
        spaceId={route.spaceId}
        ctx={ctx}
        dispatch={dispatch}
        model={model}
      />
    );
  }

  return (
    <>
      <ViewSpaceListScreen dispatch={dispatch} ctx={ctx} model={model} />
      {viewBottomBar}
    </>
  );
};

const ViewSpaceScreen = ({
  ctx,
  dispatch,
  model,
  spaceId,
}: {
  model: Model;
  ctx: ViewCtx;
  dispatch: (m: Msg) => void;
  spaceId: GameSpaceId;
}) => {
  if (
    model.req.list?.t === "loading" ||
    model.req.create?.t === "loading" ||
    model.req.join?.t === "loading"
  ) {
    return <LoadingScreen />;
  }

  const space = toSpace({ spaceId, model });

  if (!space) {
    return <ViewSpaceNotFound ctx={ctx} />;
  }

  const spaceCtx: GameSpaceViewCtx = {
    ...ctx,
    hostId: space.hostId,
    space,
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
        {spaceCtx && <ViewUsersInSpaceList ctx={spaceCtx} />}
      </Drawer>

      <Drawer
        id="user-preview"
        open={model.modal === "user-preview"}
        onClose={() => dispatch({ t: "modal-closed" })}>
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
                : "..."
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
            {spaceCtx.currentUserId === model.previewUserId && <ViewYouChip />}
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
      </Drawer>
    </>
  );
};

const ViewPage = ({
  ctx,
  dispatch,
  model,
}: {
  model: Model;
  ctx: GameSpaceViewCtx;
  dispatch: (m: Msg) => void;
}) => {
  const currentUser = model.users[ctx.currentUserId];

  if (!currentUser) {
    return <ViewSpaceJoinScreen model={model} dispatch={dispatch} ctx={ctx} />;
  }

  if (currentUser.spaceId !== ctx.space.gameSpaceId) {
    return <ViewSpaceJoinScreen dispatch={dispatch} ctx={ctx} model={model} />;
  }

  const game = model.games[ctx.space.gameSpaceId];

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <ViewTopBar dispatch={dispatch} ctx={ctx} />
      <div className="w-full flex-1 overflow-y-auto">
        {game ? (
          <GameClient.View
            ctx={ctx}
            dispatch={(msg) => dispatch({ t: "game", c: msg })}
            model={game}
          />
        ) : (
          <ViewNotInGameScreen ctx={ctx} dispatch={dispatch} />
        )}
      </div>
    </div>
  );
};

const ViewTopBar = ({
  ctx,
  dispatch,
}: {
  ctx: GameSpaceViewCtx;
  dispatch: (m: Msg) => void;
}) => {
  const peopleCount = Object.values(ctx.space.users).length;
  return (
    <nav className="flex h-14 w-full items-center border-b border-neutral-700 px-2 py-1">
      <div className="grid w-20 place-items-center">
        <ActionButton
          label="Home"
          icon={<IconHome className="h-6 w-6" />}
          onClick={() =>
            ctx.onPush({ t: "game-space", c: { t: "game-space-list" } })
          }
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

      <Button
        color="danger"
        variant="contained"
        size="sm"
        text={ctx.space.hostId === ctx.currentUserId ? "End" : "Leave"}
        onClick={() => {
          if (ctx.space.hostId === ctx.currentUserId) {
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
        onClick={() =>
          ctx.onPush({ t: "game-space", c: { t: "game-space-list" } })
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
  ctx: ctxPrev,
  model,
  dispatch,
}: {
  ctx: ViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const ctx: ViewCtx = {
    ...ctxPrev,
    profiles: {
      ...ctxPrev.profiles,
      ...model.profiles,
    },
  };
  const user = model.users[ctx.currentUserId];

  if (!user) {
    return null;
  }

  const space = model.spaces[user.spaceId];

  if (!space) {
    return null;
  }

  const game = model.games[space.gameSpaceId];
  const hostProfile = ctx.profiles[space.hostId];
  const userCount = Object.values(model.users).filter(
    (user) => user.spaceId === space.gameSpaceId
  ).length;

  return (
    <div className="flex w-full items-center overflow-hidden border-t-2 border-blue-600 text-inherit">
      <button
        className="flex flex-1 items-center overflow-hidden"
        onClick={() => {
          ctx.onPush({
            t: "game-space",
            c: { t: "game-space", spaceId: space.gameSpaceId },
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
