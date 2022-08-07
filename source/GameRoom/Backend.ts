import * as Bridge from "../Bridge/Backend"
import { ClientId } from "../Bridge/Bridge"
import { Cmd, exhaustive, Option, pipe, Result, tag } from "../Core"
import { remove } from "../Core/Record"
import { RoomId, UserId } from "../Data"
import * as Games from "../Games"
import {
  BackendModel,
  BackendMsg,
  CreateRoomResult,
  initGame,
  initRooms,
  JoinRoomResult,
  LeaveRoomResult,
  RoomModel,
  RoomsModel,
  StartGameResult,
  StopGameResult,
  ToBackend,
  ToFrontend,
} from "./Types"

//
//
//
// Model
//
//
//

type Model = BackendModel

export const init: Model = {
  rooms: initRooms,
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
  clientIds: string | string[],
  toFrontend: ToFrontend,
) => {
  return Bridge.sendToFrontend(clientIds, ["GameRoom", toFrontend])
}

//
//
//
// Update
//
//
//

export const update = (
  msg: BackendMsg,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "Noop": {
      return [model, Cmd.None]
    }
  }
}

export const updateFromFrontend = (
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "Init": {
      return [
        model,
        Cmd.batch([sendToFrontend(clientId, ["Sync", model.rooms])]),
      ]
    }

    case "CreateRoom": {
      const result = createRoom(msg[1], model.rooms)
      return updateRoom(clientId, model, result, ["CreateRoomResulted", result])
    }

    case "LeaveRoom": {
      const result = leaveRoom(msg[1], model.rooms)
      return updateRoom(clientId, model, result, ["LeaveRoomResulted", result])
    }

    case "JoinRoom": {
      const result = joinRoom(msg[1], model.rooms)
      return updateRoom(clientId, model, result, ["JoinRoomResulted", result])
    }

    case "StartGame": {
      const result = startGame(msg[1], model.rooms)
      return updateRoom(clientId, model, result, ["StartGameResulted", result])
    }

    case "StopGame": {
      const result = stopGame(msg[1], model.rooms)
      return updateRoom(clientId, model, result, ["StopGameResulted", result])
    }

    default:
      return exhaustive(msg[0])
  }
}

const updateRoom = <
  TResult extends Result.Result<TProblem, RoomsModel>,
  TProblem,
>(
  clientId: string,
  model: Model,
  result: TResult,
  toFrontend: ToFrontend,
): [Model, Cmd.Cmd<BackendMsg>] => {
  if (result.type === "Err") {
    return [model, sendToFrontend(clientId, toFrontend)]
  }

  const modelNew: Model = {
    ...model,
    rooms: result.value,
  }

  return [
    modelNew,
    Cmd.batch([
      broadcast(["Sync", modelNew.rooms]),
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
  model: RoomsModel,
): CreateRoomResult => {
  const user = model.users[userId]

  if (user && model.rooms[user.roomId]) {
    return Result.Err("user_is_already_in_a_room")
  }

  const modelNew: RoomsModel = {
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
  model: RoomsModel,
): JoinRoomResult => {
  const user = model.users[userId]

  if (user && model.rooms[user.roomId]) {
    return Result.Err("user_is_already_in_a_room")
  }

  const room = model.rooms[roomId]

  if (!room) {
    return Result.Err("room_does_not_exists")
  }

  const modelNew: RoomsModel = {
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
  model: RoomsModel,
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
      users: usersNew,
      rooms: remove(room.roomId, model.rooms),
    })
  }

  const roomsNew: RoomsModel["rooms"] = {
    ...model.rooms,
    [room.roomId]: {
      ...roomNew,
      hostId: nextHost.userId,
    },
  }

  return Result.Ok({
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
  { userId, gameName }: { userId: UserId.UserId; gameName: Games.Name },
  model: RoomsModel,
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

  if (room.game.type === "Some") {
    return Result.Err("game_already_started")
  }

  const modelNew: RoomsModel = {
    ...model,
    rooms: {
      ...model.rooms,
      [room.roomId]: {
        ...room,
        game: Option.Some(initGame(gameName)),
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

export const stopGame = (
  { userId }: { userId: UserId.UserId },
  model: RoomsModel,
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

  if (room.game.type === "None") {
    return Result.Err("game_already_stopped")
  }

  const modelNew: RoomsModel = {
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
