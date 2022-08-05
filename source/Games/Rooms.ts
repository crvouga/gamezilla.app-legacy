import { Option, pipe, Result } from "../Core"
import { remove } from "../Core/Record"
import { GameName } from "./Types"
import * as TicTacToe from "./TicTacToe"
import { UserId } from "../Data"
import * as RoomId from "./RoomId"

//
//
//
// Model
//
//
//

export type Model = {
  rooms: {
    [roomId: RoomId.RoomId]: Room
  }
  users: {
    [userId: UserId.UserId]: User
  }
}

export type User = {
  userId: UserId.UserId
  roomId: RoomId.RoomId
}

export type Room = {
  roomId: RoomId.RoomId
  hostId: UserId.UserId
  events: Event[]
  game: Option.Option<Game>
}

export type Game = ["TicTacToe", TicTacToe.GameModel]

export type Event =
  | ["Created", { userId: UserId.UserId; roomId: RoomId.RoomId }]
  | ["Joined", { userId: UserId.UserId }]
  | ["Left", { userId: UserId.UserId }]

//
//
//
// Init
//
//
//

export const init: Model = {
  rooms: {},
  users: {},
}

//
//
//
// Helpers
//
//
//

export const toRoom = (
  userId: UserId.UserId,
  model: Model,
): Option.Option<Room> => {
  const user = model.users[userId]

  if (!user) {
    return Option.None
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return Option.None
  }

  return Option.Some(room)
}

//
//
//
// Start Game
//
//
//

export type StartGameProblem = "user_must_be_in_room" | "user_must_be_host"

export type StartGameResult = Result.Result<StartGameProblem, Model>

export const startGame = (
  { userId, gameName }: { userId: UserId.UserId; gameName: GameName },
  model: Model,
): StartGameResult => {
  const user = model.users[userId]

  if (!user) {
    return Result.Err("user_must_be_in_room")
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return Result.Err("user_must_be_in_room")
  }

  if (room.hostId !== user.userId) {
    return Result.Err("user_must_be_host")
  }

  return Result.Ok(model)
}

//
//
//
// Create Room
//
//
//

export type CreateRoomProblem = "user_is_already_in_a_room"

export type CreateRoomResult = Result.Result<
  CreateRoomProblem,
  { model: Model; roomId: RoomId.RoomId }
>

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

  return Result.Ok({ model: modelNew, roomId })
}

//
//
//
// Join Room
//
//
//

export type JoinRoomProblem =
  | "user_is_already_in_a_room"
  | "room_does_not_exists"

export type JoinRoomResult = Result.Result<JoinRoomProblem, Model>

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
// Leave Room
//
//
//

export type LeaveRoomProblem = "user_is_not_a_room"

export type LeaveRoomResult = Result.Result<LeaveRoomProblem, Model>

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

  const roomNew: Room = {
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
