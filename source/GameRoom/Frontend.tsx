import { sendToBackend } from "../Bridge/Frontend"
import { Cmd, exhaustive, pipe, RemoteData, tag, Unit } from "../Core"
import { UserId } from "../Data"
import * as Games from "../Games"
import * as Route from "../Route"
import * as Snackbar from "../Snackbar"
import * as Store from "../Store"
import * as UI from "../UI"
import * as RoomId from "./RoomId"
import {
  FrontendModel,
  FrontendMsg,
  GameModel,
  initRooms,
  RoomModel,
  ToFrontend,
} from "./Types"
import * as Game from "./Game"

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
    rooms: initRooms,
    createRoom: RemoteData.NotAsked,
    joinRoom: RemoteData.NotAsked,
    leaveRoom: RemoteData.NotAsked,
    startGame: RemoteData.NotAsked,
    stopGame: RemoteData.NotAsked,
    modal: "Closed",
  },
  sendToBackend(["GameRoom", ["Init"]]),
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
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedBack": {
      return [model, Route.back]
    }

    case "ClickedAvatars": {
      return [{ ...model, modal: "DrawerOpened" }, Cmd.None]
    }

    case "ClosedDrawer": {
      return [{ ...model, modal: "Closed" }, Cmd.None]
    }

    case "ClickedUser": {
      return [
        { ...model, modal: "Closed" },
        Route.push({ type: "Profile", userId: msg[1].userId }),
      ]
    }

    case "OpenedMenu": {
      return [{ ...model, modal: "MenuOpened" }, Cmd.None]
    }

    case "ClosedMenu": {
      return [{ ...model, modal: "Closed" }, Cmd.None]
    }

    case "CreateRoom": {
      return [
        { ...model, modal: "Closed", createRoom: RemoteData.Loading },
        sendToBackend(["GameRoom", msg]),
      ]
    }

    case "JoinRoom": {
      return [
        { ...model, modal: "Closed", joinRoom: RemoteData.Loading },
        sendToBackend(["GameRoom", msg]),
      ]
    }

    case "LeaveRoom": {
      return [
        { ...model, modal: "Closed", leaveRoom: RemoteData.Loading },
        sendToBackend(["GameRoom", msg]),
      ]
    }

    case "StartGame": {
      return [
        { ...model, modal: "Closed", startGame: RemoteData.Loading },
        sendToBackend(["GameRoom", msg]),
      ]
    }

    case "StopGame": {
      return [
        { ...model, modal: "Closed", stopGame: RemoteData.Loading },
        sendToBackend(["GameRoom", msg]),
      ]
    }

    case "Game": {
      return [model, Cmd.None]
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

      return [{ ...model, rooms: msg[1] }, Cmd.None, [action]]
    }

    case "CreateRoomResulted": {
      const createRoom = pipe(
        msg[1],
        RemoteData.fromResult,
        RemoteData.mapSuccess(() => Unit),
      )

      const actions: OutAction[] =
        createRoom.type === "Failure"
          ? [
              [
                "Snackbar",
                [
                  "Enqueue",
                  {
                    variant: "Error",
                    message: createRoom.problem,
                  },
                ],
              ],
            ]
          : []

      const cmd: Cmd.Cmd<Msg> =
        createRoom.type === "Success"
          ? Route.replace({ type: "GameRoom" })
          : Cmd.None

      return [{ ...model, createRoom }, cmd, actions]
    }

    case "LeaveRoomResulted": {
      const leaveRoom = pipe(
        msg[1],
        RemoteData.fromResult,
        RemoteData.mapSuccess(() => Unit),
      )

      const actions: OutAction[] =
        leaveRoom.type === "Failure"
          ? [
              [
                "Snackbar",
                [
                  "Enqueue",
                  {
                    variant: "Error",
                    message: leaveRoom.problem,
                  },
                ],
              ],
            ]
          : []

      return [{ ...model, leaveRoom }, Cmd.None, actions]
    }

    case "JoinRoomResulted": {
      const joinRoom = pipe(
        msg[1],
        RemoteData.fromResult,
        RemoteData.mapSuccess(() => Unit),
      )

      const actions: OutAction[] =
        joinRoom.type === "Failure"
          ? [
              [
                "Snackbar",
                [
                  "Enqueue",
                  {
                    variant: "Error",
                    message: joinRoom.problem,
                  },
                ],
              ],
            ]
          : []

      return [{ ...model, joinRoom }, Cmd.None, actions]
    }

    case "StartGameResulted": {
      const startGame = pipe(
        msg[1],
        RemoteData.fromResult,
        RemoteData.mapSuccess(() => Unit),
      )

      const actions: OutAction[] =
        startGame.type === "Failure"
          ? [
              [
                "Snackbar",
                [
                  "Enqueue",
                  {
                    variant: "Error",
                    message: startGame.problem,
                  },
                ],
              ],
            ]
          : []

      return [{ ...model, startGame: startGame }, Cmd.None, actions]
    }

    case "StopGameResulted": {
      const stopGame = pipe(
        msg[1],
        RemoteData.fromResult,
        RemoteData.mapSuccess(() => Unit),
      )

      const actions: OutAction[] =
        stopGame.type === "Failure"
          ? [
              [
                "Snackbar",
                [
                  "Enqueue",
                  {
                    variant: "Error",
                    message: stopGame.problem,
                  },
                ],
              ],
            ]
          : []

      return [{ ...model, stopGame }, Cmd.None, actions]
    }
  }
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
  const user = model.rooms.users[currentUserId]

  if (!user) {
    return viewNotInRoom({ currentUserId, store }, model)
  }

  const room = model.rooms.rooms[user.roomId]

  if (!room) {
    return viewNotInRoom({ currentUserId, store }, model)
  }

  if (room.game.type === "None") {
    return viewNotInGame(
      {
        currentUserId,
        store,
        room,
      },
      model,
    )
  }

  const game = room.game.value

  return viewInGame(
    {
      currentUserId,
      store,
      game,
      room,
    },
    model,
  )
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
            onClick={() =>
              dispatch([
                "CreateRoom",
                { roomId: RoomId.generate(), userId: currentUserId },
              ])
            }
          >
            New Room
          </UI.Button>
        </UI.Box>
        <UI.List sx={{ overflowY: "scroll" }}>
          {Object.values(model.rooms.rooms).map((room) => {
            const profiles = Object.values(store.Profile).filter(
              (profile) =>
                model.rooms.users[profile.userId]?.roomId === room.roomId,
            )
            return (
              <UI.ListItemButton
                key={room.roomId}
                onClick={() => {
                  dispatch([
                    "JoinRoom",
                    { userId: currentUserId, roomId: room.roomId },
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

export const viewInGame =
  (
    {
      currentUserId,
      store,
      room,
      game,
    }: {
      currentUserId: UserId.UserId
      store: Store.Model
      room: RoomModel
      game: GameModel
    },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    switch (game[0]) {
      case "ConnectFour": {
        return pipe(
          Game.ConnectFour.Frontend.view(game[1]),
          UI.map(tag("ConnectFour")),
          UI.map(tag("Game")),
        )(dispatch)
      }

      case "Snake": {
        return (
          <UI.FillBox>
            {viewHeader({ currentUserId, room, store }, model)(dispatch)}
            <Games.Snake.ViewBoard
              model={game[1]}
              dispatch={() => {}}
            />
          </UI.FillBox>
        )
      }

      case "TicTacToe": {
        return (
          <UI.FillBox>
            {viewHeader({ currentUserId, room, store }, model)(dispatch)}

            <Games.TicTacToe.ViewBoard
              board={game[1].board}
              onClick={() => {}}
            />
          </UI.FillBox>
        )
      }
    }
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
              text: "Leave",
              onClick: ["LeaveRoom", { userId: currentUserId }],
            },
            {
              hidden: currentUserId !== room.hostId,
              text: "Stop Game",
              onClick: ["StopGame", { userId: currentUserId }],
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
    buttons: { hidden?: boolean; text: string; onClick: Msg }[]
    onClose: Msg
    onOpen: Msg
    isOpen: boolean
  }): UI.View<Msg> =>
  (dispatch) => {
    const [first, second] = buttons.filter((button) => !button.hidden)

    if (!first) {
      return <></>
    }

    if (!second) {
      return (
        <UI.Button
          sx={{ marginLeft: -1 }}
          size="large"
          key={first.text}
          onClick={() => {
            dispatch(first.onClick)
          }}
        >
          {first.text}
        </UI.Button>
      )
    }

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
          {buttons.map((button) => (
            <UI.Button
              size="large"
              key={button.text}
              fullWidth
              onClick={() => {
                dispatch(button.onClick)
              }}
            >
              {button.text}
            </UI.Button>
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
        model.rooms.users[profile.userId] &&
        model.rooms.users[profile.userId]?.roomId === room.roomId,
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
