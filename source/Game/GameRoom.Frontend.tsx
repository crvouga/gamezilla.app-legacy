import { Cmd, exhaustive, p, RemoteData, Sub, Unit } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Route from "../Route"
import * as Snackbar from "../Snackbar"
import * as Store from "../Store"
import * as UI from "../UI"
import * as Game from "./Game.Frontend"
import { GameName, gameNameList } from "./Game.Types"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg, FrontendRoom, Response,
  ToBackend,
  ToFrontend
} from "./GameRoom.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: [Model, Cmd.Cmd<Msg>] = [
  {
    rooms: {},
    users: {},
    modal: "Closed",
    requests: {
      CreateRoom: RemoteData.NotAsked,
      JoinRoom: RemoteData.NotAsked,
      LeaveRoom: RemoteData.NotAsked,
      OpenGame: RemoteData.NotAsked,
      CloseGame: RemoteData.NotAsked,
    },
  },
  Cmd.None,
]

//
//
//
// Msg
//
//
//

export type Msg = FrontendMsg

export type Action = ["GameRoom", ["Msg", Msg]]

type OutAction = Snackbar.Action | Store.Action | Route.Action

//
//
//
// Update
//
//
//

export const update = (
  {
    currentUserId,
    sendToBackend,
  }: {
    currentUserId: UserId.UserId
    sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
  },
  msg: Msg,
  modelPrev: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const model: Model = { ...modelPrev, modal: "Closed" }

  switch (msg[0]) {
    case "ClickedGoHome": {
      return [model, Route.push(["Home"])]
    }

    case "ClickedAvatars": {
      return [{ ...model, modal: "DrawerOpened" }, Cmd.None]
    }

    case "ClosedDrawer": {
      return [model, Cmd.None]
    }

    case "ClickedUser": {
      return [model, Route.push(["Profile", { userId: msg[1].userId }])]
    }

    case "ClickedBanner": {
      return [model, Route.push(["GameRoom"])]
    }

    case "JoinRoom":
    case "LeaveRoom":
    case "CreateRoom":
    case "OpenGame":
    case "CloseGame": {
      return [
        {
          ...model,
          requests: {
            ...model.requests,
            [msg[0]]: RemoteData.Loading,
          },
        },
        sendToBackend(msg),
      ]
    }

    case "Games": {
      const user = model.users[currentUserId]

      if (!user) {
        return [model, Cmd.None]
      }

      const roomId = msg[1]

      if (user.roomId !== roomId) {
        return [model, Cmd.None]
      }

      const room = model.rooms[roomId]

      if (!room) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.update(
        {
          currentUserId,
          sendToBackend: (msg) => sendToBackend(["Games", roomId, msg]),
        },
        gameMsg,
        room.game,
      )

      const roomNew: FrontendRoom = {
        ...room,
        game: gameNew,
      }

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomId]: roomNew
        },
      }

      return [
        modelNew,
        p(
          gameCmd,
          Cmd.map((msg): Msg => ["Games", roomId, msg]),
        ),
      ]
    }

    default:
      return exhaustive(msg[0])
  }
}

export const updateFromBackend = (
  {
    currentUserId,
    sendToBackend,
    store,
  }: {
    currentUserId: UserId.UserId
    sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
    store: Store.Model
  },
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Sync": {
      const userIds = Object.values(msg[1].users).map((user) => user.userId)

      const actions: OutAction[] = [
        ["Store", ["Profile", ["FindMany", { userIds }]]],
      ]

      const [synced, syncedCmd] = mergeWithBackendModel({
        backendModel: msg[1],
        frontendModel: model,
        sendToBackend,
      })

      return [synced, syncedCmd, actions]
    }

    case "Games": {
      const roomId = msg[1]

      const room = model.rooms[roomId]

      if (!room) {
        return [model, Cmd.None, []]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd, actions] = Game.updateFromBackend(
        {
          currentUserId,
          sendToBackend: (msg) => sendToBackend(["Games", roomId, msg]),
          store,
        },
        gameMsg,
        room.game,
      )


      const roomNew: FrontendRoom = {
        ...room,
        game: gameNew,
      }

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomId]: roomNew,
        },
      }

      return [
        modelNew,
        p(
          gameCmd,
          Cmd.map((msg): Msg => ["Games", roomId, msg]),
        ),
        actions,
      ]
    }

    case "CreateRoom_Done": {
      return updateResponse({ sendToBackend, msg, model }, "CreateRoom")
    }

    case "LeaveRoom_Done": {
      return updateResponse({ sendToBackend, msg, model }, "LeaveRoom")
    }

    case "JoinRoom_Done": {
      const [modelNew, cmd, actions] = updateResponse(
        { sendToBackend, msg, model },
        "JoinRoom",
      )

      const routeActions: OutAction[] =
        msg[1].type === "Ok" ? [["Route", ["Replace", ["GameRoom"]]]] : []

      return [modelNew, cmd, [...actions, ...routeActions]]
    }

    case "OpenGame_Done": {
      return updateResponse({ sendToBackend, msg, model }, "OpenGame")
    }

    case "CloseGame_Done": {
      return updateResponse({ sendToBackend, model, msg }, "CloseGame")
    }
  }
}

