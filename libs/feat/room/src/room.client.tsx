import { RoomId, UserId } from '@gamezilla/shared/app';
import { AppMsg, Ctx, RoomCtx, Route, ViewCtx } from '@gamezilla/shared/client';
import { Cmd, RemoteResult, Sub, exhaustive, p } from '@gamezilla/shared/core';
import {
  ActionButton,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  Divider,
  Drawer,
  FillBox,
  IconGamepad,
  IconHome,
  IconSpinner,
  IconUserGroup,
  IconXMark,
  Icons,
  MyAvatar,
  MyButton,
  Paper,
  TopBar,
  TopBarBackButton,
  Typography,
  ViewNode,
  useTheme,
} from '@gamezilla/shared/ui';
import { gameNameToString, viewCoverArt } from './game';
import * as Game from './game.client';
import { GameName, gameNameList } from './game.shared';
import {
  ClientModel,
  ClientMsg,
  ClientRoom,
  Res,
  RoomUser,
  ServerModel,
  ToClient,
  ToServer,
} from './room.shared';

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
      modal: 'none',
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
    case 'clicked-room': {
      return {
        model,
        cmd: Route.push({ t: 'room', c: { t: 'room', roomId: msg.roomId } }),
      };
    }

    case 'modal-closed': {
      return { model: { ...model, modal: 'none' } };
    }

    case 'modal-open': {
      return { model: { ...model, modal: msg.c } };
    }

    case 'clicked-user-link': {
      return {
        model: { ...model, modal: 'none' },
        cmd: Route.push({
          t: 'profile',
          c: { t: 'profile', userId: msg.userId },
        }),
      };
    }

    case 'clicked-user': {
      return {
        model: {
          ...model,
          previewUserId: msg.userId,
          modal: 'user-preview',
        },
      };
    }

    case 'list':
    case 'create':
    case 'join':
    case 'leave':
    case 'destroy':
    case 'input-game': {
      const routeCmd =
        msg.t === 'create'
          ? Route.push({ t: 'room', c: { t: 'room', roomId: msg.roomId } })
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

    case 'game': {
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
            t: 'game',
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
        cmd: Cmd.tag_('game', updated.cmd),
        msgs: updated.msgs,
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
    case 'game': {
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
            t: 'game',
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
        cmd: Cmd.tag_('game', updated.cmd),
        msgs: updated.msgs,
      };
    }

    case 'list':
    case 'create':
    case 'input-game': {
      return updateResponse({ ctx, sendToServer, msg, model });
    }

    case 'destroy': {
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

    case 'leave': {
      const handled = updateResponse({ ctx, sendToServer, msg, model });

      if (msg.result.t === 'err') {
        return handled;
      }

      return {
        model: handled.model,
      };
    }

    case 'join': {
      const handled = updateResponse({ ctx, sendToServer, msg, model });

      if (msg.result.t === 'err') {
        return handled;
      }

      const routeCmd =
        msg.userId === ctx.currentUserId
          ? Route.push({ t: 'room', c: { t: 'room', roomId: msg.roomId } })
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
  switch (msg.t) {
    case 'route-changed': {
      if (msg.route.t !== 'room') {
        return { model };
      }

      switch (msg.route.c.t) {
        case 'room':
        case 'room-list': {
          return updateListRooms({
            model,
            initiatorMsg: msg,
            sendToServer,
          });
        }

        default: {
          return {
            model,
          };
        }
      }
    }

    case 'wire-connected': {
      return updateListRooms({ model, initiatorMsg: msg, sendToServer });
    }

    default: {
      return {
        model,
      };
    }
  }
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
  if (model.requests?.list?.t === 'loading') {
    return { model };
  }
  return {
    model: {
      ...model,
      requests: { ...model.requests, list: RemoteResult.Loading },
    },
    cmd: sendToServer({
      t: 'list',
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
} => {
  if (msg.result.t === 'err') {
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

  const merged = mergeWithServer({
    ctx,
    clientModel: model,
    serverModel: msg.result.value,
    sendToServer,
  });

  // const userIds = Object.values(merged.model.users).map((user) => user.userId);

  return {
    model: {
      ...merged.model,
      requests: { ...merged.model.requests, [msg.t]: RemoteResult.Ok('none') },
    },
    cmd: merged.cmd,
  };
};

const mergeWithServer = ({
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
    [ClientModel['games'], Cmd<ClientMsg>]
  >(
    (gamesNew, [roomId, backendGame]) => {
      if (!RoomId.is(roomId)) {
        return gamesNew;
      }

      const frontendGame = clientModel.games[roomId];

      if (frontendGame) {
        const merged = Game.mergeWithServer({
          ctx,
          serverModel: backendGame,
          clientModel: frontendGame,
          sendToServer: (msg) => sendToServer({ t: 'game', c: msg }),
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
              Cmd.map((m): Msg => ({ t: 'game', c: m }))
            ),
          ]),
        ];
      }

      const initial = Game.init({
        gameName: backendGame.t,
        ctx,
      });

      const merged = Game.mergeWithServer({
        ctx,
        serverModel: backendGame,
        clientModel: initial[0],
        sendToServer: (msg) => sendToServer({ t: 'game', c: msg }),
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
            Cmd.map((msg) => ({ t: 'game', c: msg }))
          ),
          p(
            merged[1],
            Cmd.map((msg) => ({ t: 'game', c: msg }))
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
    Sub.map((msg) => ({ t: 'game', c: msg }))
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
  route: Route.RouteRoom;
  viewBottomBar: ViewNode;
}) => {
  const ctx: ViewCtx = {
    ...ctxPrev,
    profiles: {
      ...ctxPrev.profiles,
      ...model.profiles,
    },
  };

  if (route.t === 'room') {
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
        open={model.modal === 'users'}
        onClose={() => $send({ t: 'modal-closed' })}
        anchor="bottom"
      >
        {room && (
          <ViewRoomPeople room={room} ctx={ctx} $send={$send} model={model} />
        )}
      </Drawer>

      <Drawer
        open={model.modal === 'user-preview'}
        onClose={() => $send({ t: 'modal-closed' })}
        anchor="bottom"
      >
        {model.previewUserId && (
          <ButtonBase
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              p: 2,
            }}
            onClick={() => {
              if (model.previewUserId) {
                $send({ t: 'clicked-user-link', userId: model.previewUserId });
              }
            }}
          >
            <Avatar
              src={ctx.profiles[model.previewUserId]?.avatarUrl}
              sx={{ width: 80, height: 80, marginBottom: 1 }}
            />
            <Typography variant="h6">
              @{ctx.profiles[model.previewUserId]?.username ?? '...'}
            </Typography>
          </ButtonBase>
        )}
        <Box sx={{ px: 2, paddingBottom: 4, width: '100%' }}>
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
    model.requests.list?.t === 'loading' ||
    model.requests.create?.t === 'loading' ||
    model.requests.join?.t === 'loading'
  ) {
    return (
      <div className="w-full h-full grid place-items-center">
        <IconSpinner className="animate-spin w-12 h-12" />
      </div>
    );
  }

  const room = model.rooms[roomId];

  if (!room) {
    return <ViewRoomNotFound ctx={ctx} />;
  }

  const currentUser = model.users[ctx.currentUserId];

  if (!currentUser) {
    return <ViewNotInRoom room={room} $send={$send} ctx={ctx} model={model} />;
  }

  if (currentUser.roomId !== roomId) {
    return <ViewNotInRoom room={room} $send={$send} ctx={ctx} model={model} />;
  }

  const game = model.games[room.roomId];
  return (
    <div className="w-full h-full flex-1 flex flex-col">
      <nav className="flex items-center w-full p-2">
        <div className="w-20 flex items-center">
          <ActionButton
            label="Home"
            icon={<IconHome />}
            onClick={() => ctx.$push({ t: 'room', c: { t: 'room-list' } })}
          />
        </div>

        <div className="w-20 flex items-center">
          <ActionButton
            label="People"
            icon={<IconUserGroup />}
            onClick={() => $send({ t: 'modal-open', c: 'users' })}
          />
        </div>

        <div className="flex-1"></div>

        <MyButton
          color="danger"
          variant="contained"
          size="sm"
          onClick={() => {
            if (room.hostId === ctx.currentUserId) {
              $send({ t: 'destroy', userId: ctx.currentUserId });
            } else {
              $send({ t: 'leave', userId: ctx.currentUserId });
            }
          }}
        >
          {room.hostId === ctx.currentUserId ? 'End' : 'Leave'}
        </MyButton>
      </nav>

      {game ? (
        <Game.View
          ctx={{
            ...ctx,
            hostId: room.hostId,
            onQuit: () => $send({ t: 'input-game', gameName: undefined }),
          }}
          $send={(msg) => $send({ t: 'game', c: msg })}
          model={game}
        />
      ) : (
        <ViewNotInGame model={model} ctx={ctx} room={room} $send={$send} />
      )}
    </div>
  );
};

export const ViewRoomNotFound = ({ ctx }: { ctx: ViewCtx }) => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      <p className="text-2xl text-center">Room not found</p>
      <MyButton
        onClick={() => ctx.$push({ t: 'room', c: { t: 'room-list' } })}
        size="lg"
        variant="contained"
        color="primary"
      >
        <IconHome />
        Go Home
      </MyButton>
    </div>
  );
};

export const ViewRoomListScreen = ({
  ctx,
  $send,
  model,
}: {
  model: Model;
  ctx: ViewCtx;
  $send: (m: Msg) => void;
}) => {
  const user = model.users[ctx.currentUserId];
  const currentRoom = user ? model.rooms[user.roomId] : undefined;
  const rooms = Object.values(model.rooms);

  if (model.requests.list?.t === 'loading') {
    return (
      <div className="w-full h-full flex flex-col">
        <TopBar title="Rooms" />
        <div className="flex-1 flex items-center justify-center">
          <IconSpinner className="w-12 h-12 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full max-h-full overflow-hidden">
      <TopBar title="Rooms" />

      {rooms.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-60">
          <IconGamepad className="w-12 h-12" />
          <p className="text-lg">No active rooms</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-4">
          <div className="flex flex-col gap-4 px-5">
            {rooms.map((room) => {
              const host = ctx.profiles[room.hostId];
              const users = Object.values(model.users).flatMap((user) => {
                if (user.roomId !== room.roomId) {
                  return [];
                }
                const profile = ctx.profiles[user.userId];
                if (!profile) {
                  return [];
                }
                return [profile];
              });
              const gameName = model.games[room.roomId]?.t;
              const currentRoomId = model.users[ctx.currentUserId]?.roomId;
              return (
                <ViewRoomCard
                  host={{
                    username: host?.username ?? '...',
                    avatarUrl: host?.avatarUrl ?? '',
                  }}
                  key={room.roomId}
                  isCurrentRoom={currentRoomId === room.roomId}
                  users={users}
                  gameName={gameName}
                  onClick={() => {
                    ctx.$push({
                      t: 'room',
                      c: { t: 'room', roomId: room.roomId },
                    });
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {!currentRoom && (
        <div className="w-full p-4">
          <MyButton
            size="lg"
            className="w-full"
            color="primary"
            onClick={() => $send({ t: 'create', roomId: RoomId.generate() })}
          >
            Create Room
          </MyButton>
        </div>
      )}
    </div>
  );
};

const ViewRoomCard = ({
  gameName,
  onClick,
  isCurrentRoom,
  host,
}: {
  gameName?: GameName;
  users: { avatarUrl: string; username: string }[];
  onClick: () => void;
  isCurrentRoom?: boolean;
  host: {
    username: string;
    avatarUrl: string;
  };
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 rounded-md flex flex-col gap-3 p-4 active:opacity-70"
    >
      <div className="w-full flex items-center justify-start">
        <p className="block uppercase text-left font-bold animate-pulse flex-1">
          LIVE
        </p>
        {isCurrentRoom && (
          <p className="block text-xs font-light opacity-50 italic">
            Current Room
          </p>
        )}
      </div>

      {gameName && (
        <div className="flex items-center justify-start gap-2">
          <div className="w-12 h-12 rounded overflow-hidden border-2 border-white/40">
            {viewCoverArt(gameName)}
          </div>
          <p className="text-xl">{gameNameToString(gameName)}</p>
        </div>
      )}

      <div className="flex items-center justify-start gap-2">
        <MyAvatar src={host.avatarUrl} alt="avatar" className="w-12 h-12" />

        <p className="text-xl">{host.username}</p>
        <span className="bg-white/30 rounded-full p-1 px-2 text-xs">Host</span>
      </div>
    </button>
  );
};

export const formatUsername = (username: string) => {
  if (username.length > 12) {
    return username.slice(0, 12) + '...';
  }
  return username;
};

export const formatUsernames = (usernames: string[]) => {
  const formatted = usernames.map(formatUsername);
  if (formatted.length > 3) {
    return `${formatted.slice(0, 3).join(', ')} & ${formatted.length - 3} more`;
  }
  return formatted.join(', ');
};

export const ViewNotInGame = ({
  room,
  ctx,
  $send,
}: {
  model: Model;
  room: ClientRoom;
  ctx: ViewCtx;
  $send: (m: Msg) => void;
}) => {
  if (room.hostId !== ctx.currentUserId) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center opacity-60">
        <IconGamepad className="w-12 h-12" />
        <div className="text-lg">No game selected</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-y-6 gap-x-3 p-4 py-6">
      {gameNameList.map((gameName) => (
        <div key={gameName}>
          <div className="px-2">
            <button
              onClick={() => $send({ t: 'input-game', gameName })}
              className="flex rounded-lg overflow-hidden focus:outline-none focus:ring focus:ring-primary"
            >
              {viewCoverArt(gameName)}
            </button>
          </div>
          <p className="text-sm mt-2 w-full text-center whitespace-nowrap overflow-hidden text-ellipsis">
            {gameNameToString(gameName)}
          </p>
        </div>
      ))}
    </div>
  );
};

export const ViewNotInRoom = ({
  model,
  ctx,
  room,
  $send,
}: {
  room: { roomId: RoomId; hostId: UserId };
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const usersInRoom = toRoomUsers(room.roomId, model);
  const host = ctx.profiles[room.hostId];
  const title = `${host?.username ?? '...'}'s room`;
  const game = model.games[room.roomId];
  const theme = useTheme();
  return (
    <FillBox>
      <TopBar
        left={
          <TopBarBackButton
            onClick={() => ctx.$push({ t: 'room', c: { t: 'room-list' } })}
          />
        }
        title={title}
      />

      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            height: '33.3333%',
            maxHeight: '33.3333%',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              mb: 1,
              overflow: 'hidden',
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'background.paper',
            }}
          >
            {game ? (
              viewCoverArt(game.t)
            ) : (
              <Icons.SportsEsports
                sx={{
                  color: 'text.secondary',
                  width: '100%',
                  height: '100%',
                }}
              />
            )}
          </Box>
          <Typography variant="h4" color="text.secondary">
            {game ? gameNameToString(game.t) : '...'}
          </Typography>
        </Box>

        <Divider />
        <Box
          sx={{
            width: '100%',
            height: '66.6666%',
            maxHeight: '66.6666%',
            overflowY: 'scroll',
          }}
        >
          <ViewRoomUserListItem
            isHost
            key={room.hostId}
            userId={room.hostId}
            ctx={ctx}
            onClick={() => {
              $send({ t: 'clicked-user', userId: room.hostId });
            }}
          />

          {usersInRoom.map((user) => {
            if (user.userId === room.hostId) {
              return null;
            }
            return (
              <ViewRoomUserListItem
                key={user.userId}
                userId={user.userId}
                ctx={ctx}
                onClick={() => {
                  $send({ t: 'clicked-user', userId: user.userId });
                }}
              />
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, width: '100%', padding: 2 }}>
        <Button
          fullWidth
          endIcon={<Icons.ChevronRight />}
          variant="contained"
          loading={model.requests['join']?.t === 'loading'}
          onClick={() => {
            $send({
              t: 'join',
              userId: ctx.currentUserId,
              roomId: room.roomId,
            });
          }}
        >
          Join Room
        </Button>
      </Box>
    </FillBox>
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
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Avatar sx={{ mr: 1 }} src={ctx.profiles[userId]?.avatarUrl ?? ''} />
      <Typography align="left">
        {ctx.profiles[userId]?.username ?? '...'}
      </Typography>
      {ctx.currentUserId === userId && <Chip sx={{ ml: 1 }} label="You" />}
      {isHost && <Chip sx={{ ml: 1 }} label="Host" />}
    </ButtonBase>
  );
};

export const ViewGameArtCard = ({ gameName }: { gameName: GameName }) => {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', width: '100%' }}>
      {viewCoverArt(gameName)}

      <Typography
        variant="subtitle2"
        noWrap
        sx={{ width: '100%', px: 1, py: 0.5 }}
      >
        {gameNameToString(gameName)}
      </Typography>
    </Paper>
  );
};

const toRoomUsers = (roomId: RoomId, model: Model): RoomUser[] => {
  const roomUsers: RoomUser[] = [];
  for (const userId in model.users) {
    if (!UserId.is(userId)) {
      continue;
    }

    const user = model.users[userId];

    if (!user) {
      continue;
    }

    if (user.roomId !== roomId) {
      continue;
    }

    roomUsers.push(user);
  }

  return roomUsers;
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
    <FillBox>
      <TopBar
        // left={
        //   <Button
        //     size="small"
        //     sx={{ marginLeft: -1 }}
        //     onClick={() => $send(['modal-closed'])}
        //   >
        //     Close
        //   </Button>
        // }
        title={`People (${userCount})`}
      />
      <Divider />

      <Box>
        {usersInRoom.map((user) => {
          return (
            <ViewRoomUserListItem
              isHost={user.userId === room.hostId}
              key={user.userId}
              userId={user.userId}
              ctx={ctx}
              onClick={() => $send({ t: 'clicked-user', userId: user.userId })}
            />
          );
        })}
      </Box>
    </FillBox>
  );
};

export const ViewBottomBar = ({
  ctx: ctxPrev,
  model,
  $send,
}: {
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
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

  const room = model.rooms[user.roomId];

  if (!room) {
    return null;
  }

  const game = model.games[room.roomId];
  const hostProfile = ctx.profiles[room.hostId];
  const userCount = Object.values(model.users).filter(
    (user) => user.roomId === room.roomId
  ).length;

  return (
    <div className="text-inherit border-t-2 border-blue-500 overflow-hidden w-full flex items-center">
      <button
        className="flex-1 flex items-center overflow-hidden"
        onClick={() => {
          ctx.$push({ t: 'room', c: { t: 'room', roomId: room.roomId } });
        }}
      >
        <div className="p-2 mr-2">
          {!game && (
            <MyAvatar
              src={hostProfile?.avatarUrl ?? ''}
              alt="Host Avatar"
              className="w-12 h-12"
            />
          )}
          {game && (
            <div className="rounded overflow-hidden w-12 h-12">
              {viewCoverArt(game.t)}
            </div>
          )}
        </div>

        <div className="overflow-hidden flex-1 flex flex-col gap-1">
          <p className="text-left">
            {hostProfile ? `${hostProfile.username}'s room` : '...'}
          </p>
          <p className="text-xs text-left text-neutral-300">
            {userCount} in room
          </p>
        </div>
      </button>

      <button
        onClick={() => {
          if (ctx.currentUserId === room.hostId) {
            $send({ t: 'destroy', userId: ctx.currentUserId });
            return;
          }
          $send({ t: 'leave', userId: ctx.currentUserId });
        }}
        className="mr-4"
      >
        <IconXMark className="w-8 h-8" />
      </button>
    </div>
  );
};
