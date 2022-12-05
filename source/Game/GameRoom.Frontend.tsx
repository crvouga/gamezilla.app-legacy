import * as Alerts from "../Alerts"
import { Cmd, exhaustive, p, RemoteData, Sub } from "../Core"
import { RoomId, UserId } from "../Data"
import * as ProfileStore from "../Profile/Profile.Store"
import * as Route from "../Route"
import { AspectRatio, Avatar, Badge, Box, Button, ButtonBase, CardActionArea, CircularProgress, Divider, FillBox, Header, IconButton, Icons, Paper, Toolbar, Typography } from "../UI"
import * as Game from "./Game.Frontend"
import { Ctx } from "./Game.Shared"
import { GameName, gameNameList } from "./Game.Types"
import {
  BackendModel, FrontendModel,
  FrontendMsg,
  FrontendRoom,
  Res,
  RoomUser,
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

export const init: [Model, Cmd<Msg>] = [
  {
    rooms: {},
    users: {},
    requests: {},
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

type OutAction = Alerts.Action<Msg> | ProfileStore.Action | Route.Action

//
//
//
// Update
//
//
//

export const update = (
  {
    ctx,
    sendToBackend,
  }: {
    ctx: Ctx
    sendToBackend: (msg: ToBackend) => Cmd
  },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {

  switch (msg[0]) {
    case "ClickedHome": {
      return [model, Route.push(["Home"])]
    }

    case "ClickedRoom": {
      return [model, Route.push(['GameRoom'])]
    }

    case "ClickedUser": {
      return [model, Route.push(["Profile", { userId: msg[1].userId }])]
    }

    case "ClickedBanner": {
      return [model, Route.push(["Game"])]
    }


    case "RoomCreate":
    case "RoomDestroy":
    case "RoomJoin":
    case "RoomLeave":
    case "ChangeHost":
    case "InputGame": {
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

    case "Game": {
      const user = model.users[ctx.currentUserId]

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

      const { game } = room

      if (!game) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.update(
        {
          ctx,
          sendToBackend: (msg) => sendToBackend(["Game", roomId, msg]),
        },
        gameMsg,
        game,
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
          Cmd.map((msg): Msg => ["Game", roomId, msg]),
        ),
      ]
    }

    case "RoomLeaveThenJoin": {
      return [model, sendToBackend(msg)]
    }

    case "RoomEndThenJoin": {
      return [model, sendToBackend(msg)]
    }

    case 'ClickedRoomDestroy': {
      return [
        model,
        Cmd.batch([
          Route.push(["Home"]),
          sendToBackend(['RoomDestroy', msg[1]])
        ])
      ];
    }

    case 'ClickedRoomLeave': {
      return [
        model,
        Cmd.batch([
          Route.push(["Home"]),
          sendToBackend(['RoomLeave', msg[1]])
        ])
      ];
    }

    default:
      return exhaustive(msg[0])
  }
}

export const updateFromBackend = (
  {
    ctx,
    sendToBackend,
  }: {
    ctx: Ctx
    sendToBackend: (msg: ToBackend) => Cmd
  },
  msg: ToFrontend,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Sync": {
      const userIds = Object.values(msg[1].users).map((user) => user.userId)

      const actions: OutAction[] = [["Profile", ["FindMany", { userIds }]]]

      const [synced, syncedCmd] = mergeWithBackendModel({
        backendModel: msg[1],
        frontendModel: model,
        sendToBackend,
      })

      return [synced, syncedCmd, actions]
    }

    case "Game": {
      const roomId = msg[1]

      const room = model.rooms[roomId]

      if (!room) {
        return [model, Cmd.None, []]
      }

      const { game } = room

      if (!game) {
        return [model, Cmd.None, []]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd, actions] = Game.updateFromBackend(
        {
          ctx,
          sendToBackend: (msg) => sendToBackend(["Game", roomId, msg]),
        },
        gameMsg,
        game,
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
          Cmd.map((msg) => ["Game", roomId, msg]),
        ),
        actions,
      ]
    }

    case "InputGame":
    case "ChangeHost":
    case "RoomCreate": {
      return updateResponse({ sendToBackend }, msg, model)
    }

    case "RoomDestroy": {
      const handled = updateResponse({ sendToBackend }, msg, model)

      const user = model.users[ctx.currentUserId]

      if (!user) {
        return handled
      }

      const room = model.rooms[user.roomId]

      if (!room) {
        return handled
      }

      if (room.hostId === ctx.currentUserId) {
        return handled
      }

      const alertActions: OutAction[] =
        msg[2].type === "Ok"
          ? [
            [
              "Alerts",
              {
                message: toRoomEndMessage({
                  ctx,
                  hostId: msg[1].userId,
                }),
                tag: "Snack",
              },
            ],
          ]
          : []

      return [handled[0], handled[1], [...handled[2], ...alertActions]]
    }

    case "RoomLeave": {
      const handled = updateResponse({ sendToBackend }, msg, model)

      if (msg[2].type === "Err") {
        return handled
      }

      const alertActions: OutAction[] =
        msg[1].userId !== ctx.currentUserId
          ? [
            [
              "Alerts",
              {
                tag: "Snack",
                message: toRoomLeaveMessage({
                  userId: msg[1].userId,
                  ctx,
                }),
              },
            ],
          ]
          : []

      return [handled[0], handled[1], [...handled[2], ...alertActions]]
    }

    case "RoomJoin": {
      const handled = updateResponse({ sendToBackend }, msg, model)

      if (msg[2].type === "Err") {
        const currentRoomId = model.users[ctx.currentUserId]?.roomId
        const currentRoom = currentRoomId
          ? model.rooms[currentRoomId]
          : undefined

        const alertActions: Alerts.Action<Msg>[] =
          msg[2].error === "already_in_room" &&
            msg[1].userId === ctx.currentUserId
            ? ctx.currentUserId === currentRoom?.hostId
              ? [
                [
                  "Alerts",
                  {
                    title: "End your current room to join this room?",
                    tag: "Conformation",
                    onConfirm: ["RoomEndThenJoin", msg[1]],
                  },
                ],
              ]
              : [
                [
                  "Alerts",
                  {
                    title: "Leave your current room to join this room?",
                    tag: "Conformation",
                    onConfirm: ["RoomLeaveThenJoin", msg[1]],
                  },
                ],
              ]
            : []

        return [handled[0], handled[1], [...handled[2], ...alertActions]]
      }

      const routeActions: OutAction[] =
        msg[1].userId === ctx.currentUserId
          ? [["Route", ["Replace", ["GameRoom"]]]]
          : []

      const alertActions: OutAction[] =
        msg[1].userId !== ctx.currentUserId
          ? [
            [
              "Alerts",
              {
                tag: "Snack",
                message: toRoomJoinMessage({
                  userId: msg[1].userId,
                  ctx,
                }),
              },
            ],
          ]
          : []

      return [
        handled[0],
        handled[1],
        [...handled[2], ...routeActions, ...alertActions],
      ]
    }
  }
}

const toRoomEndMessage = ({ ctx, hostId }: { hostId: UserId; ctx: Ctx }) => {
  const profile = ctx.profiles[hostId]
  if (profile) {
    return `${profile.username} ended the room`
  }
  return "The host ended the room"
}

const toRoomJoinMessage = ({ ctx, userId }: { userId: UserId; ctx: Ctx }) => {
  const profile = ctx.profiles[userId]
  if (profile) {
    return `${profile.username} joined the room`
  }
  return "A user joined the room"
}

const toRoomLeaveMessage = ({ ctx, userId }: { userId: UserId; ctx: Ctx }) => {
  const profile = ctx.profiles[userId]
  if (profile) {
    return `${profile.username} left the room`
  }
  return "A user left the room"
}

const updateResponse = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Res,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  if (msg[2].type === "Err") {
    return [
      {
        ...model,
        requests: { ...model.requests, [msg[0]]: RemoteData.Err(msg[2].error) },
      },
      Cmd.None,
      [],
    ]
  }

  const merged = mergeWithBackendModel({
    frontendModel: model,
    backendModel: msg[2].value,
    sendToBackend,
  })

  const userIds = Object.values(merged[0].users).map((user) => user.userId)

  const storeActions: OutAction[] = [["Profile", ["FindMany", { userIds }]]]

  return [
    {
      ...merged[0],
      requests: { ...merged[0].requests, [msg[0]]: RemoteData.Ok("None") },
    },
    merged[1],
    storeActions,
  ]
}