const updateResponse = (
  {
    sendToBackend,
    msg,
    model,
  }: {
    msg: Response
    model: Model
    sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
  },
  requestKey: keyof Model["requests"],
): [Model, Cmd.Cmd<FrontendMsg>, OutAction[]] => {
  const result = msg[1]

  const actions: OutAction[] =
    result.type === "Err"
      ? [["Snackbar", { message: result.error, variant: "Error" }]]
      : []

  const remoteData = p(
    result,
    RemoteData.fromResult,
    RemoteData.map(() => Unit),
  )

  if (result.type === "Err") {
    return [
      {
        ...model,
        requests: {
          ...model.requests,
          [requestKey]: remoteData,
        },
      },
      Cmd.None,
      [["Snackbar", { message: result.error, variant: "Error" }]],
    ]
  }

  const [merged, mergedCmd] = mergeWithBackendModel({
    frontendModel: model,
    backendModel: result.value,
    sendToBackend,
  })

  const modelNew: Model = {
    ...merged,
    requests: {
      ...merged.requests,
      [requestKey]: remoteData,
    },
  }

  const userIds = Object.values(modelNew.users).map((user) => user.userId)

  const storeActions: OutAction[] = [
    ["Store", ["Profile", ["FindMany", { userIds }]]],
  ]

  return [modelNew, mergedCmd, [...actions, ...storeActions]]
}

const mergeWithBackendModel = ({
  frontendModel,
  backendModel,
  sendToBackend,
}: {
  sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
  frontendModel: FrontendModel
  backendModel: BackendModel
}): [FrontendModel, Cmd.Cmd<FrontendMsg>] => {
  const [roomsNew, roomsCmd] = Object.entries(backendModel.rooms).reduce<
    [FrontendModel["rooms"], Cmd.Cmd<FrontendMsg>]
  >(
    ([rooms, cmd], [roomId, backendRoom]) => {
      if (!RoomId.is(roomId)) {
        return [rooms, cmd]
      }

      const backendGame = backendRoom.game

      const frontendRoom = frontendModel.rooms[roomId]

      if (!frontendRoom) {
        const initial = Game.init({
          gameName: backendGame[0],
          sendToBackend: (msg) => sendToBackend(["Games", roomId, msg]),
        })
        const merged = Game.mergeWithBackend({
          backendModel: backendGame,
          frontendModel: initial[0],
          sendToBackend: (msg) => sendToBackend(["Games", roomId, msg]),
        })

        const frontendRoomNew: FrontendRoom = {
          hostId: backendRoom.hostId,
          roomId: backendRoom.roomId,
          game: merged[0],
        }

        return [
          {
            ...rooms,
            [roomId]: frontendRoomNew,
          },
          Cmd.batch([
            cmd,
            p(
              initial[1],
              Cmd.map((msg): Msg => ["Games", roomId, msg]),
            ),
            p(
              merged[1],
              Cmd.map((msg): Msg => ["Games", roomId, msg]),
            ),
          ]),
        ]
      }

      const merged = Game.mergeWithBackend({
        backendModel: backendGame,
        frontendModel: frontendRoom.game,
        sendToBackend: (msg) => sendToBackend(["Games", roomId, msg]),
      })

      const frontendRoomNew: FrontendRoom = {
        hostId: backendRoom.hostId,
        roomId: backendRoom.roomId,
        game: merged[0],
      }

      return [
        {
          ...rooms,
          [roomId]: frontendRoomNew,
        },
        Cmd.batch([
          cmd,
          p(
            merged[1],
            Cmd.map((msg): Msg => ["Games", roomId, msg]),
          ),
        ]),
      ]
    },
    [{}, Cmd.None],
  )

  return [
    {
      modal: frontendModel.modal,
      requests: frontendModel.requests,
      rooms: roomsNew,
      users: backendModel.users,
    },
    roomsCmd,
  ]
}

