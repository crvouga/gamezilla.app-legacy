import { Cmd, exhaustive, pipe, RemoteData, Sub, tagCmd, Unit } from "../Core"
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
  RoomModel,
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
    games: {},
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

      const game = model.games[roomId]

      if (!game) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.update(
        { currentUserId, currentRoomId: roomId, sendToBackend: msg => sendToBackend(['Games', roomId, msg]), },
        gameMsg,
        game,
      )

      return [
        {
          ...model,
          games: {
            [roomId]: gameNew,
          },
        },
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

      const [synced, syncedCmd] = sync({
        backendModel: msg[1],
        frontendModel: model,
        sendToBackend
      })

      return [synced, syncedCmd, actions]
    }

    case "Games": {
      const roomId = msg[1]

      const game = model.games[roomId]

      if (!game) {
        return [model, Cmd.None, []]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd, actions] = Game.updateFromBackend({ sendToBackend: msg => sendToBackend(['Games', roomId, msg]) }, gameMsg, game)

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [roomId]: gameNew,
        },
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

  const [synced, syncedCmd] = sync({
    frontendModel: model,
    backendModel: result.value,
    sendToBackend
  })

  const modelNew: Model = {
    ...synced,
    requests: {
      ...synced.requests,
      [requestKey]: remoteData
    },
  }

  return [modelNew, syncedCmd, actions]
}

