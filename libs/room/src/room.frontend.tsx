import { Cmd, exhaustive, p, RemoteData, Sub } from '@gamezilla/core';
import { ProfileStore } from '@gamezilla/profile';
import { Alerts, Ctx, RoomId, Route, UserId } from '@gamezilla/shared';
import {
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
  IconButton,
  Icons,
  Paper,
  Sx,
  Toolbar,
  Typography,
  useTheme,
  ViewEmptyState,
  ViewLoadingState,
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
        msg[0] === 'room-join' || msg[0] === 'room-create'
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
  switch (route) {
    case 'room': {
      return (
        <ViewPageRoom roomId={roomId} ctx={ctx} $send={$send} model={model} />
      );
    }

    case 'room-game': {
      return (
        <ViewPageGame roomId={roomId} ctx={ctx} $send={$send} model={model} />
      );
    }
  }
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
      <Header title={'Game'} />
      <Box sx={{ paddingX: 2 }}>
        <Button
          fullWidth
          variant="contained"
          loading={model.requests['room-create'] === RemoteData.Loading}
          disabled={currentRoom !== undefined}
          startIcon={<Icons.Add />}
          onClick={() => {
            $send([
              'room-create',
              { userId: ctx.currentUserId, roomId: RoomId.generate() },
            ]);
          }}
        >
          Create New Game
        </Button>
      </Box>

      {rooms.length === 0 && (
        <ViewEmptyState
          title="No active games"
          renderIcon={({ sx }) => <Icons.SportsEsports sx={sx} />}
        />
      )}

      {rooms.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            paddingX: 2,
            paddingTop: 3,
          }}
        >
          {rooms.map((room) => {
            const host = ctx.profiles[room.hostId];
            const title = host ? `${host.username}'s room` : '...';
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
                key={room.roomId}
                isCurrentRoom={currentRoomId === room.roomId}
                title={title}
                users={users}
                gameName={gameName}
                onClick={() => {
                  $send([
                    'room-join',
                    { userId: ctx.currentUserId, roomId: room.roomId },
                  ]);
                }}
              />
            );
          })}
        </Box>
      )}
    </FillBox>
  );
};

const ViewRoomCard = ({
  title,
  users,
  gameName,
  onClick,
  isCurrentRoom,
}: {
  gameName?: GameName;
  title: string;
  users: { avatarUrl: string }[];
  onClick: () => void;
  isCurrentRoom?: boolean;
}) => {
  const theme = useTheme();
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        background: theme.palette.primary.dark,
        borderRadius: '8px',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'start',
        color: '#fff',
        gap: 3,
      }}
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}
      >
        {isCurrentRoom && (
          <Chip
            size="small"
            color="primary"
            label="Current Room"
            sx={{ marginBottom: 0.5 }}
          />
        )}
        <Typography variant="h4">{title}</Typography>
      </Box>
      {gameName && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              border: '2px solid',
              borderRadius: '4px',
              marginRight: 1,
            }}
          >
            {viewCoverArt(gameName)}
          </Box>

          <Typography variant="h6">{gameNameToString(gameName)}</Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <AvatarGroup sx={{ marginRight: 1 }}>
          {users.map((user) => (
            <Avatar key={user.avatarUrl} src={user.avatarUrl} />
          ))}
        </AvatarGroup>
        <Typography variant="h6">{users.length} in room</Typography>
      </Box>
    </ButtonBase>
  );
};

