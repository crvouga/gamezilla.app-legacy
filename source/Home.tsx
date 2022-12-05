import { Ctx } from "./App.Shared"
import { Sub } from "./Core"
import { RoomId, UserId } from "./Data"
import * as Game from "./Game/Game.Frontend"
import { GameName, gameNameList } from "./Game/Game.Types"
import * as GameRoom from "./Game/GameRoom.Frontend"
import * as Route from "./Route"
import { AspectRatio, Avatar, Box, Button, CardActionArea, FillBox, Header, Paper, Typography } from "./UI"

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
      return [model, [["Route", ["Push", ["GameRoom"]]]]]
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
  $d,
  gameRoom,
  ctx,
}: {
  gameRoom: GameRoom.Model
  model: Model
  $d: (msg: Msg) => void
  ctx: Ctx
}) => {
  const user = gameRoom.users[ctx.currentUserId]

  if (!user) {
    return <ViewNotInRoom model={model} $d={$d} ctx={ctx} gameRoom={gameRoom} />
  }

  const currentRoom = gameRoom.rooms[user.roomId]

  if (!currentRoom) {
    return <ViewNotInRoom model={model} $d={$d} ctx={ctx} gameRoom={gameRoom} />
  }

  const hostProfile = ctx.profiles[currentRoom.hostId]
  const roomCount = Object.values(gameRoom.users).filter(
    (user) => user.roomId === currentRoom.roomId,
  ).length

  const gameName = currentRoom?.game?.[0]
  const otherRooms = Object.values(gameRoom.rooms).filter(
    (room) => room.roomId !== currentRoom.roomId,
  )

  return (
    <FillBox sx={{ overflow: "scroll" }}>
      <Header title="Home" />

      <Box sx={{ px: 2 }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Your Room
        </Typography>

        <Paper
          onClick={() => $d(["ClickedCurrentRoom"])}
          variant="outlined"
          sx={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CardActionArea
            sx={{
              width: 100,
              minWidth: 100,
              flex: 1,
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Box sx={{ width: 100 }}>
              <AspectRatio aspectRatio={1}>
                {gameName ? (
                  <Game.CoverArt gameName={gameName} />
                ) : (
                  <Avatar
                    variant="square"
                    src={hostProfile?.avatarUrl ?? ""}
                    sx={{ width: "100%", height: "100%" }}
                  />
                )}
              </AspectRatio>
            </Box>

            <Box sx={{ flex: 2, padding: 2, overflow: "hidden" }}>
              <Typography variant="h5" noWrap>
                {hostProfile ? `${hostProfile.username}'s room` : "..."}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" noWrap>
                {`${roomCount} in room`}
              </Typography>
            </Box>
          </CardActionArea>

        </Paper>
        {currentRoom.hostId === ctx.currentUserId ? (
          <>
            <Button
              fullWidth
              sx={{ mt: 2 }}
              color="error"
              onClick={(event) => {
                event.stopPropagation()
                $d(["ClickedCurrentRoomDestroy"])
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
              onClick={(event) => {
                event.stopPropagation()
                $d(["ClickedCurrentRoomLeave"])
              }}
            >
              Leave
            </Button>
          </>
        )}
      </Box>

      {otherRooms.length > 0 && (
        <>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ paddingX: 2, marginBottom: 1, marginTop: 2 }}
          >
            Other Rooms
          </Typography>

          <Box
            sx={{
              paddingX: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {otherRooms.map((room) => (
              <GameRoom.ViewCard
                key={room.roomId}
                roomId={room.roomId}
                hostId={room.hostId}
                gameName={room?.game?.[0]}
                ctx={ctx}
                gameRoom={gameRoom}
                onClick={() => $d(["ClickedRoom", { roomId: room.roomId }])}
              />
            ))}
          </Box>
        </>
      )}
    </FillBox>
  )
}

const ViewNotInRoom = ({
  $d,
  gameRoom,
  ctx,
}: {
  ctx: Ctx
  gameRoom: GameRoom.Model
  model: Model
  $d: (msg: Msg) => void
}) => {
  const rooms = Object.values(gameRoom.rooms)

  return (
    <FillBox sx={{ overflowY: "scroll" }}>
      <Header title="Home" />

      <Typography variant="h3" sx={{ mb: 1, px: 2 }}>
        Start a Game
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 1, px: 2 }}>
        Games
      </Typography>

      <Box sx={{ display: 'flex', overflow: "scroll", gap: 2, mb: 2, snapScrollType: "x mandatory", px: 2 }}>
        {gameNameList.map(gameName => (
          <CardActionArea key={gameName} onClick={() => $d(['ClickedGameCard', { roomId: RoomId.generate(), gameName }])} sx={{ width: "100px", minWidth: "100px", }}>

            <Paper sx={{ overflow: "hidden", width: "100%" }}>
              <Game.CoverArt gameName={gameName} />
              <Typography variant="subtitle2" color="text.secondary" noWrap sx={{ width: "100%", px: 1 }}>
                {Game.gameNameToString(gameName)}
              </Typography>
            </Paper>
          </CardActionArea>
        ))}
      </Box>

      <Box sx={{ px: 2 }}>
        <Button fullWidth variant="contained" onClick={() => $d(['ClickedCreateRoom', { roomId: RoomId.generate() }])}>
          Create New Room
        </Button>
      </Box>

      {rooms.length > 0 && <>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ px: 2, mb: 1, mt: 2 }}
        >
          Active Rooms
        </Typography>

        <Box sx={{ px: 2, d: "flex", flexDirection: "column", gap: 2, }}>
          {rooms.map((room) => (
            <GameRoom.ViewCard
              key={room.roomId}
              roomId={room.roomId}
              hostId={room.hostId}
              gameName={room?.game?.[0]}
              ctx={ctx}
              gameRoom={gameRoom}
              onClick={() => $d(["ClickedRoom", { roomId: room.roomId }])}
            />
          ))}
        </Box>
      </>}
    </FillBox>
  )
}
