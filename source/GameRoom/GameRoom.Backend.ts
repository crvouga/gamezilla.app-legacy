import * as Bridge from "../Bridge/Backend"
import { Cmd, exhaustive, Option, pipe, Result } from "../Core"
import { remove } from "../Core/Record"
import { ClientId, RoomId, UserId } from "../Data"
import { Name } from "../Games"
import * as Game from "./Game"
import {
  BackendModel,
  BackendMsg,
  CreateRoomResult,
  JoinRoomResult,
  LeaveRoomResult,
  RoomModel,
  StartGameResult,
  StopGameResult,
  ToBackend,
  ToFrontend
} from "./Types"

//
//
//
// Model
//
//
//

type Model = BackendModel

export const init: Model =  {
  games: {},
  rooms: {},
  users: {}
}

//
//
//
// Update
//
//
//

type Msg = BackendMsg

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Game": {

      const roomId = msg[1].roomId
      const gameMsg = msg[1].msg

      const room = model.rooms[roomId]

      if(!room) {
        return [model, Cmd.None]
      }

      const game = model.games[roomId]

      if(!game) {
        return [model, Cmd.None]
      }

      const [gameNew, gameCmd] = Game.Backend.update(gameMsg, game)
      
      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [roomId]: gameNew
        }
      }

      return [modelNew, pipe(gameCmd, Cmd.map((msg) => ['Game', {msg, roomId}]))]
    }
  }
}

export const updateFromFrontend = (
  clientId: ClientId.ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "Init": {
      return [
        model,
        Cmd.batch([sendToFrontend(clientId, ["Sync", model])]),
      ]
    }

    case "CreateRoom": {
      const result = createRoom(msg[1], model)
      return updateRoom(clientId, model, result, ["CreateRoomResulted", result])
    }

    case "LeaveRoom": {
      const result = leaveRoom(msg[1], model)
      return updateRoom(clientId, model, result, ["LeaveRoomResulted", result])
    }

    case "JoinRoom": {
      const result = joinRoom(msg[1], model)
      return updateRoom(clientId, model, result, ["JoinRoomResulted", result])
    }

    case "StartGame": {
      const result = startGame(msg[1], model)
      return updateRoom(clientId, model, result, ["StartGameResulted", result])
    }

    case "StopGame": {
      const result = stopGame(msg[1], model)
      return updateRoom(clientId, model, result, ["StopGameResulted", result])
    }

    default:
      return exhaustive(msg[0])
  }
}

const updateRoom = <
  TResult extends Result.Result<TProblem, Model>,
  TProblem,
>(
  clientId: ClientId.ClientId,
  model: Model,
  result: TResult,
  toFrontend: ToFrontend,
): [Model, Cmd.Cmd<BackendMsg>] => {
  if (result.type === "Err") {
    return [model, sendToFrontend(clientId, toFrontend)]
  }

  const modelNew: Model = {
    ...model,
    ...result.value,
  }

  return [
    modelNew,
    Cmd.batch([
      broadcast(["Sync", modelNew]),
      sendToFrontend(clientId, toFrontend),
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

export const startGame = (
  { userId, gameName }: { userId: UserId.UserId; gameName: Name },
  model: Model,
): StartGameResult => {
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
      [room.roomId]: Game.Backend.init(gameName)
    }
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

export const stopGame = (
  { userId }: { userId: UserId.UserId },
  model: Model,
): StopGameResult => {
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
    games: remove(room.roomId, model.games)
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
  clientIds: ClientId.ClientId | ClientId.ClientId[],
  toFrontend: ToFrontend,
) => {
  return Bridge.sendToFrontend(clientIds, ["GameRoom", toFrontend])
}
