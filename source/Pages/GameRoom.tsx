import { Cmd, pipe, tag } from "../Core"
import { UserId } from "../Data"
import * as GameRoom from "../GameRoom"
import * as Games from "../Games"
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

export type Model = {
  drawer: "Opened" | "Closed"
}

export const init: [Model, Cmd.Cmd<Msg>] = [{ drawer: "Closed" }, Cmd.None]

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedLeave"]
  | ["ClickedBack"]
  | ["ClickedCreate"]
  | ["ClickedJoin", { roomId: GameRoom.RoomId.RoomId }]
  | ["ClickedAvatars"]
  | ["ClosedDrawer"]
  | ["ClickedUser", { userId: UserId.UserId }]
  | ["ClickedGame", { gameName: Games.Name }]
  | ["GameRoom", GameRoom.FrontendMsg]

type OutAction = GameRoom.Frontend.Action

export const update = (
  { currentUserId }: { currentUserId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedLeave": {
      return [
        model,
        Cmd.None,
        [["GameRoom", ["LeaveRoom", { userId: currentUserId }]]],
      ]
    }

    case "ClickedBack": {
      return [model, Route.back, []]
    }

    case "ClickedCreate": {
      const roomId = GameRoom.RoomId.generate()
      return [
        model,
        Cmd.None,
        [["GameRoom", ["CreateRoom", { userId: currentUserId, roomId }]]],
      ]
    }

    case "ClickedJoin": {
      const roomId = msg[1].roomId
      return [
        model,
        Cmd.None,
        [["GameRoom", ["JoinRoom", { userId: currentUserId, roomId }]]],
      ]
    }

    case "ClickedAvatars": {
      return [{ ...model, drawer: "Opened" }, Cmd.None, []]
    }

    case "ClosedDrawer": {
      return [{ ...model, drawer: "Closed" }, Cmd.None, []]
    }

    case "ClickedUser": {
      return [
        { ...model, drawer: "Closed" },
        Route.push({ type: "Profile", userId: msg[1].userId }),
        [],
      ]
    }

    case "ClickedGame": {
      const { gameName } = msg[1]

      return [
        model,
        Cmd.None,
        [["GameRoom", ["ChangeGame", { gameName, userId: currentUserId }]]],
      ]
    }

    case "GameRoom": {
      return [model, Cmd.None, [["GameRoom", ["Msg", msg[1]]]]]
    }
  }
}

//
//
//
// View
//
//
//

export const view = (
  {
    currentUserId,
    gameRoom,
    store,
  }: {
    gameRoom: GameRoom.FrontendModel
    currentUserId: UserId.UserId
    store: Store.Model
  },
  model: Model,
): UI.View<Msg> => {
  const user = gameRoom.rooms.users[currentUserId]

  if (!user) {
    return viewNotInRoom({ currentUserId, gameRoom, store }, model)
  }

  const room = gameRoom.rooms.rooms[user.roomId]

  if (!room) {
    return viewNotInRoom({ currentUserId, gameRoom, store }, model)
  }

  return viewInRoom({ currentUserId, gameRoom, room, store }, model)
}

export const viewNotInRoom =
  (
    {
      currentUserId,
      gameRoom,
      store,
    }: {
      gameRoom: GameRoom.FrontendModel
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
            onClick={() => dispatch(["ClickedCreate"])}
          >
            New Room
          </UI.Button>
        </UI.Box>
        <UI.List sx={{ overflowY: "scroll" }}>
          {Object.values(gameRoom.rooms.rooms).map((room) => {
            const profiles = Object.values(store.Profile).filter(
              (profile) =>
                gameRoom.rooms.users[profile.userId]?.roomId === room.roomId,
            )
            return (
              <UI.ListItemButton
                key={room.roomId}
                onClick={() => {
                  dispatch(["ClickedJoin", { roomId: room.roomId }])
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

export const viewInRoom = (
  {
    currentUserId,
    store,
    gameRoom,
    room,
  }: {
    store: Store.Model
    room: GameRoom.RoomModel
    gameRoom: GameRoom.FrontendModel
    currentUserId: UserId.UserId
  },
  model: Model,
): UI.View<Msg> => {
  if (room.game.type === "None") {
    return viewNotInGame(
      {
        currentUserId,
        store,
        gameRoom,
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
      gameRoom,
      game,
      room,
    },
    model,
  )
}

const viewInGame =
  (
    {
      currentUserId,
      store,
      gameRoom,
      game,
      room,
    }: {
      store: Store.Model
      room: GameRoom.RoomModel
      game: GameRoom.GameModel
      gameRoom: GameRoom.FrontendModel
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
            onClick={() => dispatch(["ClickedLeave"])}
          >
            Leave
          </UI.Button>
          <UI.Box sx={{ flex: 1 }} />

          {viewUsersInRoomAvatarGroup(
            { currentUserId, store, gameRoom, room },
            model,
          )(dispatch)}
        </UI.Toolbar>

        {pipe(
          GameRoom.Frontend.view({ store, currentUserId, room, game }),
          UI.map(tag("GameRoom")),
        )(dispatch)}
      </UI.FillBox>
    )
  }

const viewNotInGame =
  (
    {
      currentUserId,
      store,
      gameRoom,
      room,
    }: {
      store: Store.Model
      room: GameRoom.RoomModel
      gameRoom: GameRoom.FrontendModel
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
            onClick={() => dispatch(["ClickedLeave"])}
          >
            Leave
          </UI.Button>
          <UI.Box sx={{ flex: 1 }} />

          {viewUsersInRoomAvatarGroup(
            { currentUserId, store, gameRoom, room },
            model,
          )(dispatch)}
        </UI.Toolbar>

        <GameGrid
          onClick={(gameName) => dispatch(["ClickedGame", { gameName }])}
        />
      </UI.FillBox>
    )
  }

const viewUsersInRoomAvatarGroup =
  (
    {
      currentUserId,
      store,
      gameRoom,
      room,
    }: {
      store: Store.Model
      room: GameRoom.RoomModel
      gameRoom: GameRoom.FrontendModel
      currentUserId: UserId.UserId
    },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    const usersInRoom = Object.values(store.Profile).filter(
      (profile) =>
        gameRoom.rooms.users[profile.userId] &&
        gameRoom.rooms.users[profile.userId]?.roomId === room.roomId,
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
          open={model.drawer === "Opened"}
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
        icon={<Games.TicTacToe.Frontend.CoverArt />}
        label="Tic Tac Toe"
        onClick={() => onClick("TicTacToe")}
      />

      <GameCard
        icon={<Games.ConnectFour.Frontend.CoverArt id="" />}
        label="Connect Four"
        onClick={() => onClick("ConnectFour")}
      />

      <GameCard
        icon={<Games.Snake.Frontend.CoverArt />}
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
