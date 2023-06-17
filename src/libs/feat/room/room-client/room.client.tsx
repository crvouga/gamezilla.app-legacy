import { RoomId, UserId } from "@gamezilla/shared/app";
import {
  AppMsg,
  Ctx,
  RoomCtx,
  Route,
  RouteRoom,
  ViewCtx,
} from "@gamezilla/shared/client";
import { Cmd, RemoteResult, Sub, exhaustive, p } from "@gamezilla/shared/core";
import {
  ActionButton,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  Drawer,
  FillBox,
  IconHome,
  IconSpinner,
  IconUserGroup,
  Icons,
  MyButton,
  Paper,
  TopBar,
  Typography,
  VDom,
} from "@gamezilla/shared/ui";
import * as Game from "../game.client";
import { GameName, gameNameToString, viewCoverArt } from "../game.shared";
import {
  ClientModel,
  ClientMsg,
  Res,
  ServerModel,
  ToClient,
  ToServer,
  toRoomUsers,
} from "../room.shared";
import { ViewRoomJoinScreen } from "./view-room-join-screen";
import { ViewRoomListScreen } from "./view-room-list-screen";
import { ViewNotInGameScreen } from "./view-not-in-game-screen";

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
  if (
    msg.t === "route-changed" &&
    msg.route.t === "room" &&
    msg.route.c.t === "room-list"
  ) {
    return updateListRooms({
      model,
      initiatorMsg: msg,
      sendToServer,
    });
  }

  if (msg.t === "wire-connected") {
    return updateListRooms({ model, initiatorMsg: msg, sendToServer });
  }

  return {
    model,
  };
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
  const room = model.rooms[roomId];
  return (
    <FillBox>
      <ViewPage roomId={roomId} ctx={ctx} $send={$send} model={model} />
      <Drawer
        open={model.modal === "users"}
        onClose={() => $send({ t: "modal-closed" })}
        anchor="bottom">
        {room && (
          <ViewRoomPeople room={room} ctx={ctx} $send={$send} model={model} />
        )}
      </Drawer>

      <Drawer
        open={model.modal === "user-preview"}
        onClose={() => $send({ t: "modal-closed" })}
        anchor="bottom">
        {model.previewUserId && (
          <ButtonBase
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              p: 2,
            }}
            onClick={() => {
              if (model.previewUserId) {
                $send({ t: "clicked-user-link", userId: model.previewUserId });
              }
            }}>
            <Avatar
              src={ctx.profiles[model.previewUserId]?.avatarUrl}
              sx={{ width: 80, height: 80, marginBottom: 1 }}
            />
            <Typography variant="h6">
              @{ctx.profiles[model.previewUserId]?.username ?? "..."}
            </Typography>
          </ButtonBase>
        )}
        <Box sx={{ px: 2, paddingBottom: 4, width: "100%" }}>
          <Button variant="outlined" fullWidth startIcon={<Icons.Send />}>
            Direct Message
          </Button>
        </Box>
      </Drawer>
    </FillBox>
  );
};

const ViewPage = ({
  ctx,
  $send,
  model,
  roomId,
}: {
  roomId: RoomId;
  model: Model;
  ctx: ViewCtx;
  $send: (m: Msg) => void;
}) => {
  if (
    model.requests.list?.t === "loading" ||
    model.requests.create?.t === "loading" ||
    model.requests.join?.t === "loading"
  ) {
    return (
      <div className="grid h-full w-full place-items-center">
        <IconSpinner className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const room = model.rooms[roomId];

  if (!room) {
    return <ViewRoomNotFound ctx={ctx} />;
  }

  const currentUser = model.users[ctx.currentUserId];

  if (!currentUser) {
    return (
      <ViewRoomJoinScreen room={room} $send={$send} ctx={ctx} model={model} />
    );
  }

  if (currentUser.roomId !== roomId) {
    return (
      <ViewRoomJoinScreen room={room} $send={$send} ctx={ctx} model={model} />
    );
  }

  const game = model.games[room.roomId];
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <nav className="flex w-full items-center px-2 py-1">
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
          // variant="text"
          size="sm"
          onClick={() => {
            if (room.hostId === ctx.currentUserId) {
              $send({ t: "destroy", userId: ctx.currentUserId });
              return;
            }
            $send({ t: "leave", userId: ctx.currentUserId });
          }}>
          {room.hostId === ctx.currentUserId ? "End" : "Leave"}
        </MyButton>
      </nav>

      {game ? (
        <Game.View
          ctx={{
            ...ctx,
            hostId: room.hostId,
            onQuit: () => $send({ t: "input-game", gameName: undefined }),
          }}
          $send={(msg) => $send({ t: "game", c: msg })}
          model={game}
        />
      ) : (
        <ViewNotInGameScreen
          model={model}
          ctx={ctx}
          room={room}
          $send={$send}
        />
      )}
    </div>
  );
};

export const ViewRoomNotFound = ({ ctx }: { ctx: ViewCtx }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">Room not found</p>
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

export const ViewGameArtCard = ({ gameName }: { gameName: GameName }) => {
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", width: "100%" }}>
      {viewCoverArt(gameName)}

      <Typography
        variant="subtitle2"
        noWrap
        sx={{ width: "100%", px: 1, py: 0.5 }}>
        {gameNameToString(gameName)}
      </Typography>
    </Paper>
  );
};

const ViewRoomPeople = ({
  model,
  $send,
  ctx,
  room,
}: {
  room: { roomId: RoomId; hostId: UserId };
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const usersInRoom = toRoomUsers(room.roomId, model);
  const userCount = usersInRoom.length;

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar title={`People (${userCount})`} />
      <div className="flex flex-col">
        {usersInRoom.map((user) => {
          return (
            <ViewRoomUserListItem
              isHost={user.userId === room.hostId}
              key={user.userId}
              userId={user.userId}
              ctx={ctx}
              onClick={() => $send({ t: "clicked-user", userId: user.userId })}
            />
          );
        })}
      </div>
    </div>
  );
};
const ViewRoomUserListItem = ({
  ctx,
  userId,
  onClick,
  isHost,
}: {
  ctx: ViewCtx;
  userId: UserId;
  onClick: () => void;
  isHost?: boolean;
}) => {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        px: 2,
        py: 1,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
      }}>
      <Avatar sx={{ mr: 1 }} src={ctx.profiles[userId]?.avatarUrl ?? ""} />
      <Typography align="left">
        {ctx.profiles[userId]?.username ?? "..."}
      </Typography>
      {ctx.currentUserId === userId && <Chip sx={{ ml: 1 }} label="You" />}
      {isHost && <Chip sx={{ ml: 1 }} label="Host" />}
    </ButtonBase>
  );
};
