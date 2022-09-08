import { Cmd, exhaustive, Option, pipe, RemoteData, Sub, tagCmd, Unit } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Route from "../Route"
import * as Snackbar from "../Snackbar"
import * as Store from "../Store"
import * as UI from "../UI"
import * as Game from "./Game.Frontend"
import { GameName } from "./Game.Types"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg, Response,
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
    }
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

type OutAction = Snackbar.Action | Store.Action

//
//
//
// Update
//
//
//

export const update = (
  { currentUserId, sendToBackend }: { currentUserId: UserId.UserId, sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> },
  msg: Msg,
  modelPrev: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const model: Model = { ...modelPrev, modal: "Closed" }

  switch (msg[0]) {
    case "ClickedBack": {
      return [model, Route.back]
    }

    case "ClickedAvatars": {
      return [{ ...model, modal: "DrawerOpened" }, Cmd.None]
    }

    case "ClosedDrawer": {
      return [model, Cmd.None]
    }

    case "ClickedUser": {
      return [model, Route.push(["Profile", msg[1].userId])]
    }

    case "OpenedMenu": {
      return [{ ...model, modal: "MenuOpened" }, Cmd.None]
    }

    case "ClosedMenu": {
      return [{ ...model, modal: "Closed" }, Cmd.None]
    }

    case "ClickedBanner": {
      return [model, Route.push(["GameRoom"])]
    }

    case 'JoinRoom':
    case "LeaveRoom":
    case "CreateRoom":
    case "OpenGame":
    case "CloseGame": {
      return [
        {
          ...model,
          requests: {
            ...model.requests,
            [msg[0]]: RemoteData.Loading
          }
        },
        sendToBackend(msg)
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

      if (room.game.type === 'None') {
        return [model, Cmd.None]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.update(
        { currentUserId, currentRoomId: roomId, sendToBackend: msg => sendToBackend(['Games', roomId, msg]), },
        gameMsg,
        room.game.value,
      )

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomId]: {
            ...room,
            game: Option.Some(gameNew)
          }
        }
      }

      return [
        modelNew,
        pipe(
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
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> },
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
        sendToBackend
      })

      return [synced, syncedCmd, actions]
    }

    case "Games": {
      const roomId = msg[1]

      const room = model.rooms[roomId]

      if (!room) {
        return [model, Cmd.None, []]
      }

      if (room.game.type === 'None') {
        return [model, Cmd.None, []]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd, actions] = Game.updateFromBackend({ sendToBackend: msg => sendToBackend(['Games', roomId, msg]) }, gameMsg, room.game.value)

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomId]: {
            ...room,
            game: Option.Some(gameNew)
          }
        }
      }

      return [
        modelNew,
        pipe(
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
      return updateResponse({ sendToBackend, msg, model }, "JoinRoom")
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
  { sendToBackend, msg, model }: { msg: Response, model: Model, sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> },
  requestKey: keyof Model['requests'],
): [Model, Cmd.Cmd<FrontendMsg>, OutAction[]] => {

  const result = msg[1]

  const actions: OutAction[] =
    result.type === "Err"
      ? [["Snackbar", { message: result.error, variant: "Error" }]]
      : []

  const remoteData = pipe(
    result,
    RemoteData.fromResult,
    RemoteData.map(() => Unit),
  )

  if (result.type === 'Err') {
    return [
      {
        ...model,
        requests: {
          ...model.requests,
          [requestKey]: remoteData
        },
      },
      Cmd.None,
      [["Snackbar", { message: result.error, variant: "Error" }]]
    ]
  }

  const [merged, mergedCmd] = mergeWithBackendModel({
    frontendModel: model,
    backendModel: result.value,
    sendToBackend
  })

  const modelNew: Model = {
    ...merged,
    requests: {
      ...merged.requests,
      [requestKey]: remoteData
    },
  }

  return [modelNew, mergedCmd, actions]
}

const mergeWithBackendModel = ({
  frontendModel,
  backendModel,
  sendToBackend
}: {
  sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>,
  frontendModel: FrontendModel,
  backendModel: BackendModel
}): [FrontendModel, Cmd.Cmd<FrontendMsg>] => {

  const [roomsNew, roomsCmd] = Object
    .entries(backendModel.rooms)
    .reduce<[FrontendModel['rooms'], Cmd.Cmd<FrontendMsg>]>(
      ([rooms, cmd], [roomId, backendRoom]) => {
        if (!RoomId.is(roomId)) {
          return [rooms, cmd]
        }

        if (backendRoom.game.type === 'None') {
          return [
            {
              ...rooms,
              [roomId]: {
                events: backendRoom.events,
                hostId: backendRoom.hostId,
                roomId: backendRoom.roomId,
                game: Option.None,
              }
            },
            cmd
          ]
        }

        const backendGame = backendRoom.game.value

        const frontendRoom = frontendModel.rooms[roomId]

        if (!frontendRoom) {
          const initial = Game.init({ gameName: backendGame[0], sendToBackend: msg => sendToBackend(['Games', roomId, msg]) })
          const merged = Game.mergeWithBackend({ backendModel: backendGame, frontendModel: initial[0], sendToBackend: msg => sendToBackend(['Games', roomId, msg]) })
          return [
            {
              ...rooms,
              [roomId]: {
                events: backendRoom.events,
                hostId: backendRoom.hostId,
                roomId: backendRoom.roomId,
                game: Option.Some(merged[0]),
              }
            },
            Cmd.batch([
              cmd,
              pipe(initial[1], Cmd.map((msg): Msg => ['Games', roomId, msg])),
              pipe(merged[1], Cmd.map((msg): Msg => ['Games', roomId, msg]))
            ])
          ]
        }

        if (frontendRoom.game.type === 'None') {
          const initial = Game.init({ gameName: backendGame[0], sendToBackend: msg => sendToBackend(['Games', roomId, msg]) })
          const merged = Game.mergeWithBackend({ backendModel: backendGame, frontendModel: initial[0], sendToBackend: msg => sendToBackend(['Games', roomId, msg]) })
          return [
            {
              ...rooms,
              [roomId]: {
                events: backendRoom.events,
                hostId: backendRoom.hostId,
                roomId: backendRoom.roomId,
                game: Option.Some(merged[0]),
              }
            },
            Cmd.batch([
              cmd,
              pipe(initial[1], Cmd.map((msg): Msg => ['Games', roomId, msg])),
              pipe(merged[1], Cmd.map((msg): Msg => ['Games', roomId, msg]))
            ])
          ]
        }

        const frontendGame = frontendRoom.game.value


        const merged = Game.mergeWithBackend({ backendModel: backendGame, frontendModel: frontendGame, sendToBackend: msg => sendToBackend(['Games', roomId, msg]) })

        return [
          {
            ...rooms,
            [roomId]: {
              events: backendRoom.events,
              hostId: backendRoom.hostId,
              roomId: backendRoom.roomId,
              game: Option.Some(merged[0]),
            }
          },
          Cmd.batch([
            cmd,
            pipe(merged[1], Cmd.map((msg): Msg => ['Games', roomId, msg]))
          ])
        ]
      },
      [{}, Cmd.None]
    )

  return [
    {
      modal: frontendModel.modal,
      requests: frontendModel.requests,
      rooms: roomsNew,
      users: backendModel.users,
    },
    roomsCmd
  ]
}



export const runAction = (
  { currentUserId, sendToBackend }: { currentUserId: UserId.UserId, sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> },
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

  if (room.game.type === 'None') {
    return Sub.None
  }


  const intervalId = room.roomId

  return pipe(
    Game.subscriptions(`room-${intervalId}`, room.game.value),
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

export const View = (
  {
    currentUserId,
    store,
    model,
    dispatch
  }: {
    currentUserId: UserId.UserId
    store: Store.Model
    model: Model,
    dispatch: (msg: Msg) => void
  },
) => {
  const user = model.users[currentUserId]

  if (!user) {
    return <ViewNotInRoom currentUserId={currentUserId} store={store} model={model} dispatch={dispatch} />
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return <ViewNotInRoom currentUserId={currentUserId} store={store} model={model} dispatch={dispatch} />
  }

  const game = room.game

  if (game.type === 'None') {
    return <ViewNotInGame
      currentUserId={currentUserId}
      store={store}
      room={room}
      model={model}
      dispatch={dispatch}
    />
  }

  return (
    <Game.View
      onCloseGame={() => dispatch(['CloseGame', { userId: currentUserId }])}
      currentUserId={currentUserId}
      store={store}
      dispatch={(msg) => dispatch(["Games", room.roomId, msg])}
      model={game.value}
      roomAvatarGroup={<ViewGameRoomAvatarGroup store={store} room={room} model={model} dispatch={dispatch} />}
    />
  )

}

export const ViewNotInRoom =
  (
    {
      currentUserId,
      store,
      model,
      dispatch
    }: {
      store: Store.Model
      currentUserId: UserId.UserId
      model: Model,
      dispatch: (msg: Msg) => void
    },
  ) => {
    const rooms = Object.values(model.rooms)
    return (
      <UI.FillBox>
        <UI.Header title="Rooms" />

        <UI.Box sx={{ paddingX: 2 }}>
          <UI.Button
            fullWidth
            size="large"
            variant="contained"
            loading={model.requests.CreateRoom.type === "Loading"}
            onClick={() =>
              dispatch([
                "CreateRoom",
                { roomId: RoomId.generate(), userId: currentUserId },
              ])
            }
          >
            Start Room
          </UI.Button>
          {rooms.length === 0 && (
            <UI.Typography
              sx={{ marginTop: 2 }}
              color="text.secondary"
            >
              No active rooms
            </UI.Typography>
          )}
        </UI.Box>

        <UI.LoadingBackdrop open={model.requests.JoinRoom.type === "Loading"} />

        <UI.List sx={{ overflowY: "scroll" }}>
          {rooms.map((room) => {
            const profiles = Object.values(store.Profile).filter(
              (profile) => model.users[profile.userId]?.roomId === room.roomId,
            )
            return (
              <UI.ListItemButton
                key={room.roomId}
                onClick={() => {
                  dispatch([
                    "JoinRoom",
                    {
                      userId: currentUserId,
                      roomId: room.roomId,
                    },
                  ])
                }}
              >
                <UI.ListItemAvatar>
                  <UI.AvatarGroup>
                    {profiles.map((item) => (
                      <UI.Avatar
                        key={item.userId}
                        src={item.avatarUrl}
                      />
                    ))}
                  </UI.AvatarGroup>
                </UI.ListItemAvatar>
                <UI.ListItemText
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { wordWrap: "break-word" },
                  }}
                  primary={profiles.map((item) => item.username).join(",")}
                />
              </UI.ListItemButton>
            )
          })}
        </UI.List>
      </UI.FillBox>
    )
  }

const ViewNotInGame =
  (
    {
      currentUserId,
      store,
      room,
      model,
      dispatch,
    }: {
      store: Store.Model
      room: {
        roomId: RoomId.RoomId,
        hostId: UserId.UserId
      }
      currentUserId: UserId.UserId
      model: Model,
      dispatch: (msg: Msg) => void
    },
  ) => {
    const onOpen = (gameName: GameName) => {
      dispatch(['OpenGame', { gameName, userId: currentUserId }])
    }
    return (
      <UI.FillBox>
        <UI.Toolbar>
          <UI.Button sx={{ marginLeft: -1 }} startIcon={<UI.Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />} onClick={() => dispatch(['LeaveRoom', { userId: currentUserId }])}>
            Leave Room
          </UI.Button>

          <UI.Box sx={{ flex: 1 }} />

          <ViewGameRoomAvatarGroup store={store} room={room} model={model} dispatch={dispatch} />
        </UI.Toolbar>

        <UI.Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            overflowY: "scroll",
            gap: 2,
            padding: 2
          }}
        >
          <GameCard
            icon={<Game.CoverArt gameName="Chess" />}
            label="Chess"
            onClick={() => onOpen("Chess")}
          />

          {/* <GameCard
        icon={<Game.CoverArt gameName="Snake" />}
        label="Snake"
        onClick={() => onOpen("Snake")}
      /> */}

          <GameCard
            icon={<Game.CoverArt gameName="TicTacToe" />}
            label="Tic Tac Toe"
            onClick={() => onOpen("TicTacToe")}
          />

          <GameCard
            icon={<Game.CoverArt gameName="ConnectFour" />}
            label="Connect Four"
            onClick={() => onOpen("ConnectFour")}
          />


        </UI.Box>
      </UI.FillBox>
    )
  }


