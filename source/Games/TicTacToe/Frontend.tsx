import { useLayoutEffect, useRef } from "react"
import * as Route from "../../Route"
import * as Store from "../../Store"
import * as UI from "../../UI"
import * as Board from "./Board"
import { sendToBackend } from "../../Bridge/Frontend"
import { Cmd, Result } from "../../Core"
import { FrontendModel, FrontendMsg, ToFrontend } from "./Types"
import * as Room from "./Room"

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
    opened: ["None"],
    rooms: {},
    users: {},
  },
  sendToBackend(["Games", ["TicTacToe", ["Init"]]]),
]

//
//
//
// Room View
//
//
//

type RoomView = {
  roomId: Room.RoomId
  board: Board.Board
  players: {
    X: RoomViewPlayer
    O: RoomViewPlayer
  }
  host: RoomViewUser
  users: RoomViewUser[]
}

type RoomViewPlayer = { type: "None" } | ({ type: "User" } & RoomViewUser)

type RoomViewUser = {
  username: string
  avatarUrl: string
  userId: string
}

type RoomViewProblem =
  | "missing_profiles"
  | "missing_room"
  | "missing_host"
  | "missing_player"

const toRoomView = ({
  roomId,
  model,
  store,
}: {
  roomId: Room.RoomId
  model: Model
  store: Store.Model
}): Result.Result<RoomViewProblem, RoomView> => {
  const usersInRoom = Object.values(model.users).filter(
    (user) => user.roomId === roomId,
  )

  const profiles = usersInRoom
    .map((user) => store.Profile[user.userId])
    .flatMap((profile) => (profile ? [profile] : []))

  if (profiles.length < usersInRoom.length) {
    return Result.Err("missing_profiles")
  }

  const room = model.rooms[roomId]

  if (!room) {
    return Result.Err("missing_room")
  }

  const host = profiles.find((profile) => profile.userId === room.hostId)

  if (!host) {
    return Result.Err("missing_host")
  }

  const xResult = toRoomPlayerView({ store, room, player: "X" })

  if (xResult.type === "Err") {
    return xResult
  }

  const oResult = toRoomPlayerView({ store, room, player: "O" })

  if (oResult.type == "Err") {
    return oResult
  }

  const roomView: RoomView = {
    roomId,
    board: room.board,
    players: {
      X: xResult.value,
      O: oResult.value,
    },
    host,
    users: profiles,
  }

  return Result.Ok(roomView)
}

