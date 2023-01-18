import { Alerts } from '@gamezilla/shared';
import { Cmd, exhaustive, p, RemoteData, Sub } from '@gamezilla/core';
import { RoomId, UserId } from '@gamezilla/shared';
import { ProfileStore } from '@gamezilla/profile';
import { Ctx, Route } from '@gamezilla/shared';
import {
  AspectRatio,
  Avatar,
  Badge,
  Box,
  Button,
  ButtonBase,
  CardActionArea,
  Divider,
  FillBox,
  Header,
  Icons,
  Paper,
  Toolbar,
  Typography,
  ViewEmptyState,
  ViewLoadingState,
} from '@gamezilla/ui';
import { viewCoverArt } from './game';
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

export type Action = ['Room', ['Msg', Msg]];

type OutAction = Alerts.Action<Msg> | ProfileStore.Action | Route.Action;

//
//
//
// Update
//
//
//

export const update = (
  {
    ctx,
    sendToBackend,
  }: {
    ctx: Ctx;
    sendToBackend: (msg: ToBackend) => Cmd;
  },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'ClickedHome': {
      return [model, Route.push(['Home'])];
    }

    case 'ClickedRoom': {
      return [model, Route.push(['Room'])];
    }

    case 'ClickedUser': {
      return [model, Route.push(['Profile', { userId: msg[1].userId }])];
    }

    case 'ClickedBanner': {
      return [model, Route.push(['Game'])];
    }

    case 'RoomCreate':
    case 'RoomDestroy':
    case 'RoomJoin':
    case 'RoomLeave':
    case 'ChangeHost':
    case 'InputGame': {
      return [
        {
          ...model,
          requests: {
            ...model.requests,
            [msg[0]]: RemoteData.Loading,
          },
        },
        sendToBackend(msg),
      ];
    }

    case 'Game': {
      const user = model.users[ctx.currentUserId];

      if (!user) {
        return [model, Cmd.None];
      }

      const game = model.games[user.roomId];

      if (!game) {
        return [model, Cmd.None];
      }

      const gameMsg = msg[1];

      const [gameNew, gameCmd] = Game.update(
        {
          ctx,
          sendToBackend: (msg) => sendToBackend(['Game', msg]),
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
          Cmd.map((msg): Msg => ['Game', msg])
        ),
      ];
    }

    case 'RoomLeaveThenJoin': {
      return [model, sendToBackend(msg)];
    }

    case 'RoomEndThenJoin': {
      return [model, sendToBackend(msg)];
    }

    case 'ClickedRoomDestroy': {
      return [
        model,
        Cmd.batch([
          Route.push(['Home']),
          sendToBackend(['RoomDestroy', msg[1]]),
        ]),
      ];
    }

    case 'ClickedRoomLeave': {
      return [
        model,
        Cmd.batch([Route.push(['Home']), sendToBackend(['RoomLeave', msg[1]])]),
      ];
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
    case 'Sync': {
      const userIds = Object.values(msg[1].users).map((user) => user.userId);

      const actions: OutAction[] = [['Profile', ['FindMany', { userIds }]]];

      const merged = mergeWithBackendModel({
        backendModel: msg[1],
        frontendModel: model,
        sendToBackend,
      });

      return [merged[0], merged[1], actions];
    }

    case 'Game': {
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
          sendToBackend: (msg) => sendToBackend(['Game', msg]),
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
          Cmd.map((msg) => ['Game', msg])
        ),
        actions,
      ];
    }

    case 'InputGame':
    case 'ChangeHost':
    case 'RoomCreate': {
      return updateResponse({ sendToBackend }, msg, model);
    }

    case 'RoomDestroy': {
      const handled = updateResponse({ sendToBackend }, msg, model);

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
                'Alerts',
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

    case 'RoomLeave': {
      const handled = updateResponse({ sendToBackend }, msg, model);

      if (msg[2].type === 'Err') {
        return handled;
      }

      const alertActions: OutAction[] =
        msg[1].userId !== ctx.currentUserId
          ? [
              [
                'Alerts',
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

    case 'RoomJoin': {
      const handled = updateResponse({ sendToBackend }, msg, model);

      if (msg[2].type === 'Err') {
        const currentRoomId = model.users[ctx.currentUserId]?.roomId;
        const currentRoom = currentRoomId
          ? model.rooms[currentRoomId]
          : undefined;

        const alertActions: Alerts.Action<Msg>[] =
          msg[2].error === 'already_in_room' &&
          msg[1].userId === ctx.currentUserId
            ? ctx.currentUserId === currentRoom?.hostId
              ? [
                  [
                    'Alerts',
                    {
                      title: 'End your current room to join this room?',
                      tag: 'Conformation',
                      onConfirm: ['RoomEndThenJoin', msg[1]],
                    },
                  ],
                ]
              : [
                  [
                    'Alerts',
                    {
                      title: 'Leave your current room then join this room?',
                      tag: 'Conformation',
                      onConfirm: ['RoomLeaveThenJoin', msg[1]],
                    },
                  ],
                ]
            : [];

        return [handled[0], handled[1], [...handled[2], ...alertActions]];
      }

      const routeActions: OutAction[] =
        msg[1].userId === ctx.currentUserId
          ? [['Route', ['Replace', ['Game']]]]
          : [];

      const alertActions: OutAction[] =
        msg[1].userId !== ctx.currentUserId
          ? [
              [
                'Alerts',
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
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
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
    frontendModel: model,
    backendModel: msg[2].value,
    sendToBackend,
  });

  const userIds = Object.values(merged[0].users).map((user) => user.userId);

  const storeActions: OutAction[] = [['Profile', ['FindMany', { userIds }]]];

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
  frontendModel,
  backendModel,
  sendToBackend,
}: {
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
          backendModel: backendGame,
          frontendModel: frontendGame,
          sendToBackend: (msg) => sendToBackend(['Game', msg]),
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
              Cmd.map((m): Msg => ['Game', m])
            ),
          ]),
        ];
      }

      const initial = Game.init({
        gameName: backendGame[0],
      });

      const merged = Game.mergeWithBackend({
        backendModel: backendGame,
        frontendModel: initial[0],
        sendToBackend: (msg) => sendToBackend(['Game', msg]),
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
            Cmd.map((msg) => ['Game', msg])
          ),
          p(
            merged[1],
            Cmd.map((msg) => ['Game', msg])
          ),
        ]),
      ];
    },
    [{}, Cmd.None]
  );

  return [
    {
      requests: frontendModel.requests,
      games: gamesNew[0],
      rooms: backendModel.rooms,
      users: backendModel.users,
    },
    gamesNew[1],
  ];
};

