import { Cmd, exhaustive, p, Result, Sub } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Game from "./Game.Backend"
import {
  BackendModel,
  BackendMsg,
  BackendRoom,
  handle,
  Problem,
  Res,
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
    sendToUser: (userIds: UserId[], msg: ToFrontend) => Cmd
  },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "Games": {
      const roomId = msg[1]

      const room = model.rooms[roomId]

      if (!room) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.update(
        {
          broadcast: (msg) =>
            sendToRoom({
              sendToUser,
              model,
              roomId,
              msg: ["Games", roomId, msg],
            }),
        },
        gameMsg,
        room.game,
      )

      const roomNew: BackendRoom = {
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
          Cmd.map((msg): Msg => ["Games", roomId, msg]),
        ),
      ]
    }
  }
}

type Wire = {
  sendToClient: (msg: ToFrontend) => Cmd
  sendToUser: (userId: UserId[], msg: ToFrontend) => Cmd
  broadcast: (msg: ToFrontend) => Cmd
}

export const updateFromFrontend = (
  wire: Wire,
  msg: ToBackend,
  model: Model,
): [Model, Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "Games": {
      const roomId = msg[1]

      const room = model.rooms[roomId]

      if (!room) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.updateFromFrontend(
        {
          hostId: room.hostId,
          sendToClient: (msg) => wire.sendToClient(["Games", roomId, msg]),
          broadcast: (msg) =>
            sendToRoom({
              sendToUser: wire.sendToUser,
              model,
              roomId,
              msg: ["Games", roomId, msg],
            }),
        },
        gameMsg,
        room.game,
      )

      const roomNew: BackendRoom = {
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
          Cmd.map((msg): Msg => ["Games", roomId, msg]),
        ),
      ]
    }

    case "ChangeGame":
    case "ChangeHost":
    case "RoomJoin":
    case "RoomDestroy":
    case "RoomCreate": {
      const res: Res = [...msg, handle(msg, model)]

      if (res[2].type === "Err") {
        return [model, wire.sendToClient(res)]
      }

      return [res[2].value, wire.broadcast(res)]
    }

    case "RoomLeave": {
      const roomLeaveResult = handle(
        ["RoomLeave", { userId: msg[1].userId }],
        model,
      )
      return updateRoomLeave(wire, msg[1].userId, roomLeaveResult, model)
    }

    case "RoomLeaveThenJoin": {
      const roomLeft = handle(["RoomLeave", { userId: msg[1].userId }], model)
      const roomLeftUpdate = updateRoomLeave(
        wire,
        msg[1].userId,
        roomLeft,
        model,
      )
      if (roomLeft.type === "Err") {
        return roomLeftUpdate
      }
      const roomJoined = handle(["RoomJoin", msg[1]], roomLeftUpdate[0])
      if (roomJoined.type === "Err") {
        return [
          roomLeftUpdate[0],
          wire.sendToClient(["RoomJoin", msg[1], roomJoined]),
        ]
      }
      return [
        roomJoined.value,
        Cmd.batch([
          wire.broadcast(["RoomLeave", msg[1], roomJoined]),
          roomLeftUpdate[1],
        ]),
      ]
    }

    default:
      return exhaustive(msg[0])
  }
}

const updateRoomLeave = (
  wire: Wire,
  userId: UserId,
  result: Result<Problem, Model>,
  model: Model,
): [Model, Cmd<Msg>] => {
  const res: Res = ["RoomLeave", { userId }, result]

  if (result.type === "Err") {
    return [model, wire.sendToClient(res)]
  }

  const modelAfter = result.value

  const user = model.users[userId]

  if (!user) {
    return [modelAfter, wire.broadcast(res)]
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return [modelAfter, wire.broadcast(res)]
  }

  const [gameNew, cmd] = Game.updateRoomLeave(
    {
      broadcast: (msg) =>
        sendToRoom({
          sendToUser: wire.sendToUser,
          model: modelAfter,
          roomId: room.roomId,
          msg: ["Games", room.roomId, msg],
        }),
    },
    user.userId,
    room.game,
  )

  const roomNew: BackendRoom = {
    ...room,
    game: gameNew,
  }

  const modelNew: Model = {
    ...modelAfter,
    rooms: {
      ...modelAfter.rooms,
      [roomNew.roomId]: roomNew,
    },
  }

  return [
    modelNew,
    Cmd.batch([
      wire.broadcast(res),
      p(
        cmd,
        Cmd.map((msg): Msg => ["Games", room.roomId, msg]),
      ),
    ]),
  ]
}

const sendToRoom = ({
  model,
  sendToUser,
  roomId,
  msg,
}: {
  model: Model
  sendToUser: (userIds: UserId[], msg: ToFrontend) => Cmd
  roomId: RoomId
  msg: ToFrontend
}): Cmd => {
  const userIds: UserId[] = []

  for (const userId in model.users) {
    if (!UserId.is(userId)) {
      continue
    }

    const user = model.users[userId]

    if (!user) {
      continue
    }

    if (user.roomId === roomId) {
      userIds.push(userId)
    }
  }

  return sendToUser(userIds, msg)
}

//
//
//
//
//
//
//

export const onClientConnected = (
  { sendToClient }: { sendToClient: (msg: ToFrontend) => Cmd<Msg> },
  model: Model,
): Cmd<Msg> => {
  return sendToClient(["Sync", model])
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub<Msg> => {
  const subs: Sub<Msg>[] = []

  for (const roomId in model.rooms) {
    if (!RoomId.is(roomId)) {
      continue
    }

    const room = model.rooms[roomId]

    if (!room) {
      continue
    }

    const sub = p(
      Game.subscriptions(roomId, room.game),
      Sub.map((msg): Msg => ["Games", roomId, msg]),
    )

    subs.push(sub)
  }

  return Sub.batch(subs)
}
