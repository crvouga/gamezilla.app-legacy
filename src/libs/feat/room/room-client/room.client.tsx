import { RoomId } from "@gamezilla/shared/app";
import {
  AppMsg,
  Ctx,
  RoomCtx,
  RoomViewCtx,
  Route,
  RouteRoom,
  ViewCtx,
  ViewRoomHostChip,
  ViewUsersInRoomList,
  ViewYouChip,
} from "@gamezilla/shared/client";
import { Cmd, RemoteResult, Sub, exhaustive, p } from "@gamezilla/shared/core";
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
  Res,
  ServerModel,
  ToClient,
  ToServer,
  toRoom,
} from "../room.shared";
import { ViewNotInGameScreen } from "./view-not-in-game-screen";
import { ViewRoomJoinScreen } from "./view-room-join-screen";
import { ViewRoomListScreen } from "./view-room-list-screen";

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
      rooms: {},
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
  ctx: ctxPrev,
  sendToServer,
  msg,
  model,
}: {
  ctx: Ctx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: AppMsg[];
} => {
  const ctx: Ctx = {
    ...ctxPrev,
    profiles: {
      ...ctxPrev.profiles,
      ...model.profiles,
    },
  };
  switch (msg.t) {
    case "clicked-room": {
      return {
        model,
        cmd: Route.push({ t: "room", c: { t: "room", roomId: msg.roomId } }),
      };
    }

    case "modal-closed": {
      return { model: { ...model, modal: "none" } };
    }

    case "modal-open": {
      return { model: { ...model, modal: msg.c } };
    }

    case "clicked-user-link": {
      return {
        model: { ...model, modal: "none" },
        cmd: Route.push({
          t: "profile",
          c: { t: "profile", userId: msg.userId },
        }),
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

    case "list":
    case "create":
    case "join":
    case "leave":
    case "destroy":
    case "input-game": {
      const routeCmd =
        msg.t === "create"
          ? Route.push({ t: "room", c: { t: "room", roomId: msg.roomId } })
          : Cmd.None;

      return {
        model: {
          ...model,
          requests: {
            ...model.requests,
            [msg.t]: RemoteResult.Loading,
          },
        },
        cmd: Cmd.batch([
          routeCmd,
          sendToServer({ ...msg, profile: ctx.profiles[ctx.currentUserId] }),
        ]),
      };
    }

    case "game": {
      const user = model.users[ctx.currentUserId];

      if (!user) {
        return { model };
      }

      const room = model.rooms[user.roomId];

      if (!room) {
        return { model };
      }

      const game = model.games[user.roomId];

      if (!game) {
        return { model };
      }

      const gameMsg = msg.c;

      const roomCtx: RoomCtx = {
        ...ctx,
        hostId: room.hostId,
      };

      const updated = Game.update({
        ctx: roomCtx,
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
          [user.roomId]: updated.model,
        },
      };

      return {
        model: modelNew,
        cmd: Cmd.tag_("game", updated.cmd),
        msgs: AppMsg.tag("game", updated.msgs),
      };
    }

    default:
      return exhaustive(msg[0]);
  }
};

export const updateFromServer = ({
  ctx: ctxPrev,
  sendToServer,
  msg,
  model,
}: {
  ctx: Ctx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: AppMsg[];
} => {
  const ctx: Ctx = {
    ...ctxPrev,
    profiles: {
      ...ctxPrev.profiles,
      ...model.profiles,
    },
  };
  switch (msg.t) {
    case "game": {
      const user = model.users[ctx.currentUserId];

      if (!user) {
        return { model };
      }

      const room = model.rooms[user.roomId];

      if (!room) {
        return { model };
      }

      const game = model.games[user.roomId];

      if (!game) {
        return { model };
      }

      const gameMsg = msg.c;

      const updated = Game.updateFromServer({
        ctx: {
          ...ctx,
          hostId: room.hostId,
        },
        sendToServer: (msg) =>
          sendToServer({
            t: "game",
            c: msg,
            profile: ctx.profiles[ctx.currentUserId],
          }),
        model: game,
        msg: gameMsg,
      });

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [user.roomId]: updated.model,
        },
      };

      return {
        model: modelNew,
        cmd: Cmd.tag_("game", updated.cmd),
        msgs: updated.msgs,
      };
    }

    case "list":
    case "create":
    case "input-game": {
      return updateResponse({ ctx, sendToServer, msg, model });
    }

    case "destroy": {
      const handled = updateResponse({ ctx, sendToServer, msg, model });

      const user = model.users[ctx.currentUserId];

      if (!user) {
        return handled;
      }

      const room = model.rooms[user.roomId];

      if (!room) {
        return handled;
      }

      if (room.hostId === ctx.currentUserId) {
        return handled;
      }

      return {
        model: handled.model,
        cmd: handled.cmd,
      };
    }

    case "leave": {
      const handled = updateResponse({ ctx, sendToServer, msg, model });

      if (msg.result.t === "err") {
        return handled;
      }

      return {
        model: handled.model,
      };
    }

    case "join": {
      const handled = updateResponse({ ctx, sendToServer, msg, model });

      if (msg.result.t === "err") {
        return handled;
      }

      const routeCmd =
        msg.userId === ctx.currentUserId
          ? Route.push({ t: "room", c: { t: "room", roomId: msg.roomId } })
          : Cmd.None;

      return {
        model: handled.model,
        cmd: Cmd.batch([handled.cmd, routeCmd]),
      };
    }
  }
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
    if (msg.route.t === "room" && msg.route.c.t === "room-list") {
      return updateListRooms({
        model,
        initiatorMsg: msg,
        sendToServer,
      });
    }
    return { model };
  }

  if (msg.t === "wire-connected") {
    return updateListRooms({ model, initiatorMsg: msg, sendToServer });
  }

  return { model };
};