export const runAction = (
  {
    currentUserId,
    sendToBackend,
  }: {
    currentUserId: UserId.UserId
    sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
  },
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action[1][0]) {
    case "Msg": {
      const msg = action[1][1]
      return update({ sendToBackend, currentUserId }, msg, model)
    }
  }
}

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
  { currentUserId }: { currentUserId: UserId.UserId },
  model: Model,
): Sub.Sub<Msg> => {
  const user = model.users[currentUserId]

  if (!user) {
    return Sub.None
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return Sub.None
  }

  const intervalId = `room-${room.roomId}`

  return p(
    Game.subscriptions(intervalId, room.game),
    Sub.map((msg): Msg => ["Games", room.roomId, msg]),
  )
}

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
  currentUserId,
  store,
  model,
  dispatch
}: {
  currentUserId: UserId.UserId
  store: Store.Model
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const user = model.users[currentUserId]

  if (!user) {
    return (
      <ViewNotInRoom
        currentUserId={currentUserId}
        store={store}
        model={model}
        dispatch={dispatch}
      />
    )
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return (
      <ViewNotInRoom
        currentUserId={currentUserId}
        store={store}
        model={model}
        dispatch={dispatch}
      />
    )
  }

  const game = room.game

  return (
    <Game.View
      onCloseGame={() => dispatch(["CloseGame", { userId: currentUserId }])}
      currentUserId={currentUserId}
      store={store}
      dispatch={(msg) => dispatch(["Games", room.roomId, msg])}
      model={game}
      goHome={() => dispatch(["ClickedGoHome"])}
      roomComponent={
        <ViewGameRoomAvatarGroup
          currentUserId={currentUserId}
          store={store}
          room={room}
          model={model}
          dispatch={dispatch}
        />
      }
    />
  )
}