const toRoomPlayerView = ({
  room,
  store,
  player,
}: {
  room: Room.Room
  store: Store.Model
  player: Board.Player
}): Result.Result<RoomViewProblem, RoomViewPlayer> => {
  const roomPlayer = room.players[player]

  if (roomPlayer.type === "None") {
    return Result.Ok(roomPlayer)
  }

  const profile = store.Profile[roomPlayer.userId]

  if (!profile) {
    return Result.Err("missing_player")
  }

  const roomViewPlayer: RoomViewPlayer = {
    type: "User",
    ...profile,
  }

  return Result.Ok(roomViewPlayer)
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = Store.Action

export const update = (
  { currentUserId }: { currentUserId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "StartPlaying":
      return [model, sendToBackend(["Games", ["TicTacToe", msg]])]

    case "StopPlaying":
      return [
        { ...model, opened: ["None"] },
        sendToBackend(["Games", ["TicTacToe", msg]]),
      ]

    case "PlayAgain":
      return [model, sendToBackend(["Games", ["TicTacToe", msg]])]

    case "RemovePlayer":
      return [model, sendToBackend(["Games", ["TicTacToe", msg]])]

    case "ClickedPlayer":
      return [{ ...model, opened: ["Player", msg[1]] }, Cmd.None]

    case "ClickedAvatars":
      return [{ ...model, opened: ["Users"] }, Cmd.None]

    case "ClosedDrawer":
      return [{ ...model, opened: ["None"] }, Cmd.None]

    case "LeaveRoom":
      return [model, sendToBackend(["Games", ["TicTacToe", msg]])]

    case "RestartGame": {
      return [model, sendToBackend(["Games", ["TicTacToe", msg]])]
    }

    case "ClickedUser":
      return [model, Route.push({ type: "Profile", userId: msg[1].userId })]

    case "JoinRoom":
      return [model, sendToBackend(["Games", ["TicTacToe", msg]])]

    case "CreateRoom":
      return [model, sendToBackend(["Games", ["TicTacToe", msg]])]

    case "ClickedBack":
      return [model, Route.back]

    case "Move":
      const { position } = msg[1]

      const result = Room.move({ userId: currentUserId, position }, model)

      const stateNew = result.type === "Err" ? {} : result.value

      return [
        {
          ...model,
          ...stateNew,
        },
        sendToBackend(["Games", ["TicTacToe", msg]]),
      ]
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Sync": {
      const userIds = Object.keys(msg[1].users)
      return [
        {
          ...model,
          // init: RemoteData.Success({}),
          rooms: msg[1].rooms,
          users: msg[1].users,
        },
        Cmd.None,
        [["Store", ["Profile", ["FindMany", { userIds }]]]],
      ]
    }

    case "PlayAgainResulted": {
      return [
        {
          ...model,
          //  playAgain: RemoteData.fromResult(msg[1])
        },
        Cmd.None,
        [],
      ]
    }

    case "RemovePlayerResulted": {
      return [model, Cmd.None, []]
    }

    case "StopPlayingResulted": {
      return [
        {
          ...model,
          //  quitPlaying: RemoteData.fromResult(msg[1])
        },
        Cmd.None,
        [],
      ]
    }

    case "StartPlayingResulted": {
      return [model, Cmd.None, []]
    }

    case "RestartGameResulted": {
      return [model, Cmd.None, []]
    }

    case "MoveResulted": {
      return [model, Cmd.None, []]
    }

    case "JoinRoomResulted": {
      return [
        {
          ...model,
          // joinRoom: RemoteData.fromResult(msg[1]),
        },
        Cmd.None,
        [],
      ]
    }

    case "LeaveRoomResulted": {
      return [
        {
          ...model,
          // leaveRoom: RemoteData.fromResult(msg[1]),
        },
        Cmd.None,
        [],
      ]
    }

    case "CreateRoomResulted":
      return [
        {
          ...model,
          // createRoom: RemoteData.fromResult(msg[1]),
        },
        Cmd.None,
        [],
      ]
  }
}

//
//
//
// View
//
//
//

export const view =
  (
    { currentUserId, store }: { currentUserId: string; store: Store.Model },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    const maybeCurrentRoom = Room.toRoom(currentUserId, model)

    switch (maybeCurrentRoom.type) {
      case "None":
        return (
          <ViewNotInRoom
            currentUserId={currentUserId}
            store={store}
            model={model}
            dispatch={dispatch}
          />
        )

      case "Some":
        const room = maybeCurrentRoom.value
        return (
          <ViewInRoom
            dispatch={dispatch}
            room={room}
            currentUserId={currentUserId}
            store={store}
            model={model}
          />
        )
    }
  }

