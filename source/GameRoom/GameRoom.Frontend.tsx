import * as Bridge from "../Bridge"
import {
  Cmd,
  exhaustive,
  pipe,
  RemoteData,
  Result,
  Sub, Unit
} from "../Core"
import { RoomId, UserId } from "../Data"
import * as Games from "../Games"
import * as Route from "../Route"
import * as Snackbar from "../Snackbar"
import * as Store from "../Store"
import * as UI from "../UI"
import * as Game from "./Game/Game.Frontend"
import {
  FrontendModel,
  FrontendMsg,
  RoomModel,
  SharedModel,
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
    createRoom: RemoteData.NotAsked,
    joinRoom: RemoteData.NotAsked,
    leaveRoom: RemoteData.NotAsked,
    startGame: RemoteData.NotAsked,
    stopGame: RemoteData.NotAsked,
    modal: "Closed",
  },
  Cmd.None
  // Bridge.sendToBackend(["GameRoom", []]),
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

export const runAction = (
  { currentUserId }: { currentUserId: UserId.UserId },
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action[1][0]) {
    case "Msg": {
      const msg = action[1][1]
      return update({ currentUserId }, msg, model)
    }
  }
}

export const update = (
  { currentUserId }: { currentUserId: UserId.UserId },
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
      return [model, Route.push({ type: "Profile", userId: msg[1].userId })]
    }

    case "OpenedMenu": {
      return [{ ...model, modal: "MenuOpened" }, Cmd.None]
    }

    case "ClosedMenu": {
      return [{ ...model, modal: "Closed" }, Cmd.None]
    }

    case "CreateRoom": {
      return [
        { ...model, createRoom: RemoteData.Loading },
        Bridge.sendToBackend(["GameRoom", msg]),
      ]
    }

    case "JoinRoom": {
      return [
        { ...model, joinRoom: RemoteData.Loading },
        Bridge.sendToBackend(["GameRoom", msg]),
      ]
    }

    case "LeaveRoom": {
      return [
        { ...model, leaveRoom: RemoteData.Loading },
        Bridge.sendToBackend(["GameRoom", msg]),
      ]
    }

    case "StartGame": {
      return [
        { ...model, startGame: RemoteData.Loading },
        Bridge.sendToBackend(["GameRoom", msg]),
      ]
    }

    case "StopGame": {
      return [
        { ...model, stopGame: RemoteData.Loading },
        Bridge.sendToBackend(["GameRoom", msg]),
      ]
    }

    case "Game": {
      const user = model.users[currentUserId]

      if (!user) {
        return [model, Cmd.None]
      }

      const roomId = msg[1][0]

      if(user.roomId !== roomId) {
        return [model, Cmd.None]
      }

      const game = model.games[roomId]

      if(!game) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[1][1]

      const [gameNew, gameCmd] = Game.update(
        { currentUserId, currentRoomId: roomId, }, 
        gameMsg, 
        game
      )

      return [
        {
          ...model,
          games: {
            [roomId]: gameNew
          }
        },
        pipe(gameCmd, Cmd.map(msg => ["Game" as const, [roomId, msg]])),
      ]
    }

    case "ClickedBanner": {
      return [model, Route.push({ type: "GameRoom" })]
    }

    default:
      return exhaustive(msg[0])
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Sync": {
      const userIds = Object.values(msg[1].users).map((user) => user.userId)

      const action: OutAction = [
        "Store",
        ["Profile", ["FindMany", { userIds }]],
      ]
  
      const backendModel = msg[1]

      const modelNew: Model =  { 
        ...model,
        // @ts-ignore
        games: {
          ...model.games,

          // @ts-ignore
          ...backendModel.games
        },
        rooms: backendModel.rooms,
        users: backendModel.users 
      }
        
      return [modelNew, Cmd.None, [action]]
    }

    
    case 'Game': {
      const roomId = msg[1][0]
      
      const game = model.games[roomId]

      if(!game) {
        return [model, Cmd.None, []]
      }

      const gameMsg = msg[1][1]

      const [gameNew, gameCmd, actions] = Game.updateFromBackend(gameMsg, game)

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [roomId]: {
            // todo make it not compile if this isn't done
            // ...Game.init(gameNew[0]),
            ...gameNew
          }
        }
      }

      return [modelNew, pipe(gameCmd, Cmd.map(msg => ['Game' as 'Game', [roomId, msg]])), actions]
    }

    case "CreateRoomResulted": {
      return handleResult("createRoom", msg[1], model)
    }

    case "LeaveRoomResulted": {
      return  handleResult("leaveRoom", msg[1], model)
    }

    case "JoinRoomResulted": {
      return handleResult("joinRoom", msg[1], model)
    }

    case "StartGameResulted": {
      return handleResult("startGame", msg[1], model)
    }

    case "StopGameResulted": {
      return handleResult("stopGame", msg[1], model)
    }
  }
}