const ViewPageGame = ({
  ctx,
  model,
  $send,
}: {
  roomId: RoomId;
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const user = model.users[ctx.currentUserId];

  if (!user) {
    return <ViewNotInRoom ctx={ctx} model={model} $send={$send} />;
  }

  const room = model.rooms[user.roomId];

  if (!room) {
    return <ViewNotInRoom ctx={ctx} model={model} $send={$send} />;
  }

  const game = model.games[room.roomId];

  const usersInRoom = Object.values(model.users).filter(
    (user) => user.roomId === room.roomId
  );

  return (
    <FillBox>
      <Toolbar
        variant="dense"
        sx={{ paddingX: 2, justifyContent: 'space-between' }}
      >
        <Button
          startIcon={<Icons.Home />}
          size="small"
          onClick={() => ctx.$push(['room-list'])}
        >
          Home
        </Button>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
          {game ? gameNameToString(game.type) : 'Game'}
        </Typography>
        <Badge
          badgeContent={usersInRoom.length > 1 ? usersInRoom.length : undefined}
          color="secondary"
        >
          <Button
            startIcon={<Icons.Group />}
            size="small"
            onClick={() => $send(['clicked-room', { roomId: room.roomId }])}
          >
            Room
          </Button>
        </Badge>
      </Toolbar>

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
  model,
}: {
  model: Model;
  room: FrontendRoom;
  ctx: Ctx;
  $send: (m: Msg) => void;
}) => {
  const users = toRoomUsers(room.roomId, model);

  if (room.hostId !== ctx.currentUserId) {
    return (
      <FillBox>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            gap: 3,
            p: 3,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {users.map((user) => {
            return (
              <CardActionArea
                key={user.userId}
                onClick={() => $send(['clicked-user', user])}
              >
                <ViewRoomUserCard
                  isHost={room.hostId === user.userId}
                  userId={user.userId}
                  ctx={ctx}
                  sx={{ width: '50%' }}
                />
              </CardActionArea>
            );
          })}
        </Box>

        <Box sx={{ flex: 1 }} />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={
              <Icons.ExitToApp
                sx={{
                  transform: 'rotate(180deg)',
                }}
              />
            }
            color="error"
            onClick={() =>
              $send([
                'room-leave',
                {
                  userId: ctx.currentUserId,
                },
              ])
            }
          >
            Leave
          </Button>
        </Box>
      </FillBox>
    );
  }

  return (
    <FillBox>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          gap: 2,
          p: 2,
          alignItems: 'center',
          // justifyContent: 'center',
        }}
      >
        {users.map((user) => {
          return (
            <CardActionArea
              key={user.userId}
              sx={{ width: 72 }}
              onClick={() => $send(['clicked-user', user])}
            >
              <ViewRoomUserCard
                isHost={room.hostId === user.userId}
                userId={user.userId}
                ctx={ctx}
                sx={{ width: '100%' }}
              />
            </CardActionArea>
          );
        })}
      </Box>

      <Divider />

      <Box
        sx={{
          px: 1,
          pt: 1,
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          overflowY: 'scroll',
          flex: 1,
        }}
      >
        {gameNameList.map((gameName) => (
          <Box key={gameName} sx={{ width: '33.33%', p: 1 }}>
            <CardActionArea
              disabled={room.hostId !== ctx.currentUserId}
              onClick={() =>
                $send(['input-game', { gameName, userId: ctx.currentUserId }])
              }
            >
              <ViewGameArtCard gameName={gameName} />
            </CardActionArea>
          </Box>
        ))}
      </Box>

      {/* <Box sx={{ flex: 1 }}></Box> */}

      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button
          variant="outlined"
          color="error"
          startIcon={<Icons.Close />}
          onClick={() => $send(['room-destroy', { userId: ctx.currentUserId }])}
        >
          End
        </Button>
      </Box>
    </FillBox>
  );
};

export const ViewNotInRoom = ({
  model,
  ctx,
}: {
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const isCreating = model.requests['room-create']?.type === 'Loading';
  const isJoining = model.requests['room-join']?.type === 'Loading';

  return (
    <FillBox>
      <Header title="Game" />
      {isJoining ? (
        <ViewLoadingState title="Joining game..." />
      ) : isCreating ? (
        <ViewLoadingState title="Creating game..." />
      ) : (
        <Box
          sx={{
            p: 2,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ marginBottom: 2 }} variant="h6">
            Not in a room.
          </Typography>
          <Button
            startIcon={<Icons.ChevronLeft />}
            variant="contained"
            onClick={() => ctx.$push(['room-list'])}
          >
            Back Home
          </Button>
        </Box>
      )}
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
}: {
  roomId: RoomId;
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const user = model.users[ctx.currentUserId];

  if (!user) {
    return <ViewNotInRoom $send={$send} ctx={ctx} model={model} />;
  }

  const room = model.rooms[user.roomId];

  if (!room) {
    return <ViewNotInRoom $send={$send} ctx={ctx} model={model} />;
  }

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
      }}
    >
      <ButtonBase
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={() => ctx.$push(['room-game', { roomId: room.roomId }])}
      >
        {!game && (
          <Avatar
            src={hostProfile?.avatarUrl ?? ''}
            variant="square"
            sx={{ width: 48, height: 48, mr: 2 }}
          />
        )}

        {game && (
          <Box sx={{ width: 48, height: 48, mr: 2 }}>
            {viewCoverArt(game.type)}
          </Box>
        )}

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
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