const ViewNotInRoom = ({
  currentUserId,
  store,
  model,
  dispatch,
}: {
  currentUserId: string
  store: Store.Model
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  return (
    <UI.FillBox>
      <UI.Header
        left={<UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />}
        title="Tic Tac Toe"
      />

      <UI.Box sx={{ p: 2 }}>
        <UI.Button
          size="large"
          fullWidth
          // loading={model.createRoom.type === "Loading"}
          onClick={() => dispatch(["CreateRoom", { currentUserId }])}
          variant="contained"
        >
          New Room
        </UI.Button>
      </UI.Box>

      <UI.Box sx={{ paddingX: 2 }}>
        <UI.Typography variant="h5">Rooms</UI.Typography>

        {Object.values(model.rooms).length === 0 && (
          <UI.Typography sx={{ marginTop: 1 }} color="text.secondary">
            No rooms found.
          </UI.Typography>
        )}
      </UI.Box>

      <UI.List sx={{ overflowY: "scroll" }}>
        {Object.values(model.rooms)
          .map((room) => ({
            room,
            profiles: Object.values(store.Profile).filter(
              (profile) => model.users[profile.userId]?.roomId === room.roomId,
            ),
          }))
          .map(({ room, profiles }) => (
            <UI.ListItemButton
              key={room.roomId}
              onClick={() =>
                dispatch(["JoinRoom", { currentUserId, roomId: room.roomId }])
              }
            >
              <UI.ListItemAvatar>
                <UI.AvatarGroup>
                  {profiles.map((item) => (
                    <UI.Avatar key={item.userId} src={item.avatarUrl} />
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
          ))}
      </UI.List>
    </UI.FillBox>
  )
}

const ViewInRoom = ({
  currentUserId,
  room,
  store,
  model,
  dispatch,
}: {
  currentUserId: string
  room: Room.Room
  store: Store.Model
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const status = Room.toStatus(room)

  const statusMessage =
    status.type === "NotReady"
      ? status.status === "MissingBoth"
        ? "Missing Players"
        : status.status === "MissingO"
        ? "Missing O Player"
        : status.status === "MissingX"
        ? "Missing X Player"
        : ""
      : status.status.type === "Turn"
      ? `${status.status.turn} Turn`
      : status.status.type === "Tie"
      ? "GameOver"
      : `GameOver`

  const usersInRoom = Object.values(store.Profile).filter(
    (profile) =>
      model.users[profile.userId] &&
      model.users[profile.userId]?.roomId === room.roomId,
  )

  return (
    <>
      <UI.FillBox>
        <UI.Toolbar>
          <UI.Button
            // loading={model.leaveRoom.type === "Loading"}
            onClick={() => dispatch(["LeaveRoom", { currentUserId }])}
            sx={{ marginLeft: -1 }}
          >
            Leave
          </UI.Button>
          <UI.Box sx={{ flex: 1 }} />
          <UI.AvatarGroup
            onClick={() => dispatch(["ClickedAvatars"])}
            sx={{ marginRight: -1 }}
          >
            {usersInRoom.map((item) => (
              <UI.Avatar key={item.avatarUrl} src={item.avatarUrl} />
            ))}
          </UI.AvatarGroup>
        </UI.Toolbar>

        <UI.Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingX: 2,
          }}
        >
          <UI.Box sx={{ paddingRight: 1, width: "50%" }}>
            <ViewPlayer
              currentUserId={currentUserId}
              model={model}
              player="X"
              store={store}
              room={room}
              dispatch={dispatch}
            />
          </UI.Box>
          <UI.Box sx={{ paddingLeft: 1, width: "50%" }}>
            <ViewPlayer
              model={model}
              currentUserId={currentUserId}
              player="O"
              store={store}
              room={room}
              dispatch={dispatch}
            />
          </UI.Box>
        </UI.Box>

        <UI.Typography
          sx={{ paddingY: 1 }}
          color="text.secondary"
          align="center"
        >
          {statusMessage}
        </UI.Typography>

        {status.type === "NotReady" && (
          <VersusScreen store={store} room={room} />
        )}

        {status.type === "Ready" && (
          <ViewBoard
            board={room.board}
            onClick={(position) =>
              dispatch(["Move", { currentUserId, position }])
            }
          />
        )}

        <EventLogList room={room} store={store} />
      </UI.FillBox>

      <UI.Drawer
        open={model.opened[0] === "Users"}
        onClose={() => dispatch(["ClosedDrawer"])}
        anchor="bottom"
      >
        <UI.List>
          {usersInRoom.map((profile) => (
            <UI.ListItemButton
              key={profile.userId}
              onClick={() => dispatch(["ClickedUser", profile])}
            >
              <UI.ListItemAvatar>
                <UI.Avatar src={profile.avatarUrl} />
              </UI.ListItemAvatar>
              <UI.ListItemText
                primary={profile.username}
                secondary={
                  <UI.Box>
                    {profile.userId === room.hostId && (
                      <UI.Chip
                        sx={{ marginRight: 1 }}
                        size="small"
                        variant="outlined"
                        label="Host"
                      />
                    )}
                    {profile.userId === currentUserId && (
                      <UI.Chip
                        sx={{ marginRight: 1 }}
                        size="small"
                        variant="outlined"
                        label="You"
                      />
                    )}
                  </UI.Box>
                }
              />
            </UI.ListItemButton>
          ))}
        </UI.List>
      </UI.Drawer>
    </>
  )
}

const EventLogList = ({
  store,
  room,
}: {
  room: Room.Room
  store: Store.Model
}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [room.log.length])

  return (
    <UI.List sx={{ flex: 1, overflowY: "scroll", overflowX: "hidden" }}>
      {room.log.map((roomEvent, index) => (
        <ViewRoomEvent key={index} store={store} roomEvent={roomEvent} />
      ))}

      <div ref={ref} />
    </UI.List>
  )
}

const ViewUserEvent = ({
  avatarUrl,
  text,
}: {
  avatarUrl?: string
  text: string
}) => {
  return (
    <UI.Box
      sx={{
        display: "flex",
        alignItems: "center",
        paddingX: 1,
        marginBottom: 1,
      }}
    >
      {avatarUrl && (
        <UI.Avatar
          sx={{ width: 24, height: 24, marginRight: 1 }}
          src={avatarUrl}
        />
      )}
      <UI.Typography>{text}</UI.Typography>
    </UI.Box>
  )
}

const ViewRoomEvent = ({
  roomEvent,
  store,
}: {
  store: Store.Model
  roomEvent: Room.Event
}) => {
  switch (roomEvent[0]) {
    case "CreatedRoom": {
      const profile = store.Profile[roomEvent[1].userId]
      return profile ? (
        <ViewUserEvent
          avatarUrl={profile.avatarUrl}
          text={`${profile.username} created room`}
        />
      ) : (
        <></>
      )
    }

    case "JoinedRoom": {
      const profile = store.Profile[roomEvent[1].userId]
      return profile ? (
        <ViewUserEvent
          avatarUrl={profile.avatarUrl}
          text={`${profile.username} joined room`}
        />
      ) : (
        <></>
      )
    }

    case "LeftRoom": {
      const profile = store.Profile[roomEvent[1].userId]
      return profile ? (
        <ViewUserEvent
          avatarUrl={profile.avatarUrl}
          text={`${profile.username} left room`}
        />
      ) : (
        <></>
      )
    }

    case "Moved": {
      const profile = store.Profile[roomEvent[1].userId]
      return profile ? (
        <ViewUserEvent
          avatarUrl={profile.avatarUrl}
          text={`${profile.username} moved`}
        />
      ) : (
        <></>
      )
    }

    case "RemovedPlayer": {
      const profile = store.Profile[roomEvent[1].userId]
      return profile ? (
        <ViewUserEvent
          avatarUrl={profile.avatarUrl}
          text={`${profile.username} removed player`}
        />
      ) : (
        <></>
      )
    }

    case "StartedPlaying": {
      const profile = store.Profile[roomEvent[1].userId]
      return profile ? (
        <ViewUserEvent
          avatarUrl={profile.avatarUrl}
          text={`${profile.username} started playing as ${roomEvent[1].player}`}
        />
      ) : (
        <></>
      )
    }

    case "StoppedPlaying": {
      const profile = store.Profile[roomEvent[1].userId]
      return profile ? (
        <ViewUserEvent
          avatarUrl={profile.avatarUrl}
          text={`${profile.username} stopped playing`}
        />
      ) : (
        <></>
      )
    }
  }
}

const viewPlayerActions =
  ({
    currentUserId,
    player,
    room,
  }: {
    currentUserId: string
    player: Board.Player
    room: Room.Room
    store: Store.Model
  }): UI.View<Msg> =>
  (dispatch) => {
    const roomPlayer = room.players[player]

    switch (roomPlayer.type) {
      case "None":
        return <>None</>

      case "User":
        if (roomPlayer.userId === currentUserId) {
          return (
            <UI.Box sx={{ paddingX: 1 }}>
              <UI.Button
                onClick={() =>
                  dispatch(["StopPlaying", { currentUserId, player }])
                }
                fullWidth
              >
                Stop Playing
              </UI.Button>
            </UI.Box>
          )
        }

        if (currentUserId === room.hostId) {
          return (
            <UI.Box sx={{ paddingX: 1 }}>
              <UI.Button
                onClick={() =>
                  dispatch(["RemovePlayer", { currentUserId, player }])
                }
                fullWidth
              >
                Remove Player
              </UI.Button>
            </UI.Box>
          )
        }

        return (
          <UI.Box sx={{ p: 2 }}>
            <UI.Typography color="text.secondary">
              No action available
            </UI.Typography>
          </UI.Box>
        )
    }
  }

const ViewPlayer = ({
  room,
  store,
  player,
  dispatch,
  model,
  currentUserId,
}: {
  currentUserId: string
  room: Room.Room
  store: Store.Model
  player: Board.Player
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const roomPlayer = room.players[player]
  const ref = useRef<HTMLButtonElement | null>(null)
  const theme = UI.useTheme()

  switch (roomPlayer.type) {
    case "None":
      return (
        <UI.ButtonBase
          ref={ref}
          sx={{
            p: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: 1,
            width: "100%",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
          }}
          onClick={() => dispatch(["StartPlaying", { currentUserId, player }])}
        >
          <UI.SvgIcon width={24} viewBox="0 0 1 1" sx={{ marginRight: 1 }}>
            <ViewSlot
              color={"#fff"}
              slot={player}
              cx={1 / 2}
              cy={1 / 2}
              r={1 / 3}
            />
          </UI.SvgIcon>
          <UI.Typography color="inherit" noWrap>
            Play
          </UI.Typography>
        </UI.ButtonBase>
      )

    case "User":
      const profile = store.Profile[roomPlayer.userId]

      return (
        <>
          <UI.ButtonBase
            ref={ref}
            sx={{
              p: 1,
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              borderRadius: 1,
              width: "100%",
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
            onClick={() => dispatch(["ClickedPlayer", player])}
          >
            <UI.SvgIcon width={24} viewBox="0 0 1 1">
              <ViewSlot
                color={theme.palette.text.primary}
                slot={player}
                cx={1 / 2}
                cy={1 / 2}
                r={1 / 3}
              />
            </UI.SvgIcon>

            <UI.Avatar
              sx={{ width: 24, height: 24, marginX: 1 }}
              src={profile?.avatarUrl}
            />

            <UI.Typography noWrap>{profile?.username}</UI.Typography>
          </UI.ButtonBase>

          <UI.Menu
            open={model.opened[0] === "Player" && model.opened[1] === player}
            anchorEl={ref.current}
            onClose={() => dispatch(["ClosedDrawer"])}
          >
            {viewPlayerActions({ currentUserId, player, room, store })(
              dispatch,
            )}
          </UI.Menu>
        </>
      )
  }
}

const ViewRoomNotReady = ({
  room,
  currentUserId,
  dispatch,
}: {
  room: Room.Room
  currentUserId: string
  dispatch: (msg: Msg) => void
}) => {
  return (
    <UI.FillBox>
      <UI.Toolbar>
        <UI.Button
          onClick={() => dispatch(["LeaveRoom", { currentUserId }])}
          sx={{ marginLeft: -1 }}
        >
          Leave
        </UI.Button>
      </UI.Toolbar>
    </UI.FillBox>
  )
}

//
//
//
//
//
//
//

export const CoverArt = () => {
  const positions: [Board.Position, Board.Slot][] = [
    [{ row: 0, column: 0 }, "X"],
    [{ row: 0, column: 1 }, "Empty"],
    [{ row: 1, column: 0 }, "Empty"],
    [{ row: 1, column: 1 }, "O"],
  ]

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const

  return (
    <svg width="100%" height="100%" viewBox="0 0 2 2">
      <rect x={0} y={0} width={2} height={2} fill={theme.background} />

      {LINES.map((line, index) => (
        <line key={index} {...line} stroke={theme.line} strokeWidth={0.1} />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <ViewSlot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  )
}

//
//
//
// View Board
//
//
//

export const theme = {
  background: "#14BDAC",
  line: "#0DA192",
  cross: "#545454",
  naught: "#F2EBD3",
}

export const ViewBoard = ({
  board,
  onClick,
}: {
  board: Board.Board
  onClick: (position: Board.Position) => void
}) => {
  return (
    <svg width={"100%"} viewBox="0 0 3 3">
      <rect width="100%" height="100%" fill={theme.background} />
      {lines.map((line, index) => (
        <line
          key={index}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={theme.line}
          strokeWidth={0.1}
        />
      ))}
      {Board.allPositions.map((position) => (
        <ViewSlot
          key={[
            position.column,
            position.row,
            Board.toSlot(board, position),
          ].join(" ")}
          slot={Board.toSlot(board, position)}
          cx={Number(position.column) + 0.5}
          cy={Number(position.row) + 0.5}
          r={0.3}
        />
      ))}

      {Board.allPositions.map((position) => (
        <rect
          key={[
            position.column,
            position.row,
            Board.toSlot(board, position),
          ].join(" ")}
          x={Number(position.column)}
          y={Number(position.row)}
          width={1}
          height={1}
          onClick={() => onClick(position)}
          fill="transparent"
        />
      ))}
    </svg>
  )
}

const lines = [
  { x1: 1, y1: 0, x2: 1, y2: 3 },
  { x1: 2, y1: 0, x2: 2, y2: 3 },
  { x1: 0, y1: 1, x2: 3, y2: 1 },
  { x1: 0, y1: 2, x2: 3, y2: 2 },
]

export const ViewSlot = ({
  slot,
  cx,
  cy,
  r,
  color,
}: {
  color?: string
  slot: Board.Slot
  r: number
  cx: number
  cy: number
}) => {
  switch (slot) {
    case "Empty":
      return <g></g>

    case "O":
      return <Naught color={color} r={r} cx={cx} cy={cy} />

    case "X":
      return <Cross color={color} r={r} cx={cx} cy={cy} />
  }
}

const Cross = ({
  cx,
  cy,
  r,
  color = theme.cross,
  strokeWidth = 0.1,
}: {
  color?: string
  r: number
  cx: number
  cy: number
  strokeWidth?: number
}) => {
  return (
    <g strokeWidth={strokeWidth} stroke={color}>
      {/* direction: \ */}
      <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
      {/* direction: / */}
      <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} />
    </g>
  )
}

const Naught = ({
  cx,
  cy,
  r,
  color = theme.naught,
  strokeWidth = 0.1,
}: {
  color?: string
  strokeWidth?: number
  r: number
  cx: number
  cy: number
}) => {
  return (
    <circle
      r={r}
      cx={cx}
      cy={cy}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="transparent"
    />
  )
}

const VersusScreen = ({
  room,
  store,
}: {
  room: Room.Room
  store: Store.Model
}) => {
  const profileX =
    room.players.X.type === "User"
      ? store.Profile[room.players.X.userId]
      : undefined

  const profileO =
    room.players.O.type === "User"
      ? store.Profile[room.players.O.userId]
      : undefined

  return (
    <svg width="100%" viewBox="0 0 1 1">
      <rect width="100%" height="100%" fill={theme.background} />

      <mask id="avatar">
        <rect x={0} y={0} width={1} height={1} fill="black" />
        <circle cx={0.5} cy={0.5} r={0.5} fill="white" />
      </mask>

      {profileX && (
        <>
          <Cross cx={0.15} cy={0.25} r={0.075} strokeWidth={0.05} />
          <SvgAvatar
            id="x-avatar"
            cx={0.4}
            cy={0.25}
            r={0.1}
            src={profileX.avatarUrl}
          />
        </>
      )}

      {profileO && (
        <>
          <Naught cx={0.55} cy={0.75} r={0.075} strokeWidth={0.05} />
          <SvgAvatar
            id="o-avatar"
            cx={0.8}
            cy={0.75}
            r={0.1}
            src={profileO.avatarUrl}
          />
        </>
      )}

      <line
        x1={0}
        y1={1}
        x2={1}
        y2={0}
        stroke={theme.line}
        strokeWidth={0.0333}
      />
      <circle cx={0.5} cy={0.5} r={0.1} fill={theme.line} />
      <text
        dominantBaseline={"middle"}
        textAnchor={"middle"}
        x={0.5}
        y={0.5}
        fontSize={0.15}
        fill={"#fff"}
        r={0.15}
      >
        vs
      </text>
    </svg>
  )
}

const SvgAvatar = ({
  id,
  src,
  cx,
  cy,
  r,
}: {
  id: string
  src: string
  cx: number
  cy: number
  r: number
}) => {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" />
        </clipPath>
      </defs>
      <image
        x={cx - r}
        y={cy - r}
        width={r * 2}
        height={r * 2}
        xlinkHref={src}
        href={src}
        clipPath={`url(#${id})`}
      />
    </>
  )
}
