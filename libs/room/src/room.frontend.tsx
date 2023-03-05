import { Cmd, exhaustive, p, RemoteData, Sub } from '@gamezilla/core';
import { ProfileStore } from '@gamezilla/profile';
import { Alerts, Ctx, RoomId, Route, UserId } from '@gamezilla/shared';
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
  Sx,
  Toolbar,
  Typography,
  useTheme,
  ViewEmptyState,
} from '@gamezilla/shared/ui';
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

export const init: [Model, Cmd<Msg>] = [
  {
    games: {},
    rooms: {},
    users: {},
    requests: {},
    modal: { type: 'none' },
  },
  Cmd.None,
];

//
//
//
// Msg
//
//
//

export type Msg = FrontendMsg;

export type Action = ['room', ['Msg', Msg]];

type OutAction = Alerts.Action<Msg> | ProfileStore.Action | Route.Action;

//
//
//
// Update
//
//
//

type Update = (input: {
  ctx: Ctx;
  sendToBackend: (msg: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}) => { model: Model; cmd?: Cmd<Msg> };

export const update: Update = (input) => {
  const updated = update_(input);

  return updated;
};

export const update_: Update = ({ ctx, sendToBackend, msg, model }) => {
  switch (msg[0]) {
    case 'clicked-room': {
      return { model, cmd: Route.push(['room', { roomId: msg[1].roomId }]) };
    }

    case 'modal-closed': {
      return {
        model: {
          ...model,
          modal: { type: 'none' },
        },
      };
    }

    case 'clicked-user': {
      return {
        model: {
          ...model,
          modal: { type: 'user-preview', userId: msg[1].userId },
        },
        // cmd: Route.push(['profile', { userId: msg[1].userId }])
      };
    }

    case 'room-destroy': {
      return {
        model: {
          ...model,
          requests: {
            ...model.requests,
            [msg[0]]: RemoteData.Loading,
          },
        },
        cmd: sendToBackend(msg),
      };
    }

    case 'room-create':
    case 'room-join':
    case 'room-leave':
    case 'change-host':
    case 'input-game': {
      const routeCmd =
        msg[0] === 'room-create'
          ? Route.push(['room-game', { roomId: msg[1].roomId }])
          : Cmd.None;

      return {
        model: {
          ...model,
          requests: {
            ...model.requests,
            [msg[0]]: RemoteData.Loading,
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

      const game = model.games[user.roomId];

      if (!game) {
        return { model };
      }

      const gameMsg = msg[1];

      const [gameNew, gameCmd] = Game.update(
        {
          ctx,
          sendToBackend: (msg) => sendToBackend(['game', msg]),
        },
        gameMsg,
        game
      );

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
          Cmd.map((msg): Msg => ['game', msg])
        ),
      };
    }

    case 'room-leave-then-join': {
      return { model, cmd: sendToBackend(msg) };
    }

    case 'room-end-then-join': {
      return { model, cmd: sendToBackend(msg) };
    }

    default:
      return exhaustive(msg[0]);
  }
};

export const updateFromBackend = (
  {
    ctx,
    sendToBackend,
  }: {
    ctx: Ctx;
    sendToBackend: (msg: ToBackend) => Cmd;
  },
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'sync': {
      const userIds = Object.values(msg[1].users).map((user) => user.userId);

      const actions: OutAction[] = [['profile', ['find-many', { userIds }]]];

      const merged = mergeWithBackendModel({
        ctx,
        backendModel: msg[1],
        frontendModel: model,
        sendToBackend,
      });

      return [merged[0], merged[1], actions];
    }

    case 'game': {
      const user = model.users[ctx.currentUserId];

      if (!user) {
        return [model, Cmd.None, []];
      }

      const game = model.games[user.roomId];

      if (!game) {
        return [model, Cmd.None, []];
      }

      const gameMsg = msg[1];

      const [gameNew, gameCmd, actions] = Game.updateFromBackend(
        {
          ctx,
          sendToBackend: (msg) => sendToBackend(['game', msg]),
        },
        gameMsg,
        game
      );

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [user.roomId]: gameNew,
        },
      };

      return [
        modelNew,
        p(
          gameCmd,
          Cmd.map((msg) => ['game', msg])
        ),
        actions,
      ];
    }

    case 'room-create':
    case 'input-game':
    case 'change-host': {
      return updateResponse({ ctx, sendToBackend }, msg, model);
    }

    case 'room-destroy': {
      const handled = updateResponse({ ctx, sendToBackend }, msg, model);

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
        msg[2].type === 'Ok'
          ? [
              [
                'alerts',
                {
                  message: toRoomEndMessage({
                    ctx,
                    hostId: msg[1].userId,
                  }),
                  tag: 'Snack',
                },
              ],
            ]
          : [];

      return [handled[0], handled[1], [...handled[2], ...alertActions]];
    }

    case 'room-leave': {
      const handled = updateResponse({ ctx, sendToBackend }, msg, model);

      if (msg[2].type === 'Err') {
        return handled;
      }

      const alertActions: OutAction[] =
        msg[1].userId !== ctx.currentUserId
          ? [
              [
                'alerts',
                {
                  tag: 'Snack',
                  message: toRoomLeaveMessage({
                    userId: msg[1].userId,
                    ctx,
                  }),
                },
              ],
            ]
          : [];

      return [handled[0], handled[1], [...handled[2], ...alertActions]];
    }

    case 'room-join': {
      const handled = updateResponse({ ctx, sendToBackend }, msg, model);

      if (msg[2].type === 'Err') {
        const currentRoomId = model.users[ctx.currentUserId]?.roomId;
        const currentRoom = currentRoomId
          ? model.rooms[currentRoomId]
          : undefined;

        const alertActions: Alerts.Action<Msg>[] =
          msg[2].error === 'already_in_room' &&
          currentRoomId !== msg[1].roomId &&
          msg[1].userId === ctx.currentUserId
            ? ctx.currentUserId === currentRoom?.hostId
              ? [
                  [
                    'alerts',
                    {
                      title: 'End your current room to join this room?',
                      tag: 'Conformation',
                      onConfirm: ['room-end-then-join', msg[1]],
                    },
                  ],
                ]
              : [
                  [
                    'alerts',
                    {
                      title: 'Leave your current room then join this room?',
                      tag: 'Conformation',
                      onConfirm: ['room-leave-then-join', msg[1]],
                    },
                  ],
                ]
            : [];

        return [handled[0], handled[1], [...handled[2], ...alertActions]];
      }

      const routeActions: OutAction[] =
        msg[1].userId === ctx.currentUserId
          ? [['route', ['Replace', ['room-game', { roomId: msg[1].roomId }]]]]
          : [];

      const alertActions: OutAction[] =
        msg[1].userId !== ctx.currentUserId
          ? [
              [
                'alerts',
                {
                  tag: 'Snack',
                  message: toRoomJoinMessage({
                    userId: msg[1].userId,
                    ctx,
                  }),
                },
              ],
            ]
          : [];

      return [
        handled[0],
        handled[1],
        [...handled[2], ...routeActions, ...alertActions],
      ];
    }
  }
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