const mergeWithBackendModel = ({
  frontendModel,
  backendModel,
  sendToBackend,
}: {
  sendToBackend: (msg: ToBackend) => Cmd
  frontendModel: FrontendModel
  backendModel: BackendModel
}): [FrontendModel, Cmd<FrontendMsg>] => {
  const [roomsNew, roomsCmd] = Object.entries(backendModel.rooms).reduce<
    [FrontendModel["rooms"], Cmd<FrontendMsg>]
  >(
    ([rooms, cmd], [roomId, backendRoom]) => {
      if (!RoomId.is(roomId)) {
        return [rooms, cmd]
      }

      const backendGame = backendRoom.game

      if (!backendGame) {
        return [rooms, cmd]
      }

      const frontendGame = frontendModel.rooms[roomId]?.game


      if (!frontendGame) {
        const initial = Game.init({
          gameName: backendGame[0],
          sendToBackend: (msg) => sendToBackend(["Game", roomId, msg]),
        })

        const merged = Game.mergeWithBackend({
          backendModel: backendGame,
          frontendModel: initial[0],
          sendToBackend: (msg) => sendToBackend(["Game", roomId, msg]),
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
            p(initial[1], Cmd.map((msg) => ["Game", roomId, msg])),
            p(merged[1], Cmd.map((msg) => ["Game", roomId, msg])),
          ]),
        ]
      }

      const merged = Game.mergeWithBackend({
        backendModel: backendGame,
        frontendModel: frontendGame,
        sendToBackend: (msg) => sendToBackend(["Game", roomId, msg]),
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
            Cmd.map((msg): Msg => ["Game", roomId, msg]),
          ),
        ]),
      ]
    },
    [{}, Cmd.None],
  )

  return [
    {
      requests: frontendModel.requests,
      rooms: roomsNew,
      users: backendModel.users,
    },
    roomsCmd,
  ]
}