const ViewGameRoomAvatarGroup =
  (
    {
      store,
      room,
      model,
      dispatch,
    }: {
      store: Store.Model
      room: {
        roomId: RoomId.RoomId,
        hostId: UserId.UserId
      }
      model: Model,
      dispatch: (msg: Msg) => void
    },
  ) => {
    const usersInRoom = Object.values(store.Profile).filter(
      (profile) =>
        model.users[profile.userId] &&
        model.users[profile.userId]?.roomId === room.roomId,
    )

    const guests = usersInRoom.filter(item => item.userId !== room.hostId)
    const hosts = usersInRoom.filter(item => item.userId === room.hostId)

    return (
      <>
        <UI.AvatarGroup max={4} sx={{ marginRight: -1 }} onClick={() => dispatch(["ClickedAvatars"])}>
          {usersInRoom.map((profile) => (
            <UI.Avatar
              key={profile.userId}
              src={profile.avatarUrl}
            />
          ))}
        </UI.AvatarGroup>

        <UI.Drawer
          anchor="bottom"
          open={model.modal === "DrawerOpened"}
          onClose={() => dispatch(["ClosedDrawer"])}
        >
          <UI.List>
            <UI.ListSubheader>
              Host
            </UI.ListSubheader>
            {hosts.map((item) => (
              <UI.ListItemButton
                onClick={() => dispatch(["ClickedUser", item])}
                key={item.userId}
              >
                <UI.ListItemAvatar>
                  <UI.Avatar
                    key={item.userId}
                    src={item.avatarUrl}
                  />
                </UI.ListItemAvatar>
                <UI.ListItemText
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { wordWrap: "break-word" },
                  }}
                  primary={item.username}
                />
              </UI.ListItemButton>
            ))}

            {guests.length > 0 && (
              <>
                <UI.ListSubheader>
                  Guests
                </UI.ListSubheader>
                {guests.map((item) => (
                  <UI.ListItemButton
                    onClick={() => dispatch(["ClickedUser", item])}
                    key={item.userId}
                  >
                    <UI.ListItemAvatar>
                      <UI.Avatar
                        key={item.userId}
                        src={item.avatarUrl}
                      />
                    </UI.ListItemAvatar>
                    <UI.ListItemText
                      primaryTypographyProps={{
                        noWrap: true,
                        sx: { wordWrap: "break-word" },
                      }}
                      primary={item.username}
                    />
                  </UI.ListItemButton>
                ))}
              </>
            )}
          </UI.List>
        </UI.Drawer>
      </>
    )
  }

