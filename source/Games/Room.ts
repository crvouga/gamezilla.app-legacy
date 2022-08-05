import { Option, pipe, Result } from "../Core"
import { remove } from "../Core/Record"

//
//
//
// Model
//
//
//

export type Model = {
  rooms: {
    [roomId: RoomId]: Room
  }
  users: {
    [userId: string]: {
      userId: string
      roomId: string
    }
  }
}

export type RoomId = string

export type Room = {
  roomId: RoomId
  hostId: string
  events: Event[]
}

export type Event =
  | ["Created", { userId: string; roomId: string }]
  | ["Joined", { userId: string }]
  | ["Left", { userId: string }]

//
//
//
// Helpers
//
//
//

export const toRoom = (userId: string, model: Model): Option.Option<Room> => {
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
// Create Room
//
//
//

export type CreateRoomProblem = "user_is_already_in_a_room"

export type CreateRoomResult = Result.Result<
  CreateRoomProblem,
  { model: Model; roomId: string }
>

export const createRoom = (
  { userId, roomId }: { userId: string; roomId: RoomId },
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
  { userId, roomId }: { userId: string; roomId: string },
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
  { userId }: { userId: string },
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