const handleResult = <
  TResult extends Result.Result<TProblem, SharedModel>,
  TProblem extends string,
>(
  remoteDataKey: keyof Model,
  result: TResult,
  model: Model,
): [Model, Cmd.Cmd<FrontendMsg>, OutAction[]] => {

  const actions: OutAction[] =
    result.type === "Err"
      ? [["Snackbar", ["Error", {message: result.error}]]]
      : []

  const modelNew:Model = result.type === 'Ok' ? {...model, ...result.value} : model

  const remoteData = pipe(
    result,
    RemoteData.fromResult,
    RemoteData.mapSuccess(() => Unit),
  )
  
  return [{...modelNew, [remoteDataKey]: remoteData}, Cmd.None, actions]
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

  return pipe(Game.subscriptions(game), Sub.map((msg): Msg => ["Game", [room.roomId, msg]]))
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

export const view = (
  {
    currentUserId,
    store,
  }: {
    currentUserId: UserId.UserId
    store: Store.Model
  },
  model: Model,
): UI.View<Msg> => {
  const user = model.users[currentUserId]

  if (!user) {
    return viewNotInRoom({ currentUserId, store }, model)
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return viewNotInRoom({ currentUserId, store }, model)
  }

  const game = model.games[room.roomId]

  if (!game) {
    return viewNotInGame(
      {
        currentUserId,
        store,
        room,
      },
      model,
    )
  }

  return (dispatch) => {
    return (
      <>
        {viewHeader({ store, room, currentUserId }, model)(dispatch)}
        {pipe(
          Game.view({ currentUserId, store }, game),
          UI.map((msg):Msg => ["Game", [room.roomId, msg]]), 
        )(dispatch)}
      </>
    )
  }
}

export const viewNotInRoom =
  (
    {
      currentUserId,
      store,
    }: {
      store: Store.Model
      currentUserId: UserId.UserId
    },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    const rooms = Object.values(model.rooms)
    return (
      <UI.FillBox>
        <UI.Header
          left={
            <UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />
          }
          title="Rooms"
        />
        <UI.Box sx={{ paddingX: 2 }}>
          <UI.Button
            fullWidth
            size="large"
            variant="contained"
            loading={model.createRoom.type === 'Loading'}
            onClick={() =>
              dispatch([
                "CreateRoom",
                { roomId: RoomId.generate(), userId: currentUserId },
              ])
            }
          >
            New Room
          </UI.Button>
          {rooms.length === 0 && (
            <UI.Typography
              sx={{ marginTop: 2 }}
              color="text.secondary"
            >
              No rooms found
            </UI.Typography>
          )}
        </UI.Box>

        <UI.LoadingBackdrop open={model.joinRoom.type === 'Loading'} />

        <UI.List sx={{ overflowY: "scroll" }}>
          {rooms.map((room) => {
            const profiles = Object.values(store.Profile).filter(
              (profile) =>
                model.users[profile.userId]?.roomId === room.roomId,
            )
            return (
              <UI.ListItemButton
                key={room.roomId}
                onClick={() => {
                  dispatch([
                    "JoinRoom",
                    {
                       userId: currentUserId, roomId: room.roomId },
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

const viewNotInGame =
  (
    {
      currentUserId,
      store,
      room,
    }: {
      store: Store.Model
      room: RoomModel
      currentUserId: UserId.UserId
    },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    return (
      <UI.FillBox>
        <UI.Toolbar>
          <UI.Button
            sx={{ marginLeft: -1 }}
            onClick={() => dispatch(["LeaveRoom", { userId: currentUserId }])}
          >
            Leave
          </UI.Button>

          <UI.Box sx={{ flex: 1 }} />

          {viewUsersInRoomAvatarGroup({ store, room }, model)(dispatch)}
        </UI.Toolbar>

        <GameGrid
          onClick={(gameName) =>
            dispatch(["StartGame", { gameName, userId: currentUserId }])
          }
        />
      </UI.FillBox>
    )
  }

const viewHeader =
  (
    {
      store,
      room,
      currentUserId,
    }: {
      store: Store.Model
      room: RoomModel
      currentUserId: UserId.UserId
    },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    return (
      <UI.Toolbar>
        {viewButtonMenu({
          buttons: [
            {
              text: "Back",
              onClick: ["ClickedBack"],
              icon: <UI.Icons.ChevronLeft />,
            },
            {
              text: "Leave Room",
              onClick: ["LeaveRoom", { userId: currentUserId }],
              icon: <UI.Icons.ExitToApp sx={{ transform: "rotate(180deg)" }} />,
            },
            {
              hidden: currentUserId !== room.hostId,
              text: "Stop Game",
              onClick: ["StopGame", { userId: currentUserId }],
              icon: <UI.Icons.Close />,
            },
          ],
          isOpen: model.modal === "MenuOpened",
          onOpen: ["OpenedMenu"],
          onClose: ["ClosedMenu"],
        })(dispatch)}

        <UI.Box sx={{ flex: 1 }} />

        {viewUsersInRoomAvatarGroup({ store, room }, model)(dispatch)}
      </UI.Toolbar>
    )
  }

const menuButtonId = "menuButtonId"

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
    return (
      <>
        <UI.IconButton
          edge="start"
          id={menuButtonId}
          onClick={() => dispatch(onOpen)}
        >
          <UI.Icons.Menu />
        </UI.IconButton>

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

    return (
      <>
        <UI.AvatarGroup onClick={() => dispatch(["ClickedAvatars"])}>
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
          {usersInRoom.map((item) => (
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
        </UI.Drawer>
      </>
    )
  }

const GameGrid = ({ onClick }: { onClick: (gameName: Games.Name) => void }) => {
  return (
    <UI.Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        overflowY: "scroll",
      }}
    >
      <GameCard
        icon={<Games.TicTacToe.CoverArt />}
        label="Tic Tac Toe"
        onClick={() => onClick("TicTacToe")}
      />

      <GameCard
        icon={<Games.ConnectFour.CoverArt id="" />}
        label="Connect Four"
        onClick={() => onClick("ConnectFour")}
      />

      <GameCard
        icon={<Games.Snake.CoverArt />}
        label="Snake"
        onClick={() => onClick("Snake")}
      />
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
            fontWeight={800}
            variant="h6"
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

const bannerHeight = 56

export const viewBanner =
  (
    {
      currentUserId,
      route,
    }: {
      currentUserId: UserId.UserId
      route: Route.Route
    },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    if (route.type === "GameRoom") {
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
      <UI.Paper
        variant="outlined"
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          height: bannerHeight,
          padding: 0,
          margin: 0,
          // animation: UI.pulseAnimation,
        }}
      >
        <UI.ButtonBase
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            textAlign: "left",
            height: bannerHeight,
          }}
          onClick={() => dispatch(["ClickedBanner"])}
        >
          {game ? (
            <UI.Box sx={{ width: bannerHeight }}>
              <UI.AspectRatio aspectRatio={[1, 1]}>
                <Games.CoverArt gameName={game[0]} />
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
      </UI.Paper>
    )
  }


  