export const runAction = (
  {
    ctx,
    sendToBackend,
  }: {
    ctx: Ctx;
    sendToBackend: (msg: ToBackend) => Cmd;
  },
  action: Action,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (action[1][0]) {
    case 'Msg': {
      const msg = action[1][1];
      return update({ sendToBackend, ctx }, msg, model);
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

export const subscriptions = (
  { currentUserId }: { currentUserId: UserId },
  model: Model
): Sub<Msg> => {
  const user = model.users[currentUserId];

  if (!user) {
    return Sub.None;
  }

  const game = model.games[user.roomId];

  if (!game) {
    return Sub.None;
  }

  return p(
    Game.subscriptions(`room/${user.roomId}`, game),
    Sub.map((msg) => ['Game', msg])
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

export const ViewPageGame = ({
  ctx,
  model,
  $send,
}: {
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
          onClick={() => $send(['ClickedHome'])}
        >
          Home
        </Button>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
          {game?.[0] ? Game.gameNameToString(game[0]) : 'Game'}
        </Typography>
        <Badge
          badgeContent={usersInRoom.length > 1 ? usersInRoom.length : undefined}
          color="secondary"
        >
          <Button
            startIcon={<Icons.Group />}
            size="small"
            onClick={() => $send(['ClickedRoom'])}
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
                'InputGame',
                { userId: ctx.currentUserId, gameName: undefined },
              ]),
          }}
          ctx={ctx}
          $send={(msg) => $send(['Game', msg])}
          model={game}
        />
      ) : (
        <ViewNotInGame ctx={ctx} room={room} $send={$send} />
      )}
    </FillBox>
  );
};