const sync = ({
  frontendModel,
  backendModel,
  sendToBackend
}: {
  sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>,
  frontendModel: FrontendModel,
  backendModel: BackendModel
}): [FrontendModel, Cmd.Cmd<FrontendMsg>] => {

  const init: [FrontendModel['games'], Cmd.Cmd<FrontendMsg>] = [{}, Cmd.None]

  const [gamesNew, gamesCmd] = Object
    .entries(backendModel.games)
    .reduce(
      ([games, cmd], [roomId, backendGame]) => {
        if (!RoomId.is(roomId)) {
          return [games, cmd]
        }

        const frontendGame = frontendModel.games[roomId]

        if (frontendGame) {
          const merged = Game.mergeWithBackend({ sendToBackend: msg => sendToBackend(['Games', roomId, msg]), frontendModel: frontendGame, backendModel: backendGame })

          return [
            {
              ...games,
              [roomId]: merged[0]
            },
            Cmd.batch([
              cmd,
              pipe(merged[1], Cmd.map((msg): Msg => ['Games', roomId, msg]))
            ])
          ]
        }

        const [gameInit, gameCmd] = Game.init({
          gameName: backendGame[0],
          sendToBackend: (msg) => sendToBackend(['Games', roomId, msg])
        })

        const merged = Game.mergeWithBackend({
          sendToBackend: msg => sendToBackend(['Games', roomId, msg]),
          frontendModel: gameInit,
          backendModel: backendGame,
        })

        return [
          {
            ...games,
            [roomId]: merged[0]
          },
          Cmd.batch([
            cmd,
            pipe(merged[1], Cmd.map((msg): Msg => ["Games", roomId, msg])),
            pipe(gameCmd, Cmd.map((msg): Msg => ["Games", roomId, msg]))
          ])
        ]

      },
      init
    )

  return [
    {
      ...frontendModel,
      rooms: backendModel.rooms,
      users: backendModel.users,
      games: gamesNew
    },
    gamesCmd
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

  const game = model.games[room.roomId]

  if (!game) {
    return Sub.None
  }


  const intervalId = room.roomId

  return pipe(
    Game.subscriptions(`room-${intervalId}`, game),
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

  const game = model.games[room.roomId]

  if (!game) {
    return <ViewNotInGame
      currentUserId={currentUserId}
      store={store}
      room={room}
      model={model}
      dispatch={dispatch}
    />
  }


  return (
    <UI.FillBox>
      <UI.Header
        left={viewButtonMenu({
          buttons: [
            {
              text: "Leave Room",
              onClick: ["LeaveRoom", { userId: currentUserId }],
              icon: <UI.Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />,
            },
            {
              hidden: currentUserId !== room.hostId,
              text: "Close Game",
              onClick: ["CloseGame", { userId: currentUserId }],
              icon: <UI.Icons.Close />,
            },
          ],
          isOpen: model.modal === "MenuOpened",
          onOpen: ["OpenedMenu"],
          onClose: ["ClosedMenu"],
        })(dispatch)}

        title={game[0]}

        right={viewUsersInRoomAvatarGroup({ store, room }, model)(dispatch)}
      />

      <Game.View
        currentUserId={currentUserId}
        store={store}
        dispatch={(msg) => dispatch(["Games", room.roomId, msg])}
        model={game}
      />
    </UI.FillBox>
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
      room: RoomModel
      currentUserId: UserId.UserId
      model: Model,
      dispatch: (msg: Msg) => void
    },
  ) => {
    return (
      <UI.FillBox>
        <UI.Toolbar>
          {viewButtonMenu({
            buttons: [
              {
                text: "Leave Room",
                onClick: ["LeaveRoom", { userId: currentUserId }],
                icon: <UI.Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />,
              },
            ],
            isOpen: model.modal === "MenuOpened",
            onOpen: ["OpenedMenu"],
            onClose: ["ClosedMenu"],
          })(dispatch)}

          <UI.Box sx={{ flex: 1 }} />

          {viewUsersInRoomAvatarGroup({ store, room }, model)(dispatch)}
        </UI.Toolbar>

        <GameGrid
          onClick={(gameName) =>
            dispatch(["OpenGame", { gameName, userId: currentUserId }])
          }
        />
      </UI.FillBox>
    )
  }


const viewButtonMenu =
  ({
    buttons,
    onClose,
    isOpen,
    onOpen,
  }: {
    buttons: {
      hidden?: boolean
      text: string
      onClick: Msg
      icon?: UI.ViewNode
    }[]
    onClose: Msg
    onOpen: Msg
    isOpen: boolean
  }): UI.View<Msg> =>
    (dispatch) => {
      const menuButtonId = "menuButtonId"
      return (
        <>
          <UI.Button
            // startIcon={<UI.Icons.MoreVert />}
            sx={{ marginLeft: -2 }}
            id={menuButtonId}
            onClick={() => dispatch(onOpen)}
          >
            Menu
          </UI.Button>

          <UI.Menu
            anchorEl={document.getElementById(menuButtonId)}
            open={isOpen}
            onClose={() => dispatch(onClose)}
          >
            {buttons
              .filter((button) => !Boolean(button.hidden))
              .map((button) => (
                <UI.MenuItem
                  key={button.text}
                  onClick={() => {
                    dispatch(button.onClick)
                  }}
                >
                  {button.icon && (
                    <UI.ListItemIcon>{button.icon}</UI.ListItemIcon>
                  )}
                  <UI.ListItemText>{button.text}</UI.ListItemText>
                </UI.MenuItem>
              ))}
          </UI.Menu>
        </>
      )
    }

const viewUsersInRoomAvatarGroup =
  (
    {
      store,
      room,
    }: {
      store: Store.Model
      room: RoomModel
    },
    model: Model,
  ): UI.View<Msg> =>
    (dispatch) => {
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

const GameGrid = ({ onClick }: { onClick: (gameName: GameName) => void }) => {
  return (
    <UI.Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        overflowY: "scroll",
      }}
    >
      <GameCard
        icon={<Game.CoverArt gameName="Chess" />}
        label="Chess"
        onClick={() => onClick("Chess")}
      />

      <GameCard
        icon={<Game.CoverArt gameName="Snake" />}
        label="Snake"
        onClick={() => onClick("Snake")}
      />

      {/* <GameCard
        icon={<Game.CoverArt gameName="TicTacToe" />}
        label="Tic Tac Toe"
        onClick={() => onClick("TicTacToe")}
      />

      <GameCard
        icon={<Game.CoverArt gameName="ConnectFour" />}
        label="Connect Four"
        onClick={() => onClick("ConnectFour")}
      /> */}


    </UI.Box>
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
            variant="h5"
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



    const game = model.games[room.roomId]

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
