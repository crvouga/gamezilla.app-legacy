import { Option, pipe, Result } from "../Core"
import { remove } from "../Core/Record"
import { UserId } from "../Data"
import * as Games from "../Games"
import * as RoomId from "./RoomId"
import { CreateRoomResult, initGame, JoinRoomResult, LeaveRoomResult, RoomModel, RoomsModel, StartGameResult, StopGameResult } from "./Types"

//
//
//
// Model
//
//
//

type Model = RoomsModel

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

  if (room.game.type === "Some") {
    return Result.Err("game_already_started")
  }

  const modelNew: Model = {
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