export const ViewNotInGame = ({
  room,
  ctx,
  $send,
}: {
  room: FrontendRoom;
  ctx: Ctx;
  $send: (m: Msg) => void;
}) => {
  if (room.hostId !== ctx.currentUserId) {
    return (
      <FillBox>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            px: 2,
          }}
        >
          <Avatar
            src={ctx.profiles[room.hostId]?.avatarUrl}
            sx={{ mb: 1, width: 100, height: 100 }}
          />
          <Typography color="text.primary" align="center">
            {ctx.profiles[room.hostId]?.username ?? '...'}
          </Typography>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Host
          </Typography>
          <Typography align="center">No game selected</Typography>
        </Box>
      </FillBox>
    );
  }

  return (
    <FillBox>
      <Box
        sx={{
          px: 1,
          pt: 1,
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}
      >
        {gameNameList.map((gameName) => (
          <Box key={gameName} sx={{ width: '33.33%', p: 1 }}>
            <CardActionArea
              disabled={room.hostId !== ctx.currentUserId}
              onClick={() =>
                $send(['InputGame', { gameName, userId: ctx.currentUserId }])
              }
            >
              <GameCard gameName={gameName} />
            </CardActionArea>
          </Box>
        ))}
      </Box>

      <Box sx={{ flex: 1 }} />
    </FillBox>
  );
};

export const ViewNotInRoom = ({
  ctx,
  model,
  $send,
}: {
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  if (model.requests.RoomCreate?.type === 'Loading') {
    return (
      <FillBox>
        <Header title="Game" />
        <ViewLoadingState title="Creating game..." />
      </FillBox>
    );
  }

  if (model.requests.RoomJoin?.type === 'Loading') {
    return (
      <FillBox>
        <Header title="Game" />
        <ViewLoadingState title="Joining game..." />
      </FillBox>
    );
  }

  return (
    <FillBox>
      <Header title="Game" />
      <ViewEmptyState
        actionIcon={<Icons.Add />}
        actionTitle="Create Game"
        onAction={() =>
          $send([
            'RoomCreate',
            { userId: ctx.currentUserId, roomId: RoomId.generate() },
          ])
        }
        renderIcon={(props) => <Icons.SportsEsportsOutlined {...props} />}
        title="Not in Game"
      />
      <Box sx={{ p: 2 }}>
        <Button
          startIcon={<Icons.ChevronLeft />}
          fullWidth
          variant="outlined"
          onClick={() => $send(['ClickedHome'])}
        >
          Go back home
        </Button>
      </Box>
    </FillBox>
  );
};

export const GameCard = ({ gameName }: { gameName: GameName }) => {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', width: '100%' }}>
      {viewCoverArt(gameName)}

      <Typography
        variant="subtitle2"
        noWrap
        sx={{ width: '100%', px: 1, py: 0.5 }}
      >
        {Game.gameNameToString(gameName)}
      </Typography>
    </Paper>
  );
};

export const ViewCreateRoomCallToAction = ({
  onClickCreate,
}: {
  onClickGame: (gameName: GameName) => void;
  onClickCreate: () => void;
}) => {
  return (
    <>
      <Typography variant="h3" sx={{ mb: 1, px: 2 }}>
        Start a Game
      </Typography>

      {/* <Box sx={{ display: 'flex', overflow: "scroll", gap: 2, mb: 2, snapScrollType: "x mandatory", px: 2 }}>
        {gameNameList.map(gameName => (
          <CardActionArea key={gameName} onClick={() => onClickGame(gameName)} sx={{ width: "100px", minWidth: "100px", }}>
            <Paper sx={{ overflow: "hidden", width: "100%" }}>
              <Game.CoverArt gameName={gameName} />
              <Typography variant="subtitle2" noWrap sx={{ width: "100%", px: 1 }}>
                {Game.gameNameToString(gameName)}
              </Typography>
            </Paper>
          </CardActionArea>
        ))}
      </Box> */}

      <Box sx={{ px: 2 }}>
        <Button fullWidth variant="contained" onClick={onClickCreate}>
          Create New Room
        </Button>
      </Box>
    </>
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

export const ViewPageRoom = ({
  model,
  $send,
  ctx,
}: {
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
            onClick={() => $send(['ClickedUser', user])}
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
        {ctx.currentUserId === room.hostId ? (
          <>
            <Button fullWidth>Change Game</Button>
            <Button
              fullWidth
              color="error"
              onClick={() =>
                $send(['ClickedRoomDestroy', { userId: ctx.currentUserId }])
              }
            >
              End Room
            </Button>
          </>
        ) : (
          <Button
            fullWidth
            color="error"
            onClick={() =>
              $send(['ClickedRoomLeave', { userId: ctx.currentUserId }])
            }
          >
            Leave Room
          </Button>
        )}
      </Box>
    </FillBox>
  );
};

export const ViewGameCard = ({
  gameName,
  onClick,
  disabled = false,
}: {
  gameName: GameName;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <AspectRatio aspectRatio={1}>
      <ButtonBase
        disabled={disabled}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          opacity: disabled ? 0.3 : 1,
          borderRadius: 2,
        }}
        onClick={onClick}
      >
        {viewCoverArt(gameName)}

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <Box
            sx={{
              width: '100%',
              padding: 1,
              paddingTop: 2,
              background: `linear-gradient(transparent, rgba(0, 0, 0, 0.6))`,
            }}
          >
            <Typography color="white" align="left" variant="h4">
              {Game.gameNameToString(gameName)}
            </Typography>
          </Box>
        </Box>
      </ButtonBase>
    </AspectRatio>
  );
};

