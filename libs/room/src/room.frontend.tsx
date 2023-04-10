import { Cmd, exhaustive, p, RemoteData, Sub } from '@gamezilla/core';
import { RoomCtx } from '@gamezilla/game-shared';
import { ProfileStore } from '@gamezilla/profile';
import { Alerts, AppMsg, Ctx, RoomId, Route, UserId } from '@gamezilla/shared';
import {
  ActionButton,
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  ButtonBase,
  CardActionArea,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FillBox,
  Header,
  HeaderBackButton,
  IconButton,
  Icons,
  Paper,
  Typography,
  useTheme,
  ViewEmptyState,
} from '@gamezilla/shared/ui';
import { BadgeProps, styled } from '@mui/material';
import { gameNameToString, viewCoverArt } from './game';
import * as Game from './game.frontend';
import { GameName, gameNameList } from './game.types';
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  FrontendRoom,
  Res,
  RoomUser,
  ToBackend,
  ToFrontend,
} from './room.types';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init = (): { model: Model } => {
  return {
    model: {
      games: {},
      rooms: {},
      users: {},
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

export type Msg = FrontendMsg;

type OutAction = Alerts.Action<Msg> | ProfileStore.Action | Route.Action;

//
//
//
// Update
//
//
//

export const update = ({
  ctx,
  sendToBackend,
  msg,
  model,
}: {
  ctx: Ctx;
  sendToBackend: (msg: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case 'clicked-room': {
      return { model, cmd: Route.push(['room', msg.roomId]) };
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
        cmd: Route.push(['profile', msg]),
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
        msg.t === 'create' ? Route.push(['room', msg.roomId]) : Cmd.None;

      return {
        model: {
          ...model,
          requests: {
            ...model.requests,
            [msg.t]: RemoteData.Loading,
          },
        },
        cmd: Cmd.batch([routeCmd, sendToBackend(msg)]),
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

      const gameRoomCtx: RoomCtx = {
        ...ctx,
        hostId: room.hostId,
        onQuit: () => {
          //
        },
      };

      const [gameNew, gameCmd] = Game.update({
        ctx: gameRoomCtx,
        sendToBackend: (msg) => sendToBackend({ t: 'game', c: msg }),
        msg: gameMsg,
        model: game,
      });

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [user.roomId]: gameNew,
        },
      };

      return {
        model: modelNew,
        cmd: p(
          gameCmd,
          Cmd.map((msg): Msg => ({ t: 'game', c: msg }))
        ),
      };
    }

    default:
      return exhaustive(msg[0]);
  }
};

export const updateFromBackend = ({
  ctx,
  sendToBackend,
  msg,
  model,
}: {
  ctx: Ctx;
  sendToBackend: (msg: ToBackend) => Cmd;
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  actions?: OutAction[];
} => {
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

      const [gameNew, gameCmd, actions] = Game.updateFromBackend({
        ctx: {
          ...ctx,
          hostId: room.hostId,
          onQuit: () => {
            //
          },
        },
        sendToBackend: (msg) => sendToBackend({ t: 'game', c: msg }),
        model: game,
        msg: gameMsg,
      });

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [user.roomId]: gameNew,
        },
      };

      return {
        model: modelNew,
        cmd: Cmd.tag_('game', gameCmd),
        actions,
      };
    }

    case 'list':
    case 'create':
    case 'input-game': {
      return updateResponse({ ctx, sendToBackend, msg, model });
    }

    case 'destroy': {
      const handled = updateResponse({ ctx, sendToBackend, msg, model });

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

      const alertActions: OutAction[] =
        msg.result.type === 'Ok'
          ? [
              [
                'alerts',
                {
                  message: toRoomEndMessage({
                    ctx,
                    hostId: room.hostId,
                  }),
                  tag: 'Snack',
                },
              ],
            ]
          : [];

      return {
        model: handled.model,
        cmd: handled.cmd,
        actions: [...(handled?.actions ?? []), ...alertActions],
      };
    }

    case 'leave': {
      const handled = updateResponse({ ctx, sendToBackend, msg, model });

      if (msg.result.type === 'Err') {
        return handled;
      }

      const alertActions: OutAction[] =
        msg.userId !== ctx.currentUserId
          ? [
              [
                'alerts',
                {
                  tag: 'Snack',
                  message: toRoomLeaveMessage({
                    userId: msg.userId,
                    ctx,
                  }),
                },
              ],
            ]
          : [];

      return {
        model: handled.model,
        cmd: handled.cmd,
        actions: [...(handled?.actions ?? []), ...alertActions],
      };
    }

    case 'join': {
      const handled = updateResponse({ ctx, sendToBackend, msg, model });

      if (msg.result.type === 'Err') {
        return handled;
      }

      const routeActions: OutAction[] =
        msg.userId === ctx.currentUserId
          ? [['route', ['Replace', ['room', msg.roomId]]]]
          : [];

      const alertActions: OutAction[] =
        msg.userId !== ctx.currentUserId
          ? [
              [
                'alerts',
                {
                  tag: 'Snack',
                  message: toRoomJoinMessage({
                    userId: msg.userId,
                    ctx,
                  }),
                },
              ],
            ]
          : [];

      return {
        model: handled.model,
        cmd: handled.cmd,
        actions: [
          ...(handled?.actions ?? []),
          ...routeActions,
          ...alertActions,
        ],
      };
    }
  }
};

