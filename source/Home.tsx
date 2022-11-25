import { Ctx } from "./App.Shared"
import { Sub } from "./Core"
import { RoomId, UserId } from "./Data"
import * as Game from "./Game/Game.Frontend"
import { GameName, gameNameList } from "./Game/Game.Types"
import * as GameRoom from "./Game/GameRoom.Frontend"
import * as Route from "./Route"
import * as UI from "./UI"

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
  | ["ClickedGameCard", GameName]

export type OutAction = GameRoom.Action | Route.Action

export const update = (
  { currentUserId }: { currentUserId: UserId },
  msg: Msg,
  model: Model,
): [Model, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedGameCard": {
      return [
        model,
        [
          ["Route", ["Push", ["GameRoom"]]],
          [
            "GameRoom",
            [
              "Msg",
              [
                "RoomCreate",
                {
                  gameName: msg[1],
                  roomId: RoomId.generate(),
                  userId: currentUserId,
                },
              ],
            ],
          ],
        ],
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
    return (
      <ViewNotInRoom
        model={model}
        $d={$d}
        ctx={ctx}
        gameRoom={gameRoom}
      />
    )
  }

  const currentRoom = gameRoom.rooms[user.roomId]

  if (!currentRoom) {
    return (
      <ViewNotInRoom
        model={model}
        $d={$d}
        ctx={ctx}
        gameRoom={gameRoom}
      />
    )
  }

  const hostProfile = ctx.profiles[currentRoom.hostId]
  const roomCount = Object.values(gameRoom.users).filter(
    (user) => user.roomId === currentRoom.roomId,
  ).length

  const gameName = currentRoom.game[0]
  const otherRooms = Object.values(gameRoom.rooms).filter(
    (room) => room.roomId !== currentRoom.roomId,
  )

  return (
    <UI.FillBox sx={{ overflow: "scroll" }}>
      <UI.Header title="Home" />

      <UI.Box sx={{ paddingX: 2 }}>
        <UI.Typography
          variant="h5"
          sx={{ marginBottom: 1 }}
        >
          Current Room
        </UI.Typography>

        <UI.Paper
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
          <UI.CardActionArea
            sx={{
              width: 100,
              minWidth: 100,
              flex: 1,
              display: "flex",
              flexDirection: "row",
            }}
          >
            <UI.Box sx={{ width: 100 }}>
              <UI.AspectRatio aspectRatio={1}>
                {gameName ? (
                  <Game.CoverArt gameName={gameName} />
                ) : (
                  <UI.Avatar
                    variant="square"
                    src={hostProfile?.avatarUrl ?? ""}
                    sx={{ width: "100%", height: "100%" }}
                  />
                )}
              </UI.AspectRatio>
            </UI.Box>

            <UI.Box sx={{ flex: 2, padding: 2, overflow: "hidden" }}>
              <UI.Typography
                variant="h5"
                noWrap
              >
                {hostProfile ? `${hostProfile.username}'s room` : "..."}
              </UI.Typography>
              <UI.Typography
                variant="subtitle1"
                color="text.secondary"
                noWrap
              >
                {`${roomCount} in room`}
              </UI.Typography>
            </UI.Box>
          </UI.CardActionArea>

          {currentRoom.hostId === ctx.currentUserId ? (
            <>
              <UI.Button
                sx={{ marginRight: 1 }}
                color="error"
                onClick={(event) => {
                  event.stopPropagation()
                  $d(["ClickedCurrentRoomDestroy"])
                }}
              >
                End Room
              </UI.Button>
            </>
          ) : (
            <>
              <UI.Button
                sx={{ marginRight: 1 }}
                color="error"
                onClick={(event) => {
                  event.stopPropagation()
                  $d(["ClickedCurrentRoomLeave"])
                }}
              >
                Leave
              </UI.Button>
            </>
          )}
        </UI.Paper>
      </UI.Box>

      {otherRooms.length > 0 && (
        <>
          <UI.Typography
            variant="h6"
            color="text.secondary"
            sx={{ paddingX: 2, marginBottom: 1, marginTop: 2 }}
          >
            Other Rooms
          </UI.Typography>

          <UI.Box
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
                gameName={room.game[0]}
                ctx={ctx}
                gameRoom={gameRoom}
                onClick={() => $d(["ClickedRoom", { roomId: room.roomId }])}
              />
            ))}
          </UI.Box>
        </>
      )}
    </UI.FillBox>
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

  if (rooms.length === 0) {
    return (
      <UI.FillBox sx={{ overflowY: "scroll" }}>
        <UI.Header title="Home" />

        <UI.Typography
          variant="h4"
          sx={{ paddingX: 2, marginBottom: 1 }}
        >
          Games
        </UI.Typography>
        <UI.Box
          sx={{
            gap: 1,
            paddingX: 2,
            display: "flex",
            overflowX: "scroll",
            width: "100%",
            snapScrollType: "x mandatory",
          }}
        >
          {gameNameList.map((gameName) => (
            <UI.Box
              key={gameName}
              sx={{ minWidth: 150, flex: 1 }}
            >
              <GameRoom.ViewGameCard
                key={gameName}
                gameName={gameName}
                onClick={() => $d(["ClickedGameCard", gameName])}
              />
            </UI.Box>
          ))}
        </UI.Box>
      </UI.FillBox>
    )
  }

  return (
    <UI.FillBox sx={{ overflowY: "scroll" }}>
      <UI.Header title="Home" />

      <UI.Typography
        variant="h4"
        sx={{ paddingX: 2, marginBottom: 1 }}
      >
        Games
      </UI.Typography>
      <UI.Box
        sx={{
          gap: 1,
          paddingX: 2,
          display: "flex",
          overflowX: "scroll",
          width: "100%",
          snapScrollType: "x mandatory",
        }}
      >
        {gameNameList.map((gameName) => (
          <UI.Box key={gameName} sx={{ minWidth: 150, flex: 1 }}>
            <GameRoom.ViewGameCard
              key={gameName}
              gameName={gameName}
              onClick={() => $d(["ClickedGameCard", gameName])}
            />
          </UI.Box>
        ))}
      </UI.Box>

      <UI.Typography
        variant="h6"
        color="text.secondary"
        sx={{ paddingX: 2, marginBottom: 1, marginTop: 2 }}
      >
        Active Rooms
      </UI.Typography>

      <UI.Box
        sx={{
          paddingX: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {rooms.map((room) => (
          <GameRoom.ViewCard
            key={room.roomId}
            roomId={room.roomId}
            hostId={room.hostId}
            gameName={room.game[0]}
            ctx={ctx}
            gameRoom={gameRoom}
            onClick={() => $d(["ClickedRoom", { roomId: room.roomId }])}
          />
        ))}
      </UI.Box>
    </UI.FillBox>
  )
}