export const ViewNotInRoom = ({
  currentUserId,
  store,
  model,
  dispatch,
}: {
  store: Store.Model
  currentUserId: UserId.UserId
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const rooms = Object.values(model.rooms)

  const header = (
    <UI.Header
      left={
        <UI.IconButton
          sx={{ marginLeft: -1 }}
          onClick={() => dispatch(["ClickedGoHome"])}
        >
          <UI.Icons.Home />
        </UI.IconButton>
      }
      title="Game Rooms"
    />
  )

  if (
    model.requests.CreateRoom.type === "Loading" ||
    model.requests.JoinRoom.type === "Loading"
  ) {
    return (
      <UI.FillBox>
        {header}
        <UI.Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UI.CircularProgress />
        </UI.Box>
      </UI.FillBox>
    )
  }

  return (
    <UI.FillBox>
      {header}
      <UI.Typography sx={{ paddingX: 2, marginBottom: 1 }} variant="h4">
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
          marginBottom: 2,
        }}
      >
        {gameNameList.map((gameName) => (
          <UI.Box key={gameName} sx={{ minWidth: 150, flex: 1 }}>
            <ViewGameCard
              key={gameName}
              gameName={gameName}
              onClick={() => dispatch(['CreateRoom', { userId: currentUserId, roomId: RoomId.generate(), gameName }])}
            />
          </UI.Box>
        ))}
      </UI.Box>

      {Object.values(rooms).length > 0 && <UI.Typography sx={{ paddingX: 2, marginBottom: 1 }} variant="h6" color="text.secondary">
        Active Rooms
      </UI.Typography>}
      <UI.Box
        sx={{
          paddingX: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >

        {Object.values(rooms).map((room) => (
          <ViewCard
            key={room.roomId}
            roomId={room.roomId}
            hostId={room.hostId}
            gameName={room.game[0]}
            store={store}
            gameRoom={model}
            onClick={() =>
              dispatch([
                "JoinRoom",
                { roomId: room.roomId, userId: currentUserId },
              ])
            }
          />
        ))}
      </UI.Box>
    </UI.FillBox>
  )
}

const ViewGameRoomAvatarGroup = ({
  store,
  room,
  model,
  dispatch,
  currentUserId,
}: {
  store: Store.Model
  room: {
    roomId: RoomId.RoomId
    hostId: UserId.UserId
  }
  model: Model
  dispatch: (msg: Msg) => void
  currentUserId: UserId.UserId
}) => {
  const usersInRoom = Object.values(model.users).filter(
    (user) => user.roomId === room.roomId,
  )

  return (

    <>
      <UI.IconButton sx={{ marginRight: -1 }} onClick={() => dispatch(["ClickedAvatars"])}>
        <UI.Badge badgeContent={usersInRoom.length > 1 ? usersInRoom.length : undefined} color="primary">
          <UI.Icons.Group />
        </UI.Badge>
      </UI.IconButton>
      {/* <UI.AvatarGroup
        sx={{ marginRight: -1 }}
        onClick={() => dispatch(["ClickedAvatars"])}
        componentsProps={{
          additionalAvatar: { sx: { width: 28, height: 28 } },
        }}
      >
        {usersInRoom.map((user) => (
          <UI.Avatar
            key={user.userId}
            src={store.Profile[user.userId]?.avatarUrl}
            sx={{ width: 28, height: 28 }}
          />
        ))}
      </UI.AvatarGroup> */}

      <UI.Drawer
        anchor="bottom"
        open={model.modal === "DrawerOpened"}
        onClose={() => dispatch(["ClosedDrawer"])}
      >
        <UI.Typography
          variant="h4"
          sx={{ paddingX: 2, paddingTop: 2, width: "100%" }}
          noWrap
        >
          {store.Profile[room.hostId]?.username ?? "..."}'s room
        </UI.Typography>

        <UI.Box
          sx={{
            display: "flex",
            paddingY: 1,
            paddingX: 2,
          }}
        >
          {usersInRoom.map((user) => (
            <UI.Box
              key={user.userId}
              onClick={() => dispatch(["ClickedUser", user])}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: `${(1 / 3) * 100}%`,
                padding: 1,
                overflowX: "hidden",
              }}
            >
              <UI.Avatar src={store.Profile[user.userId]?.avatarUrl} />
              <UI.Typography
                align="center"
                sx={{ marginBottom: -1 / 2, width: '100%' }}
                noWrap
              >
                {store.Profile[user.userId]?.username ?? "..."}
              </UI.Typography>
              {user.userId === room.hostId ? <UI.Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Host
              </UI.Typography> : (
                <UI.Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ opacity: 0 }}
                >
                  Guest
                </UI.Typography>
              )}
            </UI.Box>
          ))}
        </UI.Box>

        <UI.Box sx={{ paddingX: 2, paddingBottom: 2, display: "flex", gap: 2 }}>
          {currentUserId === room.hostId && <UI.Button
            fullWidth
          // variant="outlined"
          >
            Change Game
          </UI.Button>}
          <UI.Button
            fullWidth
            color="error"
            onClick={() => dispatch(["LeaveRoom", { userId: currentUserId }])}
          >
            Leave Room
          </UI.Button>
        </UI.Box>
      </UI.Drawer>
    </>
  )
}

export const ViewGameCard = ({
  gameName,
  onClick,
  disabled = false,
}: {
  gameName: GameName
  onClick: () => void
  disabled?: boolean
}) => {
  return (
    <UI.AspectRatio aspectRatio={1}>
      <UI.ButtonBase
        disabled={disabled}
        sx={{
          position: "relative",
          overflow: "hidden",
          opacity: disabled ? 0.3 : 1,
          borderRadius: 2,
        }}
        onClick={onClick}
      >
        <Game.CoverArt gameName={gameName} />

        <UI.Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <UI.Box
            sx={{
              width: "100%",
              padding: 1,
              paddingTop: 2,
              background: `linear-gradient(transparent, rgba(0, 0, 0, 0.6))`,
            }}
          >
            <UI.Typography
              color="white"
              align="left"
              variant="h4"
            >
              {Game.gameNameToString(gameName)}
            </UI.Typography>
          </UI.Box>
        </UI.Box>
      </UI.ButtonBase>
    </UI.AspectRatio>
  )
}