const GameCard = ({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) => {
  return (
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
      {icon}

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
            {label}
          </UI.Typography>
        </UI.Box>
      </UI.Box>
    </UI.ButtonBase>
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

export const ViewBanner =
  (
    {
      currentUserId,
      route,
      model,
      dispatch,
    }: {
      currentUserId: UserId.UserId
      route: Route.Model
      model: Model,
      dispatch: (msg: Msg) => void
    },
  ) => {

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

    if (room.game.type === 'None') {
      return <></>
    }

    const game = room.game.value

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
          {game ? (
            <UI.Box sx={{ maxWidth: bannerHeight }}>
              <UI.AspectRatio aspectRatio={1}>
                <Game.CoverArt gameName={game[0]} />
              </UI.AspectRatio>
            </UI.Box>
          ) : (
            <UI.Avatar
              variant="square"
              sx={{ width: bannerHeight, height: bannerHeight }}
            >
              <UI.Icons.Gamepad />
            </UI.Avatar>
          )}

          <UI.Box sx={{ marginLeft: 2 }}>
            {game ? (
              <>
                <UI.Typography
                  align="left"
                  variant="h6"
                  sx={{ marginBottom: -1 / 2 }}
                >
                  {Game.gameNameToString(game[0])}
                </UI.Typography>

                <UI.Typography
                  component="div"
                  align="left"
                  color="text.secondary"
                  variant="caption"
                >
                  Go to room
                </UI.Typography>
              </>
            ) : (
              <UI.Typography align="left">Go to room</UI.Typography>
            )}
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
