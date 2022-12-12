import { RemoteData } from "../Core/RemoteData"
import { Err, Ok, Result } from "../Core/Result"
import { RoomId } from "../Data/RoomId"
import { UserId } from "../Data/UserId"
import * as GameBackend from "./Game.Backend"
import * as Game from "./Game.Types"

//
//
//
// Model
//
//
//

export type SharedModel = {
  rooms: {
    [roomId: RoomId]: Room
  }
  users: {
    [userId: UserId]: {
      userId: UserId
      roomId: RoomId
    }
  }
}

export type BackendModel = SharedModel & {
  games: {
    [roomId: RoomId]: Game.BackendModel
  }
}

export type FrontendModel = SharedModel & {
  games: {
    [roomId: RoomId]: Game.FrontendModel
  }
  requests: {
    [key in Req[0]]?: RemoteData<Problem, "None">
  }
}

export type FrontendRoom = {
  roomId: RoomId
  hostId: UserId
  game?: Game.FrontendModel
}

export type RoomUser = {
  userId: UserId
  roomId: RoomId
}

export type Room = {
  roomId: RoomId
  hostId: UserId
}

//
//
//
// Msg
//
//
//

export type ToFrontend =
  | ["Sync", BackendModel]
  | ["Game", RoomId, Game.ToFrontend]
  | Res

export type ToBackend =
  | Req
  | ["RoomEndThenJoin", { roomId: RoomId; userId: UserId }]
  | ["RoomLeaveThenJoin", { roomId: RoomId; userId: UserId }]
  | ["Game", RoomId, Game.ToBackend]

export type BackendMsg = ["Game", RoomId, Game.BackendMsg]

export type FrontendMsg =
  | ["ClickedHome"]
  | ["ClickedRoom"]
  | ["ClickedUser", { userId: UserId }]
  | ["ClickedBanner"]
  | ["ClickedRoomLeave", { userId: UserId }]
  | ["Game", RoomId, Game.FrontendMsg]
  | ["RoomEndThenJoin", { roomId: RoomId; userId: UserId }]
  | ["RoomLeaveThenJoin", { roomId: RoomId; userId: UserId }]
  | ["ClickedRoomDestroy", { userId: UserId }]
  | Req

//
//
//
//
//

type Model = BackendModel

export type Req =
  | ["RoomCreate", { userId: UserId; roomId: RoomId; gameName?: Game.GameName }]
  | ["RoomDestroy", { userId: UserId }]
  | ["RoomJoin", { userId: UserId; roomId: RoomId }]
  | ["RoomLeave", { userId: UserId }]
  | ["InputGame", { userId: UserId; gameName?: Game.GameName }]
  | ["ChangeHost", { userId: UserId; nextHostId: UserId }]

export type Res =
  | [
    "RoomCreate",
    { userId: UserId; roomId: RoomId; gameName?: Game.GameName },
    Result<Problem, Model>,
  ]
  | ["RoomDestroy", { userId: UserId }, Result<Problem, Model>]
  | ["RoomJoin", { userId: UserId; roomId: RoomId }, Result<Problem, Model>]
  | ["RoomLeave", { userId: UserId }, Result<Problem, Model>]
  | [
    "InputGame",
    { userId: UserId; gameName?: Game.GameName },
    Result<Problem, Model>,
  ]
  | [
    "ChangeHost",
    { userId: UserId; nextHostId: UserId },
    Result<Problem, Model>,
  ]

export type Problem =
  | "must_be_host"
  | "must_be_guest"
  | "not_in_room"
  | "already_in_room"
  | "room_not_found"
  | "impossible_state_room_id_taken"
  | ChangeHostProblem

type ChangeHostProblem =
  | "next_host_not_in_room"
  | "next_host_room_not_found"
  | "next_host_must_be_in_same_room"