export const runAction = (
  {
    ctx,
    sendToBackend,
  }: {
    ctx: Ctx
    sendToBackend: (msg: ToBackend) => Cmd
  },
  action: Action,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (action[1][0]) {
    case "Msg": {
      const msg = action[1][1]
      return update({ sendToBackend, ctx }, msg, model)
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
  { currentUserId }: { currentUserId: UserId },
  model: Model,
): Sub<Msg> => {
  const user = model.users[currentUserId]

  if (!user) {
    return Sub.None
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return Sub.None
  }


  const { game } = room

  if (!game) {
    return Sub.None
  }

  return p(
    Game.subscriptions(`room/${room.roomId}`, game),
    Sub.map((msg) => ["Game", room.roomId, msg]),
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

export const ViewPageGame = ({
  ctx,
  model,
  $d,
}: {
  ctx: Ctx
  model: Model
  $d: (msg: Msg) => void
}) => {
  const user = model.users[ctx.currentUserId]

  if (!user) {
    return <ViewNotInRoom ctx={ctx} model={model} $d={$d} />
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return <ViewNotInRoom ctx={ctx} model={model} $d={$d} />
  }

  const { game } = room


  if (!game) {
    return <ViewNotInGame ctx={ctx} model={model} $d={$d} />
  }

  const usersInRoom = toRoomUsers(room.roomId, model)

  return (
    <>
      <Game.View
        ctx={ctx}
        $d={(msg) => $d(["Game", room.roomId, msg])}
        model={game}
      />

      <Divider />

      <Toolbar
        variant="dense"
        sx={{ paddingX: 2, justifyContent: "space-between" }}
      >
        <Button
          startIcon={<Icons.Home />}
          size="small"
          onClick={() => $d(["ClickedHome"])}
        >
          Home
        </Button>
        <Badge
          badgeContent={usersInRoom.length > 1 ? usersInRoom.length : undefined}
          color="secondary"
        >
          <Button
            startIcon={<Icons.Group />}
            size="small"
            onClick={() => $d(["ClickedRoom"])}
          >
            Room
          </Button>
        </Badge>
      </Toolbar>
    </>
  )
}

export const ViewNotInGame = (_props: {
  ctx: Ctx
  model: Model
  $d: (msg: Msg) => void
}) => {
  return <></>
}

export const ViewNotInRoom = ({
  ctx,
  model,
  $d,
}: {
  ctx: Ctx
  model: Model
  $d: (msg: Msg) => void
}) => {
  const rooms = Object.values(model.rooms)

  const header = (
    <Header
      left={
        <IconButton
          sx={{ marginLeft: -1 }}
          onClick={() => $d(["ClickedHome"])}
        >
          <Icons.Home />
        </IconButton>
      }
      title="Game Rooms"
    />
  )

  if (
    model.requests.RoomCreate?.type === "Loading" ||
    model.requests.RoomJoin?.type === "Loading"
  ) {
    return (
      <FillBox>
        {header}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </FillBox>
    )
  }

  return (
    <FillBox>
      {header}
      <Typography sx={{ paddingX: 2, marginBottom: 1 }} variant="h4">
        Games
      </Typography>

      <Box
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
          <Box key={gameName} sx={{ minWidth: 150, flex: 1 }}>
            <ViewGameCard
              key={gameName}
              gameName={gameName}
              onClick={() =>
                $d([
                  "RoomCreate",
                  {
                    userId: ctx.currentUserId,
                    roomId: RoomId.generate(),
                    gameName,
                  },
                ])
              }
            />
          </Box>
        ))}
      </Box>

      {Object.values(rooms).length > 0 && (
        <Typography
          sx={{ paddingX: 2, marginBottom: 1 }}
          variant="h6"
          color="text.secondary"
        >
          Active Rooms
        </Typography>
      )}
      <Box
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
            gameName={room?.game?.[0]}
            ctx={ctx}
            gameRoom={model}
            onClick={() =>
              $d([
                "RoomJoin",
                { roomId: room.roomId, userId: ctx.currentUserId },
              ])
            }
          />
        ))}
      </Box>
    </FillBox>
  )
}

