import { Sub } from '@gamezilla/core';
import { RoomId, UserId } from '@gamezilla/shared';
import {
  GameName,
  RoomFrontend as GameRoom,
  gameNameToString,
  viewCoverArt,
} from '@gamezilla/room';
import { Ctx, Route } from '@gamezilla/shared';
import {
  AspectRatio,
  Avatar,
  Box,
  Button,
  CardActionArea,
  Divider,
  FillBox,
  Header,
  Icons,
  Paper,
  Typography,
  ViewEmptyState,
} from '@gamezilla/shared/ui';

//
//
//
// Model
//
//
//

export type Model = null;

export const init: Model = null;

//
//
//
// Update
//
//
//

export type Msg =
  | ['clicked-current-room']
  | ['clicked-current-room-leave']
  | ['clicked-current-room-destroy']
  | ['clicked-room', { roomId: RoomId }]
  | ['clicked-game-card', { roomId: RoomId; gameName: GameName }]
  | ['clicked-create-room', { roomId: RoomId }];

export type OutAction = GameRoom.Action | Route.Action;

export const update = (
  { currentUserId }: { currentUserId: UserId },
  msg: Msg,
  model: Model
): [Model, OutAction[]] => {
  switch (msg[0]) {
    case 'clicked-game-card': {
      const payload = {
        gameName: msg[1].gameName,
        roomId: msg[1].roomId,
        userId: currentUserId,
      };
      return [
        model,
        [
          ['route', ['Push', ['game']]],
          ['room', ['Msg', ['room-create', payload]]],
        ],
      ];
    }

    case 'clicked-create-room': {
      return [
        model,
        [
          ['route', ['Push', ['game']]],
          [
            'room',
            [
              'Msg',
              ['room-create', { roomId: msg[1].roomId, userId: currentUserId }],
            ],
          ],
        ],
      ];
    }

    case 'clicked-room': {
      const roomId = msg[1].roomId;
      return [
        model,
        [['room', ['Msg', ['room-join', { roomId, userId: currentUserId }]]]],
      ];
    }

    case 'clicked-current-room-leave': {
      return [
        model,
        [['room', ['Msg', ['room-leave', { userId: currentUserId }]]]],
      ];
    }

    case 'clicked-current-room-destroy': {
      return [
        model,
        [['room', ['Msg', ['room-destroy', { userId: currentUserId }]]]],
      ];
    }

    case 'clicked-current-room': {
      return [model, [['route', ['Push', ['game']]]]];
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const View = ({
  model,
  $send,
  gameRoom,
  ctx,
}: {
  gameRoom: GameRoom.Model;
  model: Model;
  $send: (msg: Msg) => void;
  ctx: Ctx;
}) => {
  const user = gameRoom.users[ctx.currentUserId];

  if (!user) {
    return (
      <ViewNotInRoom
        model={model}
        $send={$send}
        ctx={ctx}
        gameRoom={gameRoom}
      />
    );
  }

  const currentRoom = gameRoom.rooms[user.roomId];

  if (!currentRoom) {
    return (
      <ViewNotInRoom
        model={model}
        $send={$send}
        ctx={ctx}
        gameRoom={gameRoom}
      />
    );
  }

  const hostProfile = ctx.profiles[currentRoom.hostId];
  const roomCount = Object.values(gameRoom.users).filter(
    (user) => user.roomId === currentRoom.roomId
  ).length;

  const gameName = gameRoom.games[user.roomId]?.type;

  const otherRooms = Object.values(gameRoom.rooms).filter(
    (room) => room.roomId !== currentRoom.roomId
  );

  return (
    <FillBox sx={{ overflow: 'scroll' }}>
      <Header title="Home" />

      <Box sx={{ px: 2 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Your Room
        </Typography>

        <Paper sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardActionArea onClick={() => $send(['clicked-current-room'])}>
            <AspectRatio aspectRatio={Math.pow(3 / 4, 4)}>
              {gameName ? (
                viewCoverArt(gameName)
              ) : (
                <Avatar
                  variant="square"
                  src={hostProfile?.avatarUrl ?? ''}
                  sx={{ width: '100%', height: '100%' }}
                />
              )}
            </AspectRatio>

            <Divider />

            <Box sx={{ flex: 2, padding: 2, overflow: 'hidden' }}>
              <Typography variant="overline" color="primary.main" noWrap>
                {gameName ? gameNameToString(gameName) : '...'}
              </Typography>
              <Typography variant="h5" noWrap>
                {hostProfile ? `${hostProfile.username}'s room` : '...'}
              </Typography>
              <Typography variant="h6" color="text.secondary" noWrap>
                {`${roomCount} in game`}
              </Typography>
            </Box>
          </CardActionArea>

          <Box sx={{ flex: 2, p: 2, pt: 0, overflow: 'hidden' }}>
            {currentRoom.hostId === ctx.currentUserId ? (
              <Button
                fullWidth
                sx={{ mt: 2 }}
                color="error"
                startIcon={<Icons.DeleteForever />}
                variant="outlined"
                onClick={() => {
                  $send(['clicked-current-room-destroy']);
                }}
              >
                End Room
              </Button>
            ) : (
              <Button
                fullWidth
                sx={{ mt: 2 }}
                color="error"
                startIcon={
                  <Icons.ExitToApp sx={{ transform: 'rotate(180deg)' }} />
                }
                variant="outlined"
                onClick={() => {
                  $send(['clicked-current-room-leave']);
                }}
              >
                Leave
              </Button>
            )}
          </Box>
        </Paper>
      </Box>

      {otherRooms.length > 0 && (
        <>
          <Typography variant="h6" color="text.secondary" sx={{ px: 2, mt: 2 }}>
            Active Games
          </Typography>

          <Box sx={{ px: 2 }}>
            <GameRoom.RoomGrid
              ctx={ctx}
              model={gameRoom}
              onClick={({ roomId }) =>
                $send(['clicked-room', { roomId: roomId }])
              }
            />
          </Box>
        </>
      )}
    </FillBox>
  );
};

const ViewNotInRoom = ({
  $send,
  gameRoom,
  ctx,
}: {
  ctx: Ctx;
  gameRoom: GameRoom.Model;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const rooms = Object.values(gameRoom.rooms);

  return (
    <FillBox sx={{ overflowY: 'scroll' }}>
      <Header title="Home" />

      {rooms.length === 0 && (
        <ViewEmptyState
          actionIcon={<Icons.Add />}
          actionTitle="Create Game"
          onAction={() =>
            $send(['clicked-create-room', { roomId: RoomId.generate() }])
          }
          renderIcon={(props) => <Icons.SportsEsportsOutlined {...props} />}
          title="No Active Games"
        />
      )}

      {rooms.length > 0 && (
        <>
          <Box sx={{ px: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() =>
                $send(['clicked-create-room', { roomId: RoomId.generate() }])
              }
              startIcon={<Icons.Add />}
            >
              Create Game
            </Button>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ px: 2, mt: 2 }}>
            Active Games
          </Typography>

          <Box sx={{ px: 2 }}>
            <GameRoom.RoomGrid
              ctx={ctx}
              model={gameRoom}
              onClick={({ roomId }) =>
                $send(['clicked-room', { roomId: roomId }])
              }
            />
          </Box>
        </>
      )}
    </FillBox>
  );
};