const updateResponse = (
  { ctx, sendToBackend }: { ctx: Ctx; sendToBackend: (msg: ToBackend) => Cmd },
  msg: Res,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  if (msg[2].type === 'Err') {
    return [
      {
        ...model,
        requests: { ...model.requests, [msg[0]]: RemoteData.Err(msg[2].error) },
      },
      Cmd.None,
      [],
    ];
  }

  const merged = mergeWithBackendModel({
    ctx,
    frontendModel: model,
    backendModel: msg[2].value,
    sendToBackend,
  });

  const userIds = Object.values(merged[0].users).map((user) => user.userId);

  const storeActions: OutAction[] = [['profile', ['find-many', { userIds }]]];

  return [
    {
      ...merged[0],
      requests: { ...merged[0].requests, [msg[0]]: RemoteData.Ok('none') },
    },
    merged[1],
    storeActions,
  ];
};

const mergeWithBackendModel = ({
  ctx,
  frontendModel,
  backendModel,
  sendToBackend,
}: {
  ctx: Ctx;
  sendToBackend: (msg: ToBackend) => Cmd;
  frontendModel: FrontendModel;
  backendModel: BackendModel;
}): [FrontendModel, Cmd<FrontendMsg>] => {
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
          sendToBackend: (msg) => sendToBackend(['game', msg]),
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
              Cmd.map((m): Msg => ['game', m])
            ),
          ]),
        ];
      }

      const initial = Game.init({
        gameName: backendGame.type,
        ctx,
      });

      const merged = Game.mergeWithBackend({
        ctx,
        backendModel: backendGame,
        frontendModel: initial[0],
        sendToBackend: (msg) => sendToBackend(['game', msg]),
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
            Cmd.map((msg) => ['game', msg])
          ),
          p(
            merged[1],
            Cmd.map((msg) => ['game', msg])
          ),
        ]),
      ];
    },
    [{}, Cmd.None]
  );

  return [
    {
      ...frontendModel,
      games: gamesNew[0],
      rooms: backendModel.rooms,
      users: backendModel.users,
    },
    gamesNew[1],
  ];
};