const toRoomUsers = (roomId: RoomId, model: Model): RoomUser[] => {
  const roomUsers: RoomUser[] = []
  for (const userId in model.users) {
    if (!UserId.is(userId)) {
      continue
    }

    const user = model.users[userId]

    if (!user) {
      continue
    }

    if (user.roomId !== roomId) {
      continue
    }

    roomUsers.push(user)
  }

  return roomUsers
}

export const ViewPageRoom = ({
  model,
  $d,
  ctx,
}: {
  ctx: Ctx
  model: Model
  $d: (msg: Msg) => void
}) => {

  const user = model.users[ctx.currentUserId]

  if (!user) {
    return <ViewNotInRoom $d={$d} ctx={ctx} model={model} />
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return <ViewNotInRoom $d={$d} ctx={ctx} model={model} />
  }

  const usersInRoom = toRoomUsers(room.roomId, model)

  return (
    <FillBox>
      <Typography
        variant="h4"
        sx={{ paddingX: 2, paddingTop: 2, width: "100%" }}
        noWrap
      >
        {ctx.profiles[room.hostId]?.username ?? "..."}'s room
      </Typography>

      <Box
        sx={{
          display: "flex",
          paddingY: 1,
          paddingX: 2,
        }}
      >
        {usersInRoom.map((user) => (
          <Box
            key={user.userId}
            onClick={() => $d(["ClickedUser", user])}
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
            <Avatar src={ctx.profiles[user.userId]?.avatarUrl} />
            <Typography
              align="center"
              sx={{ marginBottom: -1 / 2, width: "100%" }}
              noWrap
            >
              {ctx.profiles[user.userId]?.username ?? "..."}
            </Typography>
            {user.userId === room.hostId ? (
              <Typography variant="subtitle2" color="text.secondary">
                Host
              </Typography>
            ) : (
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ opacity: 0 }}
              >
                Guest
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ paddingX: 2, paddingBottom: 2, display: "flex", gap: 2 }}>
        {ctx.currentUserId === room.hostId ? (
          <>
            <Button fullWidth>Change Game</Button>
            <Button
              fullWidth
              color="error"
              onClick={() => $d(["ClickedRoomDestroy", { userId: ctx.currentUserId }])}
            >
              End Room
            </Button>
          </>
        ) : (
          <>
            <Button
              fullWidth
              color="error"
              onClick={() => $d(["ClickedRoomLeave", { userId: ctx.currentUserId }])}
            >
              Leave Room
            </Button>
          </>
        )}
      </Box>
    </FillBox>
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
    <AspectRatio aspectRatio={1}>
      <ButtonBase
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

        <Box
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
          <Box
            sx={{
              width: "100%",
              padding: 1,
              paddingTop: 2,
              background: `linear-gradient(transparent, rgba(0, 0, 0, 0.6))`,
            }}
          >
            <Typography color="white" align="left" variant="h4">
              {Game.gameNameToString(gameName)}
            </Typography>
          </Box>
        </Box>
      </ButtonBase>
    </AspectRatio>
  )
}



//
//
//
// Banner
//
//
//

export const ViewBanner = ({
  currentUserId,
  route,
  model,
  $d,
  store,
}: {
  currentUserId: UserId
  route: Route.Model
  model: Model
  $d: (msg: Msg) => void
  store: ProfileStore.Model
}) => {
  if (route[0] === "GameRoom" || route[0] === "Game") {
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

  const hostProfile = store.profiles[room.hostId]

  return (
    <ButtonBase
      sx={{
        display: "flex",
        alignItems: "center",
      }}
      onClick={() => $d(["ClickedBanner"])}
    >
      {room.game && (
        <Box sx={{ width: 48, height: 48, mr: 2 }}>
          <Game.CoverArt gameName={room.game[0]} />
        </Box>
      )}

      <Typography noWrap align="left" sx={{ flex: 1 }}>
        {hostProfile ? `${hostProfile.username}'s room` : "..."}
      </Typography>

      <Icons.ChevronRight sx={{ mx: 2 }} />
    </ButtonBase>
  )
}

export const ViewCard = ({
  roomId,
  hostId,
  gameName,
  ctx,
  gameRoom,
  onClick,
}: {
  roomId: RoomId
  hostId: UserId
  gameName?: GameName
  ctx: Ctx
  gameRoom: Model
  onClick: () => void
}) => {
  const hostProfile = ctx.profiles[hostId]
  const roomCount = Object.values(gameRoom.users).filter(
    (user) => user.roomId === roomId,
  ).length
  return (
    <CardActionArea onClick={onClick}>
      <Paper variant="outlined" sx={{ overflow: "hidden", display: "flex" }}>
        <Box sx={{ width: 100 }}>
          <AspectRatio aspectRatio={1}>
            {gameName ? (
              <Game.CoverArt gameName={gameName} />
            ) : (
              <Avatar
                src={hostProfile?.avatarUrl ?? ""}
                variant="square"
                sx={{ width: "100%", height: "100%" }}
              />
            )}
          </AspectRatio>
        </Box>
        <Divider orientation="vertical" />
        <Box
          sx={{
            padding: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <Typography variant="h5" noWrap>
            {hostProfile ? `${hostProfile.username}'s room` : "..."}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" noWrap>
            {roomCount} in room
          </Typography>
        </Box>
      </Paper>
    </CardActionArea>
  )
}




