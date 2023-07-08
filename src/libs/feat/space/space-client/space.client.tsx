import { SpaceId } from "@gamezilla/shared/app";
import {
  AppMsg,
  Ctx,
  Route,
  RouteSpace,
  SpaceCtx,
  SpaceViewCtx,
  ViewCtx,
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "@gamezilla/shared/client";
import { Cmd, RemoteResult, Sub, p } from "@gamezilla/shared/core";
import {
  ActionButton,
  IconHome,
  IconUserGroup,
  LoadingScreen,
  MyAvatar,
  MyButton,
  MyDrawer,
  VDom,
} from "@gamezilla/shared/ui";
import * as Game from "../game.client";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
  toSpace,
} from "../space.shared";
import { ViewNotInGameScreen } from "./view-not-in-game-screen";
import { ViewSpaceJoinScreen } from "./view-space-join-screen";
import { ViewSpaceListScreen } from "./view-space-list-screen";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = (): { model: Model } => {
  return {
    model: {
      games: {},
      spaces: {},
      users: {},
      profiles: {},
      requests: {},
      modal: "none",
      previewUserId: null,
    },
  };
};

//
//
//
// Msg
//
//
//

export type Msg = ClientMsg;

//
//
//
// Update
//
//
//

export const update = ({
  ctx,
  sendToServer,
  msg,
  model,
}: {
  ctx: Ctx | null;
  sendToServer: (msg: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: AppMsg[];
} => {
  if (msg.t === "modal-closed") {
    return { model: { ...model, modal: "none" } };
  }

  if (msg.t === "modal-open") {
    return { model: { ...model, modal: msg.c } };
  }

  if (msg.t === "clicked-user-link") {
    return {
      model: { ...model, modal: "none" },
      cmd: Route.push({
        t: "profile",
        c: { t: "profile", userId: msg.userId },
      }),
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

    const spaceCtx: SpaceCtx = {
      ...ctx,
      hostId: space.hostId,
    };

    const updated = Game.update({
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
      cmd: Cmd.tag_("game", updated.cmd),
      msgs: AppMsg.tag("game", updated.msgs),
    };
  }

  return {
    model: {
      ...model,
      requests: {
        ...model.requests,
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
  ctx: Ctx | null;
  sendToServer: (msg: ToServer) => Cmd;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: AppMsg[];
} => {
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

    const updated = Game.updateFromServer({
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
      cmd: Cmd.tag_("game", updated.cmd),
      msgs: updated.msgs,
    };
  }

  if (msg.result.t === "err") {
    return {
      model: {
        ...model,
        requests: {
          ...model.requests,
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
      requests: {
        ...merged.model.requests,
        [msg.t]: RemoteResult.Ok(null),
      },
    },
    cmd: merged.cmd,
    msgs: [{ t: "got-profiles", profiles: merged.model.profiles }],
  };
};

export const updateFromApp = ({
  msg,
  model,
  sendToServer,
}: {
  msg: AppMsg;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "route-changed") {
    if (msg.route.t === "space" && msg.route.c.t === "space-list") {
      return updateListSpaces({
        model,
        initiatorMsg: msg,
        sendToServer,
      });
    }
    return { model };
  }

  if (msg.t === "wire-connected") {
    return updateListSpaces({ model, initiatorMsg: msg, sendToServer });
  }

  return { model };
};

const updateListSpaces = ({
  model,
  initiatorMsg,
  sendToServer,
}: {
  model: Model;
  initiatorMsg: unknown;
  sendToServer: (m: ToServer) => Cmd;
}) => {
  return {
    model: {
      ...model,
      requests: { ...model.requests, list: RemoteResult.Loading },
    },
    cmd: sendToServer({
      t: "list",
      initiatorMsg,
    }),
  };
};

const syncWithServer = ({
  ctx,
  clientModel,
  serverModel,
  sendToServer,
}: {
  ctx: Ctx | null;
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
    (gamesNew, [spaceId, backendGame]) => {
      if (!SpaceId.is(spaceId)) {
        return gamesNew;
      }

      if (!ctx) {
        return gamesNew;
      }

      const frontendGame = clientModel.games[spaceId];

      if (frontendGame) {
        const merged = Game.syncWithServer({
          ctx,
          serverModel: backendGame,
          clientModel: frontendGame,
          sendToServer: (msg) => sendToServer({ t: "game", c: msg }),
        });

        return [
          {
            ...gamesNew[0],
            [spaceId]: merged[0],
          },
          Cmd.batch([
            gamesNew[1],
            p(
              merged[1],
              Cmd.map((m): Msg => ({ t: "game", c: m }))
            ),
          ]),
        ];
      }

      const initial = Game.init({
        gameName: backendGame.t,
        ctx,
      });

      const merged = Game.syncWithServer({
        ctx,
        serverModel: backendGame,
        clientModel: initial[0],
        sendToServer: (msg) => sendToServer({ t: "game", c: msg }),
      });

      return [
        {
          ...gamesNew[0],
          [spaceId]: merged[0],
        },
        Cmd.batch([
          gamesNew[1],
          p(
            initial[1],
            Cmd.map((msg) => ({ t: "game", c: msg }))
          ),
          p(
            merged[1],
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

export const subscriptions = (ctx: Ctx, model: Model): Sub<Msg> => {
  const user = model.users[ctx.currentUserId];

  if (!user) {
    return Sub.None;
  }

  const game = model.games[user.spaceId];

  if (!game) {
    return Sub.None;
  }

  return p(
    Game.subscriptions(`space/${user.spaceId}`, ctx, game),
    Sub.map((msg) => ({ t: "game", c: msg }))
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
  $send,
  model,
  route,
  viewBottomBar,
}: {
  model: Model;
  ctx: ViewCtx;
  $send: (m: Msg) => void;
  route: RouteSpace;
  viewBottomBar: VDom;
}) => {
  const ctx: ViewCtx = {
    ...ctxPrev,
    profiles: {
      ...ctxPrev.profiles,
      ...model.profiles,
    },
  };

  if (route.t === "space") {
    return (
      <ViewSpaceScreen
        spaceId={route.spaceId}
        ctx={ctx}
        $send={$send}
        model={model}
      />
    );
  }

  return (
    <>
      <ViewSpaceListScreen $send={$send} ctx={ctx} model={model} />
      {viewBottomBar}
    </>
  );
};

const ViewSpaceScreen = ({
  ctx,
  $send,
  model,
  spaceId,
}: {
  model: Model;
  ctx: ViewCtx;
  $send: (m: Msg) => void;
  spaceId: SpaceId;
}) => {
  if (
    model.requests.list?.t === "loading" ||
    model.requests.create?.t === "loading" ||
    model.requests.join?.t === "loading"
  ) {
    return <LoadingScreen />;
  }

  const space = toSpace({ spaceId, model });

  if (!space) {
    return <ViewSpaceNotFound ctx={ctx} />;
  }

  const spaceCtx: SpaceViewCtx = {
    ...ctx,
    hostId: space.hostId,
    space,
    onViewProfile: (input) =>
      $send({ t: "clicked-user", userId: input.userId }),
    onQuit: () => $send({ t: "input-game", gameName: undefined }),
  };

  return (
    <>
      <ViewPage ctx={spaceCtx} $send={$send} model={model} />

      <MyDrawer
        open={model.modal === "users"}
        onClose={() => $send({ t: "modal-closed" })}>
        {spaceCtx && <ViewUsersInSpaceList ctx={spaceCtx} />}
      </MyDrawer>

      <MyDrawer
        open={model.modal === "user-preview"}
        onClose={() => $send({ t: "modal-closed" })}>
        <button
          className="flex w-full flex-col items-center justify-center gap-2 p-4"
          onClick={() => {
            if (model.previewUserId) {
              $send({
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
          <MyButton
            onClick={() => {
              if (model.previewUserId) {
                $send({
                  t: "clicked-user-link",
                  userId: model.previewUserId,
                });
              }
            }}
            className="w-full">
            See profile
          </MyButton>
        </div>
      </MyDrawer>
    </>
  );
};

const ViewPage = ({
  ctx,
  $send,
  model,
}: {
  model: Model;
  ctx: SpaceViewCtx;
  $send: (m: Msg) => void;
}) => {
  const currentUser = model.users[ctx.currentUserId];

  if (!currentUser) {
    return <ViewSpaceJoinScreen model={model} $send={$send} ctx={ctx} />;
  }

  if (currentUser.spaceId !== ctx.space.spaceId) {
    return <ViewSpaceJoinScreen $send={$send} ctx={ctx} model={model} />;
  }

  const game = model.games[ctx.space.spaceId];
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <ViewTopBar $send={$send} ctx={ctx} />
      <div className="w-full flex-1 overflow-y-auto">
        {game ? (
          <Game.View
            ctx={ctx}
            $send={(msg) => $send({ t: "game", c: msg })}
            model={game}
          />
        ) : (
          <ViewNotInGameScreen ctx={ctx} $send={$send} />
        )}
      </div>
    </div>
  );
};

const ViewTopBar = ({
  ctx,
  $send,
}: {
  ctx: SpaceViewCtx;
  $send: (m: Msg) => void;
}) => {
  const peopleCount = Object.values(ctx.space.users).length;
  return (
    <nav className="flex h-14 w-full items-center border-b border-neutral-700 px-2 py-1">
      <div className="flex w-20 items-center">
        <ActionButton
          label="Home"
          icon={<IconHome />}
          onClick={() => ctx.$push({ t: "space", c: { t: "space-list" } })}
        />
      </div>

      <div className="flex w-20 items-center">
        <ActionButton
          label={peopleCount > 1 ? `People (${peopleCount})` : `People`}
          icon={<IconUserGroup />}
          onClick={() => $send({ t: "modal-open", c: "users" })}
        />
      </div>

      <div className="flex-1"></div>

      <MyButton
        color="danger"
        variant="contained"
        size="sm"
        onClick={() => {
          if (ctx.space.hostId === ctx.currentUserId) {
            $send({ t: "destroy", userId: ctx.currentUserId });
            return;
          }
          $send({ t: "leave", userId: ctx.currentUserId });
        }}>
        {ctx.space.hostId === ctx.currentUserId ? "End" : "Leave"}
      </MyButton>
    </nav>
  );
};

export const ViewSpaceNotFound = ({ ctx }: { ctx: ViewCtx }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">Space not found</p>
      <MyButton
        onClick={() => ctx.$push({ t: "space", c: { t: "space-list" } })}
        size="lg"
        variant="contained"
        color="primary">
        <IconHome />
        Go Home
      </MyButton>
    </div>
  );
};
