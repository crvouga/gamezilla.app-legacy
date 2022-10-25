import { Sub } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Game from "../Game/Game.Frontend"
import { GameName, gameNameList } from "../Game/Game.Types"
import * as GameRoom from "../Game/GameRoom.Frontend"
import * as Route from "../Route"
import * as Store from "../Store"
import * as UI from "../UI"

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
  | ["ClickedRoom", { roomId: RoomId.RoomId }]
  | ["ClickedGameCard", GameName]

export type OutAction = GameRoom.Action | Route.Action

export const update = (
  { currentUserId }: { currentUserId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedGameCard": {
      return [
        model,
        [
          ["Route", ["Push", ["GameRoom"]]],
          ["GameRoom", ["Msg", ["CreateRoom", { gameName: msg[1], roomId: RoomId.generate(), userId: currentUserId, },],],],
        ],
      ]
    }

    case "ClickedRoom": {
      const roomId = msg[1].roomId
      return [
        model,
        [["GameRoom", ["Msg", ["JoinRoom", { roomId, userId: currentUserId }]]],],
      ]
    }

    case "ClickedCurrentRoomLeave": {
      return [
        model,
        [["GameRoom", ["Msg", ["LeaveRoom", { userId: currentUserId }]]]],
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

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
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
  dispatch,
  currentUserId,
  gameRoom,
  store,
}: {
  currentUserId: UserId.UserId
  gameRoom: GameRoom.Model
  model: Model
  dispatch: (msg: Msg) => void
  store: Store.Model
}) => {
  const user = gameRoom.users[currentUserId]

  if (!user) {
    return (
      <ViewNotInRoom
        model={model}
        dispatch={dispatch}
        currentUserId={currentUserId}
        gameRoom={gameRoom}
        store={store}
      />
    )
  }

  const currentRoom = gameRoom.rooms[user.roomId]

  if (!currentRoom) {
    return (
      <ViewNotInRoom
        model={model}
        dispatch={dispatch}
        currentUserId={currentUserId}
        gameRoom={gameRoom}
        store={store}
      />
    )
  }

  const hostProfile = store.Profile[currentRoom.hostId]
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
          onClick={() => dispatch(["ClickedCurrentRoom"])}
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

          <UI.Button
            sx={{ marginRight: 1 }}
            onClick={(event) => {
              event.stopPropagation()
              dispatch(["ClickedCurrentRoomLeave"])
            }}
          >
            Leave
          </UI.Button>
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
                store={store}
                gameRoom={gameRoom}
                onClick={() =>
                  dispatch(["ClickedRoom", { roomId: room.roomId }])
                }
              />
            ))}
          </UI.Box>
        </>
      )}
    </UI.FillBox>
  )
}

const ViewNotInRoom = ({
  dispatch,
  gameRoom,
  store,
}: {
  currentUserId: UserId.UserId
  gameRoom: GameRoom.Model
  model: Model
  dispatch: (msg: Msg) => void
  store: Store.Model
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
            <UI.Box key={gameName} sx={{ minWidth: 150, flex: 1 }}>
              <GameRoom.ViewGameCard
                key={gameName}
                gameName={gameName}
                onClick={() => dispatch(["ClickedGameCard", gameName])}
              />
            </UI.Box>
          ))}
        </UI.Box>

        {/* <UI.Box sx={{ paddingX: 2 }}>
          <GameRoom.ViewCallToAction
            onCreateRoom={() =>
              dispatch(['ClickedCreateRoom'])
            }
          />
        </UI.Box> */}
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
          <UI.Box sx={{ minWidth: 150, flex: 1 }}>
            <GameRoom.ViewGameCard
              key={gameName}
              gameName={gameName}
              onClick={() => dispatch(["ClickedGameCard", gameName])}
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
            store={store}
            gameRoom={gameRoom}
            onClick={() => dispatch(["ClickedRoom", { roomId: room.roomId }])}
          />
        ))}
      </UI.Box>
    </UI.FillBox>
  )
}
