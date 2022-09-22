import { Sub } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Game from "../GameRoom/Game.Frontend"
import * as GameRoom from "../GameRoom/GameRoom.Frontend"
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

export type Msg = ["GameRoomMsg", GameRoom.Msg] | ["ClickedCurrentRoom"]

export type OutAction = GameRoom.Action | Route.Action

export const update = (msg: Msg, model: Model): [Model, OutAction[]] => {
  switch (msg[0]) {
    case "GameRoomMsg": {
      const pushAction: OutAction = ["Route", ["Push", ["GameRoom"]]]
      const gameRoomAction: OutAction = ["GameRoom", ["Msg", msg[1]]]

      const msgType = msg[1][0]
      const actions: OutAction[] =
        msgType === "JoinRoom" || msgType === "CreateRoom"
          ? [pushAction, gameRoomAction]
          : [gameRoomAction]

      return [model, actions]
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

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
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
  const gameName =
    currentRoom.game.type === "Some" ? currentRoom.game.value[0] : undefined
  const otherRooms = Object.values(gameRoom.rooms).filter(
    (room) => room.roomId !== currentRoom.roomId,
  )

  return (
    <UI.FillBox sx={{ overflow: "scroll" }}>
      <UI.Header title="Gamezilla" />

      <UI.Box sx={{ paddingX: 2 }}>
        <UI.Typography
          variant="h4"
          sx={{ marginBottom: 1 }}
        >
          Current Room
        </UI.Typography>

        <UI.Paper
          onClick={() => dispatch(["ClickedCurrentRoom"])}
          variant="outlined"
          sx={{ overflow: "hidden", display: "flex", flexDirection: "row" }}
        >
          <UI.Box sx={{ width: 100, minWidth: 100 }}>
            <UI.AspectRatio aspectRatio={1}>
              {gameName ? (
                <Game.CoverArt gameName={gameName} />
              ) : (
                <UI.Avatar
                  src={hostProfile?.avatarUrl ?? ""}
                  sx={{ width: "100%", height: "100%" }}
                />
              )}
            </UI.AspectRatio>
          </UI.Box>

          <UI.Box
            sx={{
              padding: 2,
              flex: 1,
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <UI.Box sx={{ flex: 2, overflow: "hidden" }}>
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
            <UI.Box sx={{ flex: 1 }}>
              <UI.Button
                onClick={(event) => {
                  event.stopPropagation()
                  dispatch([
                    "GameRoomMsg",
                    ["LeaveRoom", { userId: currentUserId }],
                  ])
                }}
              >
                Leave
              </UI.Button>
            </UI.Box>
          </UI.Box>
        </UI.Paper>
      </UI.Box>

      {otherRooms.length > 0 && (
        <>
          <UI.Typography
            variant="h6"
            color="text.secondary"
            sx={{ paddingX: 2, marginBottom: 1, marginTop: 4 }}
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
                gameName={
                  room.game.type === "Some" ? room.game.value[0] : undefined
                }
                store={store}
                gameRoom={gameRoom}
                onClick={() =>
                  dispatch([
                    "GameRoomMsg",
                    [
                      "JoinRoom",
                      { roomId: room.roomId, userId: currentUserId },
                    ],
                  ])
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
  const rooms = Object.values(gameRoom.rooms)

  return (
    <UI.FillBox sx={{ overflowY: "scroll" }}>
      <UI.Header title="Gamezilla" />

      <UI.Box sx={{ paddingX: 2 }}>
        <GameRoom.ViewCallToAction
          onCreateRoom={() =>
            dispatch([
              "GameRoomMsg",
              [
                "CreateRoom",
                { roomId: RoomId.generate(), userId: currentUserId },
              ],
            ])
          }
        />
      </UI.Box>

      {rooms.length > 0 && (
        <>
          <UI.Typography
            variant="h6"
            color="text.secondary"
            sx={{ paddingX: 2, marginBottom: 1, marginTop: 4 }}
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
            {rooms.map((room) => (
              <GameRoom.ViewCard
                key={room.roomId}
                roomId={room.roomId}
                hostId={room.hostId}
                gameName={
                  room.game.type === "Some" ? room.game.value[0] : undefined
                }
                store={store}
                gameRoom={gameRoom}
                onClick={() =>
                  dispatch([
                    "GameRoomMsg",
                    [
                      "JoinRoom",
                      { roomId: room.roomId, userId: currentUserId },
                    ],
                  ])
                }
              />
            ))}
          </UI.Box>
        </>
      )}
    </UI.FillBox>
  )
}