export const runAction = ({
  ctx,
  sendToBackend,
  model,
  action,
}: {
  ctx: Ctx;
  sendToBackend: (msg: ToBackend) => Cmd;
  action: Action;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (action[1][0]) {
    case 'Msg': {
      const msg = action[1][1];
      return update({ sendToBackend, ctx, msg, model });
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
    Sub.map((msg) => ['game', msg])
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

type RoomRoute = 'room' | 'room-game';

export const View = ({
  ctx,
  $send,
  model,
  route,
  roomId,
}: {
  route: RoomRoute;
  model: Model;
  ctx: Ctx;
  $send: (m: Msg) => void;
  roomId: RoomId;
}) => {
  return (
    <>
      <ViewPage
        roomId={roomId}
        ctx={ctx}
        $send={$send}
        model={model}
        route={route}
      />
      <Drawer
        open={model.modal.type === 'user-preview'}
        onClose={() => $send(['modal-closed'])}
        anchor="bottom"
        PaperProps={{
          sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: 'xs',
          },
          variant: 'outlined',
        }}
      >
        {model.modal.type === 'user-preview' ? (
          <>
            <ButtonBase
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 2,
              }}
              onClick={() => {
                if (model.modal.type === 'user-preview') {
                  ctx.$push(['profile', { userId: model.modal.userId }]);
                }
              }}
            >
              <Avatar
                src={ctx.profiles[model.modal.userId]?.avatarUrl}
                sx={{ width: 80, height: 80, marginBottom: 1 }}
              />
              <Typography variant="h6">
                @{ctx.profiles[model.modal.userId]?.username ?? '...'}
              </Typography>
            </ButtonBase>
            <Box sx={{ px: 2, paddingBottom: 4, width: '100%' }}>
              <Button variant="outlined" fullWidth startIcon={<Icons.Send />}>
                Direct Message
              </Button>
            </Box>
          </>
        ) : (
          <CircularProgress />
        )}
      </Drawer>
    </>
  );
};

const ViewPage = ({
  ctx,
  $send,
  model,
  route,
  roomId,
}: {
  roomId: RoomId;
  route: RoomRoute;
  model: Model;
  ctx: Ctx;
  $send: (m: Msg) => void;
}) => {
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

  switch (route) {
    case 'room': {
      return <ViewPageRoom room={room} ctx={ctx} $send={$send} model={model} />;
    }

    case 'room-game': {
      return <ViewPageGame room={room} ctx={ctx} $send={$send} model={model} />;
    }
  }
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
              const gameName = model.games[room.roomId]?.type;
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
                    ctx.$push(['room-game', { roomId: room.roomId }]);
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      <Box sx={{ flex: 1 }} />

      {!(
        currentRoom !== undefined ||
        model.requests['room-create'] === RemoteData.Loading
      ) && (
        <Box sx={{ width: '100%', px: 2, py: 2 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => {
              $send([
                'room-create',
                { userId: ctx.currentUserId, roomId: RoomId.generate() },
              ]);
            }}
          >
            Create Room
          </Button>
        </Box>
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

const ViewPageGame = ({
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ActionButton
          icon={<Icons.ChevronLeft />}
          label="Back"
          onClick={() => {
            ctx.$push(['room-list']);
          }}
        />
        <ActionButton
          icon={<Icons.People />}
          label="People"
          onClick={() => {
            ctx.$push(['room', { roomId: room.roomId }]);
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
                $send(['room-destroy', { userId: ctx.currentUserId }]);
              } else {
                $send(['room-leave', { userId: ctx.currentUserId }]);
              }
            }}
          >
            {room.hostId === ctx.currentUserId ? 'End' : 'Leave'}
          </Button>
        </Box>
      </Box>

      <Divider />

      {game ? (
        <Game.View
          gameRoomCtx={{
            hostId: room.hostId,
            onQuit: () =>
              $send([
                'input-game',
                { userId: ctx.currentUserId, gameName: undefined },
              ]),
          }}
          ctx={ctx}
          $send={(msg) => $send(['game', msg])}
          model={game}
        />
      ) : (
        <ViewNotInGame model={model} ctx={ctx} room={room} $send={$send} />
      )}
    </FillBox>
  );
};

const ViewRoomUserCard = ({
  ctx,
  userId,
  isHost,
  sx,
}: {
  isHost: boolean;
  userId: UserId;
  ctx: Ctx;
  sx?: Sx;
}) => {
  const profile = ctx.profiles[userId];
  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Avatar
        sx={{ width: '100%', flex: 1, aspectRatio: '1' }}
        src={profile?.avatarUrl ?? '...'}
      />
      <Typography
        color="text.primary"
        align="center"
        variant="subtitle2"
        sx={{ width: '100%', padding: 1 }}
        noWrap
      >
        {profile?.username ?? '...'} {isHost && ' (host)'}
      </Typography>
    </Paper>
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
            onClick={() =>
              $send(['input-game', { gameName, userId: ctx.currentUserId }])
            }
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
              viewCoverArt(game.type)
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
            {game ? gameNameToString(game.type) : '...'}
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
          <ButtonBase
            onClick={() => $send(['clicked-user', { userId: room.hostId }])}
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '100%',
              overflow: 'hidden',
            }}
          >
            <Avatar sx={{ mr: 1 }} src={host?.avatarUrl ?? ''} />
            <Typography align="left" noWrap>
              {host?.username ?? '...'}
            </Typography>
            <Chip sx={{ ml: 1 }} label="Host" />
          </ButtonBase>

          {usersInRoom.map((user) => {
            if (user.userId === room.hostId) {
              return null;
            }
            return (
              <ButtonBase
                onClick={() => $send(['clicked-user', { userId: user.userId }])}
                key={user.userId}
                sx={{
                  px: 2,
                  py: 1,
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Avatar
                  sx={{ mr: 1 }}
                  src={ctx.profiles[user.userId]?.avatarUrl ?? ''}
                />
                <Typography align="left" sx={{ flex: 1 }}>
                  {ctx.profiles[user.userId]?.username ?? '...'}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, width: '100%', padding: 2 }}>
        <Button
          fullWidth
          endIcon={<Icons.ChevronRight />}
          variant="contained"
          loading={model.requests['room-join']?.type === 'Loading'}
          onClick={() =>
            $send([
              'room-join',
              { userId: ctx.currentUserId, roomId: room.roomId },
            ])
          }
        >
          Join Room
        </Button>
      </Box>
    </FillBox>
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

const ViewPageRoom = ({
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

  return (
    <FillBox>
      <Typography
        variant="h4"
        sx={{ paddingX: 2, paddingTop: 2, width: '100%' }}
        noWrap
      >
        {ctx.profiles[room.hostId]?.username ?? '...'}'s room
      </Typography>

      <Box
        sx={{
          display: 'flex',
          paddingY: 1,
          paddingX: 2,
        }}
      >
        {usersInRoom.map((user) => (
          <Box
            key={user.userId}
            onClick={() => $send(['clicked-user', user])}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: `${(1 / 3) * 100}%`,
              padding: 1,
              overflowX: 'hidden',
            }}
          >
            <Avatar src={ctx.profiles[user.userId]?.avatarUrl} />
            <Typography
              align="center"
              sx={{ marginBottom: -1 / 2, width: '100%' }}
              noWrap
            >
              {ctx.profiles[user.userId]?.username ?? '...'}
            </Typography>
            {user.userId === room.hostId ? (
              <Typography variant="subtitle2" color="text.secondary">
                Host
              </Typography>
            ) : (
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ opacity: 0 }}
              >
                Guest
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ flex: 1 }} />

      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => ctx.$push(['room-game', { roomId: room.roomId }])}
          startIcon={<Icons.ChevronLeft />}
        >
          Back
        </Button>
        {ctx.currentUserId === room.hostId ? (
          <Button
            variant="outlined"
            fullWidth
            color="error"
            startIcon={<Icons.Close />}
            onClick={() =>
              $send(['room-destroy', { userId: ctx.currentUserId }])
            }
          >
            End Room
          </Button>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Icons.ExitToApp />}
            onClick={() => $send(['room-leave', { userId: ctx.currentUserId }])}
          >
            Leave Room
          </Button>
        )}
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
        onClick={() => ctx.$push(['room-game', { roomId: room.roomId }])}
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
              {viewCoverArt(game.type)}
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
            $send(['room-destroy', { userId: ctx.currentUserId }]);
            return;
          }
          $send(['room-leave', { userId: ctx.currentUserId }]);
        }}
        sx={{ marginRight: 1 }}
      >
        <Icons.Close />
      </IconButton>
    </Box>
  );
};
