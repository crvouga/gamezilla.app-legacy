import * as Bridge from "../Bridge"
import { Cmd, exhaustive, pipe, Result, Sub, tagCmd } from "../Core"
import { remove } from "../Core/Record"
import { ClientId, RoomId, UserId } from "../Data"
import * as Game from "../Game/Game.Backend"
import { GameName } from "../Game/Game.Types"
import {
  BackendModel,
  BackendMsg,
  CreateRoomResult,
  JoinRoomResult,
  LeaveRoomResult,
  OpenGameResulted,
  Response,
  RoomModel,
  CloseGameResult,
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
  games: {},
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

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Games": {
      const roomId = msg[1]

      const game = model.games[roomId]

      if (!game) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.update(
        {
          broadcast: (msg) => broadcast(["Games", roomId, msg]),
          roomId,
        },
        gameMsg,
        game,
      )

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
      ]
    }
  }
}

export const updateFromFrontend = (
  clientId: ClientId.ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "Games": {
      const roomId = msg[1]

      const game = model.games[roomId]

      if (!game) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.updateFromFrontend(
        { clientId, roomId },
        gameMsg,
        game,
      )

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
      ]
    }

    case "CreateRoom": {
      return updateResponse(clientId, model, [
        "CreateRoomResulted",
        createRoom(msg[1], model),
      ])
    }

    case "LeaveRoom": {
      return updateResponse(clientId, model, [
        "LeaveRoomResulted",
        leaveRoom(msg[1], model),
      ])
    }

    case "JoinRoom": {
      return updateResponse(clientId, model, [
        "JoinRoomResulted",
        joinRoom(msg[1], model),
      ])
    }

    case "OpenGame": {
      return updateResponse(clientId, model, [
        "OpenGameResulted",
        openGame(msg[1], model),
      ])
    }

    case "CloseGame": {
      return updateResponse(clientId, model, [
        "CloseGameResulted",
        closeGame(msg[1], model),
      ])
    }

    default:
      return exhaustive(msg[0])
  }
}

const updateResponse = (
  clientId: ClientId.ClientId,
  model: Model,
  response: Response,
): [Model, Cmd.Cmd<BackendMsg>] => {
  if (response[1].type === "Err") {
    return [model, sendToFrontend([clientId], response)]
  }

  const modelNew: Model = {
    ...model,
    ...response[1].value,
  }

  return [
    modelNew,
    Cmd.batch([
      broadcast(["Sync", modelNew]),
      sendToFrontend([clientId], response),
    ]),
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

  const room: RoomModel = {
    roomId,
    hostId: userId,
    events: [["Created", { userId, roomId }]],
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
      [roomId]: room,
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

  const usersNew = remove(userId, model.users)

  const roomNew: RoomModel = {
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
      rooms: remove(room.roomId, model.rooms),
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
): OpenGameResulted[1] => {
  const user = model.users[userId]

  if (!user) {
    return Result.Err("user_is_not_in_a_room")
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return Result.Err("user_is_not_in_a_room")
  }

  if (room.hostId !== user.userId) {
    return Result.Err("user_is_not_the_host")
  }

  const game = model.games[room.roomId]

  if (game) {
    return Result.Err("game_already_started")
  }

  const modelNew: Model = {
    ...model,
    games: {
      ...model.games,
      [room.roomId]: Game.init({ gameName }),
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

  if (room.hostId !== user.userId) {
    return Result.Err("user_is_not_the_host")
  }

  const game = model.games[room.roomId]

  if (!game) {
    return Result.Err("game_already_stopped")
  }

  const modelNew: Model = {
    ...model,
    games: remove(room.roomId, model.games),
  }

  return Result.Ok(modelNew)
}

//
//
//
// Bridge
//
//
//

const broadcast = (toFrontend: ToFrontend) => {
  return Bridge.broadcast(["GameRoom", toFrontend])
}

const sendToFrontend = (
  clientIds: ClientId.ClientId[],
  toFrontend: ToFrontend,
) => {
  return Bridge.sendToFrontend(clientIds, ["GameRoom", toFrontend])
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

  for (const roomId in model.games) {
    if (!RoomId.is(roomId)) {
      continue
    }

    const game = model.games[roomId]

    if (!game) {
      continue
    }

    const sub = pipe(
      Game.subscriptions(roomId, game),
      Sub.map((msg): Msg => ["Games", roomId, msg]),
    )

    subs.push(sub)
  }

  return Sub.batch(subs)
}