export const handle = (msg: Req, model: Model): Result<Problem, Model> => {
  switch (msg[0]) {
    case "RoomCreate": {
      const user = model.users[msg[1].userId]

      if (user) {
        return Err("already_in_room")
      }

      const room = model.rooms[msg[1].roomId]

      if (room) {
        return Err("impossible_state_room_id_taken")
      }

      const { gameName } = msg[1]

      const gameNew = gameName ? GameBackend.init({ gameName }) : undefined

      const roomNew: Room = {
        roomId: msg[1].roomId,
        hostId: msg[1].userId,
      }

      const userNew: RoomUser = {
        roomId: msg[1].roomId,
        userId: msg[1].userId,
      }

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [roomNew.roomId]: gameNew
        },
        rooms: {
          ...model.rooms,
          [roomNew.roomId]: roomNew,
        },
        users: {
          ...model.users,
          [userNew.userId]: userNew,
        },
      }

      return Ok(modelNew)
    }

    case "RoomDestroy": {
      const user = model.users[msg[1].userId]

      if (!user) {
        return Err("not_in_room")
      }

      const room = model.rooms[user.roomId]

      if (!room) {
        return Err("room_not_found")
      }

      if (room.hostId !== user.userId) {
        return Err("must_be_host")
      }

      const roomsNew = removeKey(room.roomId, model.rooms)

      const usersNew = filterObject(
        model.users,
        (entry) => entry[1].roomId !== user.roomId,
      )

      const modelNew: Model = {
        ...model,
        rooms: roomsNew,
        users: usersNew,
      }

      return Ok(modelNew)
    }

    case "RoomJoin": {
      const user = model.users[msg[1].userId]

      if (user) {
        return Err("already_in_room")
      }

      const userNew: RoomUser = {
        roomId: msg[1].roomId,
        userId: msg[1].userId,
      }

      const modelNew: Model = {
        ...model,
        users: {
          ...model.users,
          [msg[1].userId]: userNew,
        },
      }

      return Ok(modelNew)
    }

    case "RoomLeave": {
      const user = model.users[msg[1].userId]

      if (!user) {
        return Err("not_in_room")
      }

      const room = model.rooms[user.roomId]

      if (!room) {
        return Err("room_not_found")
      }

      if (user.userId === room.hostId) {
        return Err("must_be_guest")
      }

      const usersNew = removeKey(user.userId, model.users)

      const modelNew: Model = {
        ...model,
        users: usersNew,
      }

      return Ok(modelNew)
    }

    case "InputGame": {
      const { userId, gameName } = msg[1]

      const user = model.users[userId]

      if (!user) {
        return Err("not_in_room")
      }

      const room = model.rooms[user.roomId]

      if (!room) {
        return Err("not_in_room")
      }

      if (room.hostId !== user.userId) {
        return Err("must_be_host")
      }

      if (!gameName) {
        const modelNew: BackendModel = {
          ...model,
          games: removeKey(room.roomId, model.games)
        }

        return Ok(modelNew)
      }

      const gameNew = GameBackend.init({ gameName })

      const modelNew: BackendModel = {
        ...model,
        games: {
          ...model.games,
          [room.roomId]: gameNew
        }
      }

      return Ok(modelNew)
    }

    case "ChangeHost": {
      const user = model.users[msg[1].userId]

      if (!user) {
        return Err("not_in_room")
      }

      const room = model.rooms[user.roomId]

      if (!room) {
        return Err("room_not_found")
      }

      if (room.hostId !== user.userId) {
        return Err("must_be_host")
      }

      const nextHost = model.users[msg[1].nextHostId]

      if (!nextHost) {
        return Err("next_host_not_in_room")
      }

      const nextHostRoom = model.rooms[nextHost.roomId]

      if (!nextHostRoom) {
        return Err("next_host_room_not_found")
      }

      if (nextHostRoom.roomId !== room.roomId) {
        return Err("next_host_must_be_in_same_room")
      }

      const roomNew: Room = {
        ...room,
        hostId: nextHost.userId,
      }

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomNew.roomId]: roomNew,
        },
      }

      return Ok(modelNew)
    }
  }
}

//
//
//
// Helpers
//
//
//

const removeKey = <T>(key: keyof T, obj: T): Omit<T, keyof T> => {
  const { [key]: _value, ...rest } = obj
  return rest
}

type Entry<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T]

const filterObject = <T extends object>(
  obj: T,
  predicate: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean,
): T => {
  return Object.fromEntries(
    (Object.entries(obj) as Entry<T>[]).filter(predicate),
  ) as T
}