//
//
//
// Banner
//
//
//

export const ViewBanner = ({
  currentUserId,
  route,
  model,
  $send,
  store,
}: {
  currentUserId: UserId;
  route: Route.Model;
  model: Model;
  $send: (msg: Msg) => void;
  store: ProfileStore.Model;
}) => {
  if (route[0] === 'Room' || route[0] === 'Game') {
    return null;
  }

  const user = model.users[currentUserId];

  if (!user) {
    return null;
  }

  const room = model.rooms[user.roomId];

  if (!room) {
    return null;
  }

  const game = model.games[room.roomId];

  const hostProfile = store.profiles[room.hostId];

  return (
    <>
      <ButtonBase
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={() => $send(['ClickedBanner'])}
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
            {viewCoverArt(game[0])}
          </Box>
        )}

        <Typography noWrap align="left" sx={{ flex: 1 }}>
          {hostProfile ? `${hostProfile.username}'s room` : '...'}
        </Typography>

        <Icons.ChevronRight sx={{ mx: 2 }} />
      </ButtonBase>
      <Divider />
    </>
  );
};

export const RoomGrid = ({
  ctx,
  model,
  onClick,
}: {
  ctx: Ctx;
  model: Model;
  onClick: ({ roomId }: { roomId: RoomId }) => void;
}) => {
  const rooms = Object.values(model.rooms).filter(
    (room) => room.roomId !== model.users[ctx.currentUserId]?.roomId
  );

  return (
    <Box sx={{ display: 'flex', mx: -1 }}>
      {rooms.map((room) => (
        <Box key={room.roomId} sx={{ width: '50%', p: 1 }}>
          <RoomCard
            roomId={room.roomId}
            hostId={room.hostId}
            gameName={model.games[room.roomId]?.[0]}
            ctx={ctx}
            gameRoom={model}
            onClick={() => onClick(room)}
          />
        </Box>
      ))}
    </Box>
  );
};

export const RoomCard = ({
  roomId,
  hostId,
  gameName,
  ctx,
  gameRoom,
  onClick,
}: {
  roomId: RoomId;
  hostId: UserId;
  gameName?: GameName;
  ctx: Ctx;
  gameRoom: Model;
  onClick: () => void;
}) => {
  const hostProfile = ctx.profiles[hostId];
  const roomCount = Object.values(gameRoom.users).filter(
    (user) => user.roomId === roomId
  ).length;
  return (
    <CardActionArea onClick={onClick}>
      <Paper sx={{ overflow: 'hidden', height: '100%' }}>
        <AspectRatio aspectRatio={Math.pow(3 / 4, 3)}>
          {gameName ? (
            viewCoverArt(gameName)
          ) : (
            <Avatar
              src={hostProfile?.avatarUrl ?? ''}
              variant="square"
              sx={{ width: '100%', height: '100%' }}
            />
          )}
        </AspectRatio>

        <Divider />

        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          {gameName && (
            <Typography variant="overline" color="primary.main" noWrap>
              {Game.gameNameToString(gameName)}
            </Typography>
          )}
          <Typography variant="h6" noWrap>
            {hostProfile ? `${hostProfile.username}'s game` : '...'}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" noWrap>
            {roomCount} in game
          </Typography>
        </Box>
      </Paper>
    </CardActionArea>
  );
};