const updateListRooms = ({
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

const updateResponse = ({
  sendToServer,
  ctx,
  msg,
  model,
}: {
  msg: Res;
  model: Model;
  ctx: Ctx;
  sendToServer: (msg: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: AppMsg[];
} => {
  if (msg.result.t === "err") {
    return {
      model: {
        ...model,
        requests: {
          ...model.requests,
          [msg.t]: RemoteResult.Err(msg.result.error),
        },
      },
      cmd: Cmd.None,
    };
  }

  const merged = syncWithServer({
    ctx,
    clientModel: model,
    serverModel: msg.result.value,
    sendToServer,
  });

  // const userIds = Object.values(merged.model.users).map((user) => user.userId);

  return {
    model: {
      ...merged.model,
      requests: { ...merged.model.requests, [msg.t]: RemoteResult.Ok("none") },
    },
    cmd: merged.cmd,
    msgs: [{ t: "got-profiles", profiles: merged.model.profiles }],
  };
};

const syncWithServer = ({
  ctx,
  clientModel,
  serverModel,
  sendToServer,
}: {
  ctx: Ctx;
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
    (gamesNew, [roomId, backendGame]) => {
      if (!RoomId.is(roomId)) {
        return gamesNew;
      }

      const frontendGame = clientModel.games[roomId];

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
            [roomId]: merged[0],
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
          [roomId]: merged[0],
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
      rooms: serverModel.rooms,
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

  const game = model.games[user.roomId];

  if (!game) {
    return Sub.None;
  }

  return p(
    Game.subscriptions(`room/${user.roomId}`, ctx, game),
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
  route: RouteRoom;
  viewBottomBar: VDom;
}) => {
  const ctx: ViewCtx = {
    ...ctxPrev,
    profiles: {
      ...ctxPrev.profiles,
      ...model.profiles,
    },
  };

  if (route.t === "room") {
    return (
      <ViewRoomScreen
        roomId={route.roomId}
        ctx={ctx}
        $send={$send}
        model={model}
      />
    );
  }

  return (
    <>
      <ViewRoomListScreen $send={$send} ctx={ctx} model={model} />
      {viewBottomBar}
    </>
  );
};

const ViewRoomScreen = ({
  ctx,
  $send,
  model,
  roomId,
}: {
  model: Model;
  ctx: ViewCtx;
  $send: (m: Msg) => void;
  roomId: RoomId;
}) => {
  if (
    model.requests.list?.t === "loading" ||
    model.requests.create?.t === "loading" ||
    model.requests.join?.t === "loading"
  ) {
    return <LoadingScreen />;
  }

  const room = toRoom({ roomId, model });

  if (!room) {
    return <ViewRoomNotFound ctx={ctx} />;
  }

  const roomCtx: RoomViewCtx = {
    ...ctx,
    hostId: room.hostId,
    room,
    onViewProfile: (input) =>
      $send({ t: "clicked-user", userId: input.userId }),
    onQuit: () => $send({ t: "input-game", gameName: undefined }),
  };

  return (
    <>
      <ViewPage ctx={roomCtx} $send={$send} model={model} />

      <MyDrawer
        open={model.modal === "users"}
        onClose={() => $send({ t: "modal-closed" })}>
        {roomCtx && <ViewUsersInRoomList ctx={roomCtx} />}
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
          {roomCtx.hostId === model.previewUserId && <ViewRoomHostChip />}
          {roomCtx.currentUserId === model.previewUserId && <ViewYouChip />}
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
  ctx: RoomViewCtx;
  $send: (m: Msg) => void;
}) => {
  const currentUser = model.users[ctx.currentUserId];

  if (!currentUser) {
    return <ViewRoomJoinScreen model={model} $send={$send} ctx={ctx} />;
  }

  if (currentUser.roomId !== ctx.room.roomId) {
    return <ViewRoomJoinScreen $send={$send} ctx={ctx} model={model} />;
  }

  const game = model.games[ctx.room.roomId];
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <nav className="flex h-14 w-full items-center border-b border-neutral-600 px-2 py-1">
        <div className="flex w-20 items-center">
          <ActionButton
            label="Home"
            icon={<IconHome />}
            onClick={() => ctx.$push({ t: "room", c: { t: "room-list" } })}
          />
        </div>

        <div className="flex w-20 items-center">
          <ActionButton
            label="People"
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
            if (ctx.room.hostId === ctx.currentUserId) {
              $send({ t: "destroy", userId: ctx.currentUserId });
              return;
            }
            $send({ t: "leave", userId: ctx.currentUserId });
          }}>
          {ctx.room.hostId === ctx.currentUserId ? "End" : "Leave"}
        </MyButton>
      </nav>
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

export const ViewRoomNotFound = ({ ctx }: { ctx: ViewCtx }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">Space not found</p>
      <MyButton
        onClick={() => ctx.$push({ t: "room", c: { t: "room-list" } })}
        size="lg"
        variant="contained"
        color="primary">
        <IconHome />
        Go Home
      </MyButton>
    </div>
  );
};