export const updateFromApp = ({
  msg,
  model,
  sendToBackend,
}: {
  msg: AppMsg;
  model: Model;
  sendToBackend: (m: ToBackend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case 'route-changed': {
      switch (msg.route[0]) {
        case 'room':
        case 'room-list': {
          return updateListRooms({ model, initiatorMsg: msg, sendToBackend });
        }

        default: {
          return {
            model,
          };
        }
      }
    }

    case 'wire-connected': {
      return updateListRooms({ model, initiatorMsg: msg, sendToBackend });
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
  sendToBackend,
}: {
  model: Model;
  initiatorMsg: unknown;
  sendToBackend: (m: ToBackend) => Cmd;
}) => {
  if (model.requests?.list?.type === 'Loading') {
    return { model };
  }
  return {
    model: {
      ...model,
      requests: { ...model.requests, list: RemoteData.Loading },
    },
    cmd: sendToBackend({ t: 'list', initiatorMsg }),
  };
};

const toRoomEndMessage = ({ ctx, hostId }: { hostId: UserId; ctx: Ctx }) => {
  const profile = ctx.profiles[hostId];
  if (profile) {
    return `${profile.username} ended the room`;
  }
  return 'The host ended the room';
};

const toRoomJoinMessage = ({ ctx, userId }: { userId: UserId; ctx: Ctx }) => {
  const profile = ctx.profiles[userId];
  if (profile) {
    return `${profile.username} joined the room`;
  }
  return 'A user joined the room';
};

const toRoomLeaveMessage = ({ ctx, userId }: { userId: UserId; ctx: Ctx }) => {
  const profile = ctx.profiles[userId];
  if (profile) {
    return `${profile.username} left the room`;
  }
  return 'A user left the room';
};

const updateResponse = ({
  sendToBackend,
  ctx,
  msg,
  model,
}: {
  msg: Res;
  model: Model;
  ctx: Ctx;
  sendToBackend: (msg: ToBackend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  actions?: OutAction[];
} => {
  if (msg.result.type === 'Err') {
    return {
      model: {
        ...model,
        requests: {
          ...model.requests,
          [msg.t]: RemoteData.Err(msg.result.error),
        },
      },
      cmd: Cmd.None,
      actions: [],
    };
  }

  const merged = mergeWithBackend({
    ctx,
    frontendModel: model,
    backendModel: msg.result.value,
    sendToBackend,
  });

  const userIds = Object.values(merged.model.users).map((user) => user.userId);

  return {
    model: {
      ...merged.model,
      requests: { ...merged.model.requests, [msg.t]: RemoteData.Ok('none') },
    },
    cmd: merged.cmd,
    actions: [['profile', ['find-many', { userIds }]]],
  };
};

const mergeWithBackend = ({
  ctx,
  frontendModel,
  backendModel,
  sendToBackend,
}: {
  ctx: Ctx;
  sendToBackend: (msg: ToBackend) => Cmd;
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): {
  model: FrontendModel;
  cmd: Cmd<FrontendMsg>;
} => {
  const gamesNew = Object.entries(backendModel.games).reduce<
    [FrontendModel['games'], Cmd<FrontendMsg>]
  >(
    (gamesNew, [roomId, backendGame]) => {
      if (!RoomId.is(roomId)) {
        return gamesNew;
      }

      const frontendGame = frontendModel.games[roomId];

      if (frontendGame) {
        const merged = Game.mergeWithBackend({
          ctx,
          backendModel: backendGame,
          frontendModel: frontendGame,
          sendToBackend: (msg) => sendToBackend({ t: 'game', c: msg }),
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

      const merged = Game.mergeWithBackend({
        ctx,
        backendModel: backendGame,
        frontendModel: initial[0],
        sendToBackend: (msg) => sendToBackend({ t: 'game', c: msg }),
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
      ...frontendModel,
      games: gamesNew[0],
      rooms: backendModel.rooms,
      users: backendModel.users,
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
  ctx,
  $send,
  model,
  roomId,
}: {
  model: Model;
  ctx: Ctx;
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
  ctx: Ctx;
  $send: (m: Msg) => void;
}) => {
  if (
    model.requests.list?.type === 'Loading' ||
    model.requests.create?.type === 'Loading' ||
    model.requests.join?.type === 'Loading'
  ) {
    return (
      <FillBox sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </FillBox>
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

  return <ViewRoom room={room} ctx={ctx} $send={$send} model={model} />;
};

export const ViewRoomNotFound = ({ ctx }: { ctx: Ctx }) => {
  return (
    <FillBox
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: 1 }}>
        Room not found
      </Typography>
      <Button
        onClick={() => ctx.$push(['room-list'])}
        size="large"
        variant="contained"
        startIcon={<Icons.ChevronLeft />}
      >
        Go Back
      </Button>
    </FillBox>
  );
};

export const ViewPageRoomList = ({
  ctx,
  $send,
  model,
}: {
  model: Model;
  ctx: Ctx;
  $send: (m: Msg) => void;
}) => {
  const user = model.users[ctx.currentUserId];
  const currentRoom = user ? model.rooms[user.roomId] : undefined;
  const rooms = Object.values(model.rooms);

  if (model.requests.list?.type === 'Loading') {
    return (
      <FillBox>
        <Header title={'Rooms'} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      </FillBox>
    );
  }

  return (
    <FillBox>
      <Header title={'Rooms'} />
      {rooms.length === 0 && (
        <ViewEmptyState
          title="No active rooms"
          renderIcon={({ sx }) => <Icons.SportsEsports sx={sx} />}
        />
      )}
      {rooms.length > 0 && (
        <Box sx={{ overflowY: 'scroll', pb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              paddingX: 2,
              // paddingTop: 3,
            }}
          >
            {rooms.map((room) => {
              const host = ctx.profiles[room.hostId];
              const users = Object.values(model.users)
                .filter((user) => user.roomId === room.roomId)
                .flatMap((user) => {
                  const profile = ctx.profiles[user.userId];
                  if (profile) {
                    return [profile];
                  }
                  return [];
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
                    ctx.$push(['room', room.roomId]);
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      <Box sx={{ flex: 1 }} />

      {!currentRoom && (
        <div className="w-full p-4">
          <button
            className="btn btn-primary w-full"
            onClick={() => $send({ t: 'create', roomId: RoomId.generate() })}
          >
            Create Room
          </button>
        </div>
      )}
    </FillBox>
  );
};

const ViewRoomCard = ({
  users,
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
  const theme = useTheme();
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        background: theme.palette.primary.main,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        color: '#fff',
        overflow: 'hidden',
        textAlign: 'start',
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography sx={{ fontWeight: 900 }}>LIVE</Typography>
        {isCurrentRoom && (
          <>
            <Typography>•</Typography>
            <Typography sx={{ fontStyle: 'italic' }}>Current Room</Typography>
          </>
        )}
      </Box>

      <Box sx={{ px: 2, pb: 2, width: '100%', overflow: 'hidden' }}>
        {gameName && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              mt: 2,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                border: '2px solid',
                borderRadius: '3px',
                marginRight: 1,
              }}
            >
              {viewCoverArt(gameName)}
            </Box>

            <Typography variant="h4">{gameNameToString(gameName)}</Typography>
          </Box>
        )}

        <Box
          sx={{
            width: '100%',
            mt: 2,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <AvatarGroup
            sx={{
              marginRight: 1,
            }}
          >
            {users.slice(0, 3).map((user) => (
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                }}
                style={{
                  borderColor: theme.palette.primary.main,
                }}
                key={user.avatarUrl}
                src={user.avatarUrl}
              />
            ))}
          </AvatarGroup>
          <Typography variant="h6">{users.length} in room</Typography>
        </Box>

        <Typography variant="subtitle2" noWrap sx={{ width: '100%' }}>
          {formatUsernames(users.map((user) => user.username))}
        </Typography>
      </Box>

      <Box
        sx={{
          background: theme.palette.primary.dark,
          width: '100%',
          padding: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          <Avatar
            sx={{ width: '1.25rem', height: '1.25rem', marginRight: 1 }}
            src={host.avatarUrl}
          />
          <Typography noWrap>{host.username}</Typography>
          <Chip
            sx={{ ml: 1 }}
            color="primary"
            label="Host"
            variant="filled"
            size="small"
          />
        </Box>
      </Box>
    </ButtonBase>
  );
};

const formatUsername = (username: string) => {
  if (username.length > 12) {
    return username.slice(0, 12) + '...';
  }
  return username;
};

const formatUsernames = (usernames: string[]) => {
  const formatted = usernames.map(formatUsername);
  if (formatted.length > 3) {
    return `${formatted.slice(0, 3).join(', ')} & ${formatted.length - 3} more`;
  }
  return formatted.join(', ');
};

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -4,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const ViewRoom = ({
  ctx,
  model,
  $send,
  room,
}: {
  room: { roomId: RoomId; hostId: UserId };
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const game = model.games[room.roomId];
  return (
    <FillBox>
      <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center' }}>
        <ActionButton
          sx={{ width: 80 }}
          icon={<Icons.ChevronLeft />}
          label="Back"
          onClick={() => {
            ctx.$push(['room-list']);
          }}
        />
        <ActionButton
          sx={{ width: 72 }}
          icon={
            // <Icons.People />
            <StyledBadge
              badgeContent={toRoomUsers(room.roomId, model).length}
              color="primary"
            >
              <Icons.Groups />
            </StyledBadge>
          }
          label={`People`}
          onClick={() => {
            $send({ t: 'modal-open', c: 'users' });
          }}
        />
        <Box sx={{ flex: 1 }}></Box>

        <Box sx={{ pr: 2 }}>
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={() => {
              if (room.hostId === ctx.currentUserId) {
                $send({ t: 'destroy', userId: ctx.currentUserId });
              } else {
                $send({ t: 'leave', userId: ctx.currentUserId });
              }
            }}
          >
            {room.hostId === ctx.currentUserId ? 'End' : 'Leave'}
          </Button>
        </Box>
      </Paper>

      <Divider />

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
    </FillBox>
  );
};

export const ViewNotInGame = ({
  room,
  ctx,
  $send,
}: {
  model: Model;
  room: FrontendRoom;
  ctx: Ctx;
  $send: (m: Msg) => void;
}) => {
  if (room.hostId !== ctx.currentUserId) {
    return (
      <FillBox>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icons.SportsEsports
            sx={{
              width: 72,
              height: 72,
              color: 'text.secondary',
            }}
          />
          <Typography variant="h6" color="text.secondary">
            No game selected
          </Typography>
        </Box>
      </FillBox>
    );
  }

  return (
    <FillBox>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 1,
          p: 2,
        }}
      >
        {gameNameList.map((gameName) => (
          <CardActionArea
            key={gameName}
            disabled={room.hostId !== ctx.currentUserId}
            onClick={() => $send({ t: 'input-game', gameName })}
          >
            <ViewGameArtCard gameName={gameName} />
          </CardActionArea>
        ))}
      </Box>
    </FillBox>
  );
};

export const ViewNotInRoom = ({
  model,
  ctx,
  room,
  $send,
}: {
  room: { roomId: RoomId; hostId: UserId };
  ctx: Ctx;
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
      <Header
        left={<HeaderBackButton onClick={() => ctx.$push(['room-list'])} />}
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
          loading={model.requests['join']?.type === 'Loading'}
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
  ctx: Ctx;
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
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const usersInRoom = toRoomUsers(room.roomId, model);
  const userCount = usersInRoom.length;

  return (
    <FillBox>
      <Header
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

export const ViewBar = ({
  ctx,
  model,
  $send,
}: {
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const theme = useTheme();

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
    <Box
      key={room.roomId}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        borderTop: `3px solid ${theme.palette.primary.main}`,
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <ButtonBase
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
        onClick={() => ctx.$push(['room', room.roomId])}
      >
        <Box sx={{ p: 1, mr: 1 }}>
          {!game && (
            <Avatar
              src={hostProfile?.avatarUrl ?? ''}
              variant="rounded"
              sx={{ width: 48, height: 48 }}
            />
          )}

          {game && (
            <Box
              sx={{
                borderRadius: 1,
                overflow: 'hidden',
                width: 48,
                height: 48,
              }}
            >
              {viewCoverArt(game.t)}
            </Box>
          )}
        </Box>

        <Box sx={{ overflow: 'hidden', flex: 1 }}>
          <Typography noWrap align="left" color="primary.main">
            {hostProfile ? `${hostProfile.username}'s room` : '...'}
          </Typography>
          <Typography
            noWrap
            align="left"
            color="text.secondary"
            variant="subtitle2"
          >
            {userCount} in room
          </Typography>
        </Box>
      </ButtonBase>

      <IconButton
        onClick={() => {
          if (ctx.currentUserId === room.hostId) {
            $send({ t: 'destroy', userId: ctx.currentUserId });
            return;
          }
          $send({ t: 'leave', userId: ctx.currentUserId });
        }}
        sx={{ marginRight: 1 }}
      >
        <Icons.Close />
      </IconButton>
    </Box>
  );
};
