import { Ctx, ViewEmptyState } from "./App.Shared"
import { Sub } from "./Core"
import { RoomId, UserId } from "./Data"
import * as Game from "./Game/Game.Frontend"
import { viewCoverArt } from "./Game/Game"
import { GameName } from "./Game/Game.Types"
import * as GameRoom from "./Game/GameRoom.Frontend"
import * as Route from "./Route"
import { AspectRatio, Avatar, Box, Button, CardActionArea, Divider, FillBox, Header, Icons, Paper, Typography } from "./UI"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: Model = {}

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedCurrentRoom"]
  | ["ClickedCurrentRoomLeave"]
  | ["ClickedCurrentRoomDestroy"]
  | ["ClickedRoom", { roomId: RoomId }]
  | ["ClickedGameCard", { roomId: RoomId, gameName: GameName }]
  | ["ClickedCreateRoom", { roomId: RoomId }]

export type OutAction = GameRoom.Action | Route.Action

export const update = (
  { currentUserId }: { currentUserId: UserId },
  msg: Msg,
  model: Model,
): [Model, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedGameCard": {
      const payload = {
        gameName: msg[1].gameName,
        roomId: msg[1].roomId,
        userId: currentUserId,
      }
      return [
        model,
        [
          ["Route", ["Push", ["Game"]]],
          ["GameRoom", ["Msg", ["RoomCreate", payload]]]
        ],
      ]
    }

    case 'ClickedCreateRoom': {
      return [
        model,
        [
          ["Route", ["Push", ["Game"]]],
          ['GameRoom', ['Msg', ['RoomCreate', { roomId: msg[1].roomId, userId: currentUserId }]]]
        ]
      ]
    }

    case "ClickedRoom": {
      const roomId = msg[1].roomId
      return [
        model,
        [
          [
            "GameRoom",
            ["Msg", ["RoomJoin", { roomId, userId: currentUserId }]],
          ],
        ],
      ]
    }

    case "ClickedCurrentRoomLeave": {
      return [
        model,
        [["GameRoom", ["Msg", ["RoomLeave", { userId: currentUserId }]]]],
      ]
    }

    case "ClickedCurrentRoomDestroy": {
      return [
        model,
        [["GameRoom", ["Msg", ["RoomDestroy", { userId: currentUserId }]]]],
      ]
    }

    case "ClickedCurrentRoom": {
      return [model, [["Route", ["Push", ["Game"]]]]]
    }
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None
}

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
  gameRoom: GameRoom.Model
  model: Model
  $send: (msg: Msg) => void
  ctx: Ctx
}) => {
  const user = gameRoom.users[ctx.currentUserId]

  if (!user) {
    return <ViewNotInRoom model={model} $send={$send} ctx={ctx} gameRoom={gameRoom} />
  }

  const currentRoom = gameRoom.rooms[user.roomId]

  if (!currentRoom) {
    return <ViewNotInRoom model={model} $send={$send} ctx={ctx} gameRoom={gameRoom} />
  }

  const hostProfile = ctx.profiles[currentRoom.hostId]
  const roomCount = Object.values(gameRoom.users).filter(
    (user) => user.roomId === currentRoom.roomId,
  ).length


  const gameName = gameRoom.games[user.roomId]?.[0]

  const otherRooms = Object.values(gameRoom.rooms).filter(
    (room) => room.roomId !== currentRoom.roomId,
  )

  return (
    <FillBox sx={{ overflow: "scroll" }}>
      <Header title="Home" />

      <Box sx={{ px: 2 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Your Room
        </Typography>

        <Paper sx={{ display: "flex", flexDirection: "column", }}>
          <CardActionArea onClick={() => $send(["ClickedCurrentRoom"])}>
            <AspectRatio aspectRatio={Math.pow(3 / 4, 4)}>
              {gameName ? (
                viewCoverArt({ gameName })
              ) : (
                <Avatar
                  variant="square"
                  src={hostProfile?.avatarUrl ?? ""}
                  sx={{ width: "100%", height: "100%" }}
                />
              )}
            </AspectRatio>


            <Divider />


            <Box sx={{ flex: 2, padding: 2, overflow: "hidden" }}>
              <Typography variant="overline" color="primary.main" noWrap>
                {gameName ? Game.gameNameToString(gameName) : "..."}
              </Typography>
              <Typography variant="h5" noWrap>
                {hostProfile ? `${hostProfile.username}'s room` : "..."}
              </Typography>
              <Typography variant="h6" color="text.secondary" noWrap>
                {`${roomCount} in game`}
              </Typography>
            </Box>
          </CardActionArea>

          <Box sx={{ flex: 2, p: 2, pt: 0, overflow: "hidden" }}>
            {currentRoom.hostId === ctx.currentUserId ? (
              <>
                <Button
                  fullWidth
                  sx={{ mt: 2 }}
                  color="error"
                  startIcon={<Icons.DeleteForever />}
                  variant="outlined"
                  onClick={() => {
                    $send(["ClickedCurrentRoomDestroy"])
                  }}
                >
                  End Room
                </Button>
              </>
            ) : (
              <>
                <Button
                  fullWidth
                  sx={{ mt: 2 }}
                  color="error"
                  startIcon={<Icons.ExitToApp sx={{ "transform": "rotate(180deg)" }} />}
                  variant="outlined"
                  onClick={() => {
                    $send(["ClickedCurrentRoomLeave"])
                  }}
                >
                  Leave
                </Button>
              </>
            )}
          </Box>


        </Paper>
      </Box>

      {otherRooms.length > 0 && (
        <>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ px: 2, mt: 2, }}
          >
            Active Games
          </Typography>

          <Box sx={{ px: 2 }}>
            <GameRoom.RoomGrid
              ctx={ctx}
              model={gameRoom}
              onClick={({ roomId }) => $send(['ClickedRoom', { roomId: roomId }])}
            />
          </Box>
        </>
      )}
    </FillBox>
  )
}

const ViewNotInRoom = ({
  $send,
  gameRoom,
  ctx,
}: {
  ctx: Ctx
  gameRoom: GameRoom.Model
  model: Model
  $send: (msg: Msg) => void
}) => {
  const rooms = Object.values(gameRoom.rooms)

  return (
    <FillBox sx={{ overflowY: "scroll" }}>
      <Header title="Home" />

      {rooms.length === 0 && (
        <>
          <ViewEmptyState
            actionIcon={<Icons.Add />}
            actionTitle="Create Game"
            onAction={() => $send(['ClickedCreateRoom', { roomId: RoomId.generate() }])}
            renderIcon={(props) => <Icons.SportsEsportsOutlined {...props} />}
            title="No Active Games"
          />
        </>
      )}

      {rooms.length > 0 && <>
        <Box sx={{ px: 2 }}>
          <Button fullWidth variant="contained" onClick={() => $send(['ClickedCreateRoom', { roomId: RoomId.generate() }])} startIcon={<Icons.Add />}>
            Create Game
          </Button>
        </Box>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ px: 2, mt: 2, }}
        >
          Active Games
        </Typography>

        <Box sx={{ px: 2 }}>
          <GameRoom.RoomGrid
            ctx={ctx}
            model={gameRoom}
            onClick={({ roomId }) => $send(['ClickedRoom', { roomId: roomId }])}
          />
        </Box>
      </>}
    </FillBox>
  )
}
