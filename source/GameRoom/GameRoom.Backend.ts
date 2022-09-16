import { Cmd, exhaustive, Option, pipe, Result, Sub } from "../Core"
import { removeKey } from "../Core/Record"
import { RoomId, UserId } from "../Data"
import * as Game from "./Game.Backend"
import { GameName } from "./Game.Types"
import {
  BackendModel,
  BackendMsg,
  CloseGameResult,
  CreateRoomResult,
  JoinRoomResult,
  LeaveRoomResult,
  OpenGame_Done,
  Response,
  ToBackend,
  ToFrontend,
} from "./GameRoom.Types"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: Model = {
  rooms: {},
  users: {},
}

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (
  {
    sendToUser,
  }: {
    sendToUser: (userIds: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const sendToRoom = (
    roomId: RoomId.RoomId,
    msg: ToFrontend,
  ): Cmd.Cmd<never> => {
    const userIds = Object.values(model.users)
      .filter((user) => user.roomId === roomId)
      .map((user) => user.userId)
    return sendToUser(userIds, msg)
  }

  switch (msg[0]) {
    case "Games": {
      const roomId = msg[1]

      const room = model.rooms[roomId]

      if (!room) {
        return [model, Cmd.None]
      }

      if (room.game.type === "None") {
        return [model, Cmd.None]
      }

      const game = room.game.value

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.update(
        {
          sendToRoom: (msg) => sendToRoom(roomId, ["Games", roomId, msg]),
          roomId,
        },
        gameMsg,
        game,
      )

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomId]: {
            ...room,
            game: Option.Some(gameNew),
          },
        },
      }

      return [
        modelNew,
        pipe(
          gameCmd,
          Cmd.map((msg): Msg => ["Games", roomId, msg]),
        ),
      ]
    }
  }
}

export const updateFromFrontend = (
  {
    sendToClient,
    sendToUser,
    broadcast,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    sendToUser: (userId: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<never>
    broadcast: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  const sendToRoom = (roomId: RoomId.RoomId, msg: ToFrontend) => {
    const userIds = Object.values(model.users)
      .filter((user) => user.roomId === roomId)
      .map((user) => user.userId)
    return sendToUser(userIds, msg)
  }

  switch (msg[0]) {
    case "Games": {
      const roomId = msg[1]

      const room = model.rooms[roomId]

      if (!room) {
        return [model, Cmd.None]
      }

      if (room.game.type === "None") {
        return [model, Cmd.None]
      }

      const game = room.game.value

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.updateFromFrontend(
        {
          hostId: room.hostId,
          sendToClient: (msg) => sendToClient(["Games", roomId, msg]),
          sendToRoom: (msg) => sendToRoom(roomId, ["Games", roomId, msg]),
        },
        gameMsg,
        game,
      )

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomId]: {
            ...room,
            game: Option.Some(gameNew),
          },
        },
      }

      return [
        modelNew,
        pipe(
          gameCmd,
          Cmd.map((msg): Msg => ["Games", roomId, msg]),
        ),
      ]
    }

    case "CreateRoom": {
      return updateResponse({ sendToClient, broadcast }, model, [
        "CreateRoom_Done",
        createRoom(msg[1], model),
      ])
    }

    case "LeaveRoom": {
      return updateResponse({ sendToClient, broadcast }, model, [
        "LeaveRoom_Done",
        leaveRoom(msg[1], model),
      ])
    }

    case "JoinRoom": {
      return updateResponse({ sendToClient, broadcast }, model, [
        "JoinRoom_Done",
        joinRoom(msg[1], model),
      ])
    }

    case "OpenGame": {
      return updateResponse({ sendToClient, broadcast }, model, [
        "OpenGame_Done",
        openGame(msg[1], model),
      ])
    }

    case "CloseGame": {
      return updateResponse({ sendToClient, broadcast }, model, [
        "CloseGame_Done",
        closeGame(msg[1], model),
      ])
    }

    default:
      return exhaustive(msg[0])
  }
}