//
//
//
//
// Banner
//
//
//
//

const bannerHeight = 58

export const ViewBanner = ({
  currentUserId,
  route,
  model,
  dispatch,
  store,
}: {
  currentUserId: UserId.UserId
  route: Route.Model
  model: Model
  dispatch: (msg: Msg) => void
  store: Store.Model
}) => {
  if (route[0] === "GameRoom") {
    return <></>
  }

  const user = model.users[currentUserId]

  if (!user) {
    return <></>
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return <></>
  }

  const hostProfile = store.Profile[room.hostId]
  const roomCount = Object.values(model.users).filter(
    (user) => user.roomId === room.roomId,
  ).length

  return (
    <>
      <UI.ButtonBase
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "left",
          minHeight: bannerHeight,
          height: bannerHeight,
          maxHeight: bannerHeight,
          overflow: "hidden",
        }}
        onClick={() => dispatch(["ClickedBanner"])}
      >
        {room.game ? (
          <UI.Box sx={{ maxWidth: bannerHeight, width: "100%" }}>
            <UI.AspectRatio aspectRatio={1}>
              <Game.CoverArt gameName={room.game[0]} />
            </UI.AspectRatio>
          </UI.Box>
        ) : (
          <UI.Avatar
            variant="square"
            sx={{ width: bannerHeight, height: bannerHeight }}
            src={hostProfile?.avatarUrl ?? "..."}
          />
        )}

        <UI.Box sx={{ marginLeft: 2, overflow: "hidden" }}>
          <UI.Typography noWrap>
            {hostProfile ? `${hostProfile.username}'s room` : "..."}
          </UI.Typography>

          <UI.Typography
            variant="caption"
            color="text.secondary"
          >
            {`${roomCount} in room`}
          </UI.Typography>
        </UI.Box>

        <UI.Box sx={{ flex: 1 }} />

        <UI.Box sx={{ p: 2 }}>
          <UI.Icons.ChevronRight />
        </UI.Box>
      </UI.ButtonBase>

      <UI.Divider />
    </>
  )
}

export const ViewCard = ({
  roomId,
  hostId,
  gameName,
  store,
  gameRoom,
  onClick,
}: {
  roomId: RoomId.RoomId
  hostId: UserId.UserId
  gameName?: GameName
  store: Store.Model
  gameRoom: Model
  onClick: () => void
}) => {
  const hostProfile = store.Profile[hostId]
  const roomCount = Object.values(gameRoom.users).filter(
    (user) => user.roomId === roomId,
  ).length
  return (
    <UI.CardActionArea onClick={onClick}>
      <UI.Paper
        variant="outlined"
        sx={{ overflow: "hidden", display: "flex" }}
      >
        <UI.Box sx={{ width: 100 }}>
          <UI.AspectRatio aspectRatio={1}>
            {gameName ? (
              <Game.CoverArt gameName={gameName} />
            ) : (
              <UI.Avatar
                src={hostProfile?.avatarUrl ?? ""}
                variant="square"
                sx={{ width: "100%", height: "100%" }}
              />
            )}
          </UI.AspectRatio>
        </UI.Box>
        <UI.Divider orientation="vertical" />
        <UI.Box
          sx={{
            padding: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            overflow: "hidden",
          }}
        >
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
            {roomCount} in room
          </UI.Typography>
        </UI.Box>
      </UI.Paper>
    </UI.CardActionArea>
  )
}

// export const ViewCallToAction = ({
//   onCreateRoom,
// }: {
//   onCreateRoom: () => void
// }) => {
//   return (
//     <UI.Card
//       variant="outlined"
//       sx={{
//         padding: 4,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         flexDirection: "column",
//       }}
//     >
//       <UI.Typography
//         variant="h4"
//         align="center"
//       >
//         Create a room
//       </UI.Typography>
//       <UI.Typography
//         variant="subtitle2"
//         color="text.secondary"
//         align="center"
//         sx={{ marginBottom: 3 }}
//       >
//         Start playing games by creating a new game room.
//       </UI.Typography>
//       <UI.Button
//         onClick={onCreateRoom}
//         variant="contained"
//         fullWidth
//       >
//         Create Room
//       </UI.Button>
//     </UI.Card>
//   )
// }
