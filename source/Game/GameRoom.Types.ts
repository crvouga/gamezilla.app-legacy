import { p, RemoteData, Result, Unit } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Game from "./Game.Types"
import * as GameBackend from "./Game.Backend"
import { removeKey } from "../Core/Record"

//
//
//
// Model
//
//
//

export type BackendModel = {
  rooms: {
    [roomId: RoomId.RoomId]: BackendRoom
  }
  users: {
    [userId: UserId.UserId]: RoomUser
  }
}

export type BackendRoom = {
  roomId: RoomId.RoomId
  hostId: UserId.UserId
  game: Game.BackendModel
}

export type FrontendModel = {
  rooms: {
    [roomId: RoomId.RoomId]: FrontendRoom
  }
  users: {
    [userId: UserId.UserId]: RoomUser
  }
  modal: "DrawerOpened" | "Closed" | "MenuOpened"
  requests: {
    CreateRoom: RemoteData.RemoteData<CreateRoomProblem, Unit>
    LeaveRoom: RemoteData.RemoteData<LeaveRoomProblem, Unit>
    JoinRoom: RemoteData.RemoteData<JoinRoomProblem, Unit>
    OpenGame: RemoteData.RemoteData<OpenGameProblem, Unit>
    CloseGame: RemoteData.RemoteData<CloseGameProblem, Unit>
  }
}

export type FrontendRoom = {
  roomId: RoomId.RoomId
  hostId: UserId.UserId
  game: Game.FrontendModel
}

export type RoomUser = {
  userId: UserId.UserId
  roomId: RoomId.RoomId
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
  | ["Games", RoomId.RoomId, Game.ToFrontend]
  | Response

export type ToBackend = Request | ["Games", RoomId.RoomId, Game.ToBackend]

export type BackendMsg = ["Games", RoomId.RoomId, Game.BackendMsg]

export type FrontendMsg =
  | ["ClickedGoHome"]
  | ["ClickedAvatars"]
  | ["ClosedDrawer"]
  | ["ClickedUser", { userId: UserId.UserId }]
  | ["ClickedBanner"]
  | ["Games", RoomId.RoomId, Game.FrontendMsg]
  | Request

export type Request = CreateRoom | LeaveRoom | JoinRoom | OpenGame | CloseGame

export type Response =
  | CreateRoom_Done
  | LeaveRoom_Done
  | JoinRoom_Done
  | OpenGame_Done
  | CloseGame_Done

//
//
//
//
//

export type LeaveRoom = ["LeaveRoom", { userId: UserId.UserId }]

export type LeaveRoom_Done = ["LeaveRoom_Done", Result.Result<LeaveRoomProblem, BackendModel>]

export type LeaveRoomProblem = "not_in_room"

export const leaveRoom = (
  { userId }: { userId: UserId.UserId },
  model: BackendModel,
): LeaveRoom_Done[1] => {
  const user = model.users[userId]

  if (!user) {
    return Result.Err("not_in_room")
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return Result.Err("not_in_room")
  }

  const usersNew = removeKey(userId, model.users)

  if (user.userId !== room.hostId) {
    return Result.Ok({
      ...model,
      users: usersNew,
    })
  }

  const nextHost = p(
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

  const roomNew: BackendRoom = {
    game: room.game,
    hostId: nextHost.userId,
    roomId: room.roomId
  }


  return Result.Ok({
    ...model,
    users: usersNew,
    rooms: {
      ...model.rooms,
      [room.roomId]: roomNew,
    },
  })
}

//
//
//
//
//


export type CreateRoom = [
  "CreateRoom",
  { roomId: RoomId.RoomId; userId: UserId.UserId; gameName: Game.GameName },
]

export type CreateRoom_Done = ["CreateRoom_Done", Result.Result<CreateRoomProblem, BackendModel>]

export type CreateRoomProblem = "already_in_room"

export const createRoom = (
  { userId, roomId, gameName }: CreateRoom[1],
  model: BackendModel,
): CreateRoom_Done[1] => {
  const user = model.users[userId]

  if (user && model.rooms[user.roomId]) {
    return Result.Err("already_in_room")
  }

  const modelNew: BackendModel = {
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
        game: GameBackend.init({ gameName })
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

export type JoinRoom = [
  "JoinRoom",
  { roomId: RoomId.RoomId; userId: UserId.UserId },
]
export type JoinRoom_Done = ["JoinRoom_Done", Result.Result<JoinRoomProblem, BackendModel>]

export type JoinRoomProblem =
  | "user_is_already_in_a_room"
  | "room_does_not_exists"

export const joinRoom = (
  { userId, roomId }: { userId: UserId.UserId; roomId: RoomId.RoomId },
  model: BackendModel,
): JoinRoom_Done[1] => {
  const user = model.users[userId]

  if (user && user.roomId !== roomId && model.rooms[user.roomId]) {
    return Result.Err("user_is_already_in_a_room")
  }

  const room = model.rooms[roomId]

  if (!room) {
    return Result.Err("room_does_not_exists")
  }

  const modelNew: BackendModel = {
    ...model,
    rooms: {
      ...model.rooms,
      [room.roomId]: room,
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

export type OpenGame = [
  "OpenGame",
  { gameName: Game.GameName; userId: UserId.UserId },
]
export type OpenGame_Done = ["OpenGame_Done", Result.Result<OpenGameProblem, BackendModel>]

export type OpenGameProblem = "not_in_room"


export const openGame = (
  { userId, gameName }: { userId: UserId.UserId; gameName: Game.GameName },
  model: BackendModel,
): OpenGame_Done[1] => {
  const user = model.users[userId]

  if (!user) {
    return Result.Err("not_in_room")
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return Result.Err("not_in_room")
  }

  const modelNew: BackendModel = {
    ...model,
    rooms: {
      ...model.rooms,
      [room.roomId]: {
        ...room,
        game: GameBackend.init({ gameName }),
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

export type CloseGame = ["CloseGame", { userId: UserId.UserId }]

export type CloseGame_Done = ["CloseGame_Done", Result.Result<CloseGameProblem, BackendModel>]

export type CloseGameProblem = "user_is_not_in_a_room" | "game_already_stopped"

export const closeGame = (
  { userId }: { userId: UserId.UserId },
  model: BackendModel,
): CloseGame_Done[1] => {
  const user = model.users[userId]

  if (!user) {
    return Result.Err("user_is_not_in_a_room")
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return Result.Err("user_is_not_in_a_room")
  }

  const modelNew: BackendModel = {
    ...model,
    rooms: {
      ...model.rooms,
      [room.roomId]: {
        ...room,
        // todo close game should be removed
        game: room.game,
      },
    },
  }

  return Result.Ok(modelNew)
}