const updateResponse = (
  {
    sendToClient,
    broadcast,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    broadcast: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  model: Model,
  response: Response,
): [Model, Cmd.Cmd<BackendMsg>] => {
  if (response[1].type === "Err") {
    return [
      model,
      Cmd.batch([sendToClient(response), sendToClient(["Sync", model])]),
    ]
  }

  const modelNew = response[1].value

  const allUserIds = Object.values(modelNew.users).map((user) => user.userId)

  return [
    modelNew,
    Cmd.batch([broadcast(["Sync", modelNew]), sendToClient(response)]),
  ]
}

//
//
//
//
//
//
//

export const createRoom = (
  { userId, roomId }: { userId: UserId.UserId; roomId: RoomId.RoomId },
  model: Model,
): CreateRoomResult => {
  const user = model.users[userId]

  if (user && model.rooms[user.roomId]) {
    return Result.Err("user_is_already_in_a_room")
  }

  const modelNew: Model = {
    ...model,
    users: {
      ...model.users,
      [userId]: {
        userId,
        roomId,
      },
    },
    rooms: {
      ...model.rooms,
      [roomId]: {
        roomId,
        hostId: userId,
        events: [["Created", { userId, roomId }]],
        game: Option.None,
      },
    },
  }

  return Result.Ok(modelNew)
}

//
//
//
//
//
//
//

export const onClientConnected = (
  { sendToClient }: { sendToClient: (msg: ToFrontend) => Cmd.Cmd<Msg> },
  model: Model,
): Cmd.Cmd<Msg> => {
  return sendToClient(["Sync", model])
}

//
//
//
//
//
//
//

export const joinRoom = (
  { userId, roomId }: { userId: UserId.UserId; roomId: RoomId.RoomId },
  model: Model,
): JoinRoomResult => {
  const user = model.users[userId]

  if (user && model.rooms[user.roomId]) {
    return Result.Err("user_is_already_in_a_room")
  }

  const room = model.rooms[roomId]

  if (!room) {
    return Result.Err("room_does_not_exists")
  }

  const modelNew: Model = {
    ...model,
    rooms: {
      ...model.rooms,
      [room.roomId]: {
        ...room,
        events: [...room.events, ["Joined", { userId }]],
      },
    },
    users: {
      ...model.users,
      [userId]: {
        userId,
        roomId,
      },
    },
  }

  return Result.Ok(modelNew)
}

//
//
//
//
//
//
//

export const leaveRoom = (
  { userId }: { userId: UserId.UserId },
  model: Model,
): LeaveRoomResult => {
  const user = model.users[userId]

  if (!user) {
    return Result.Err("user_is_not_a_room")
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return Result.Err("user_is_not_a_room")
  }

  const usersNew = removeKey(userId, model.users)

  const roomNew = {
    ...room,
    events: [...room.events, ["Left", { userId }]],
  }

  if (user.userId !== room.hostId) {
    return Result.Ok({
      ...model,
      users: usersNew,
      rooms: {
        ...model.rooms,
        [room.roomId]: roomNew,
      },
    })
  }

  const nextHost = pipe(
    Object.values(model.users),
    (users) =>
      users.filter(
        (user) => user.roomId === room.roomId && user.userId !== room.hostId,
      ),
    (users) => users[0],
  )

  if (!nextHost) {
    return Result.Ok({
      ...model,
      users: usersNew,
      rooms: removeKey(room.roomId, model.rooms),
    })
  }

  const roomsNew: Model["rooms"] = {
    ...model.rooms,
    [room.roomId]: {
      ...roomNew,
      hostId: nextHost.userId,
    },
  }

  return Result.Ok({
    ...model,
    users: usersNew,
    rooms: roomsNew,
  })
}

//
//
//
//
//
//
//

export const openGame = (
  { userId, gameName }: { userId: UserId.UserId; gameName: GameName },
  model: Model,
): OpenGame_Done[1] => {
  const user = model.users[userId]

  if (!user) {
    return Result.Err("user_is_not_in_a_room")
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return Result.Err("user_is_not_in_a_room")
  }

  if (room.game.type !== "None") {
    return Result.Err("game_already_started")
  }

  const modelNew: Model = {
    ...model,
    rooms: {
      ...model.rooms,
      [room.roomId]: {
        ...room,
        game: Option.Some(Game.init({ gameName })),
      },
    },
  }

  return Result.Ok(modelNew)
}

//
//
//
//
//
//
//

export const closeGame = (
  { userId }: { userId: UserId.UserId },
  model: Model,
): CloseGameResult => {
  const user = model.users[userId]

  if (!user) {
    return Result.Err("user_is_not_in_a_room")
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return Result.Err("user_is_not_in_a_room")
  }

  if (room.game.type === "None") {
    return Result.Err("game_already_stopped")
  }

  const modelNew: Model = {
    ...model,
    rooms: {
      ...model.rooms,
      [room.roomId]: {
        ...room,
        game: Option.None,
      },
    },
  }

  return Result.Ok(modelNew)
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  const subs: Sub.Sub<Msg>[] = []

  for (const roomId in model.rooms) {
    if (!RoomId.is(roomId)) {
      continue
    }

    const room = model.rooms[roomId]

    if (!room) {
      continue
    }

    if (room.game.type === "None") {
      continue
    }

    const game = room.game.value

    const sub = pipe(
      Game.subscriptions(roomId, game),
      Sub.map((msg): Msg => ["Games", roomId, msg]),
    )

    subs.push(sub)
  }

  return Sub.batch(subs)
}
